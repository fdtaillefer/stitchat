/**
 * The main javascript of the chat page.
 * Contains code that pertains to the view.
 */
require(["jquery", "app/pageBuilder", "app/chatConnection", "app/scrollUtils", "app/constants"], function(jQuery, pageBuilder, chatConnection, scrollUtils, constants){

    /**
     * Handles an incoming user message.
     * @param data object describing the message.
     */
    var onUserMessage = function(data){

        //Append a div inside chatField
        var newLine = jQuery('<div class="'+ constants.USER_MESSAGE_CLASS +'"></div>');
        var preamble = jQuery('<span class="' + constants.MESSAGE_PREAMBLE_CLASS + '"></span>');
        preamble.text(data.username + ': ');
        var text = jQuery('<span class="' + constants.MESSAGE_TEXT_CLASS + '"></span>');
        text.text(data.message);
        newLine.append(preamble, text);
        //newLine.text(data.message);
        scrollUtils.appendMaintainingScroll(jQuery('#chatDisplay'), newLine);
    }

    /**
     * Handles an incoming system greeting.
     * @param data object describing the message.
     */
    var onSystemGreeting = function(data){

        //Append a div inside chatField
        var newLine = jQuery('<div class="' + constants.SYSTEM_MESSAGE_CLASS + ' '
            + constants.SYSTEM_GREETING_CLASS + '"></div>');
        newLine.text('Hello, ' + data.username + '! Welcome to Stitchat!');
        scrollUtils.appendMaintainingScroll(jQuery('#chatDisplay'), newLine);
    }

    /**
     * Performs UI tasks related to sending a chat message, as well as ouputting the message to the server.
     */
    function sendChatMessage(){
        var chatField = jQuery('#chatField');
        chatConnection.outputChatMessage(chatField.val());

        //Clear the field
        chatField.val('');
    }

    //Once initial page is done loading, run client-side initialization
    jQuery(document).ready(function(){

        //Render template and apply the result to the skeleton.
        //We have token data here (a static title) for now, to validate that rendering used it.
        pageBuilder.renderToElement("chatPage", {"title":"Stitchat"}, jQuery("#pageContainer"));

        //Setup event handlers for chat events incoming from server
        chatConnection.connect();
        chatConnection.onUserMessage(onUserMessage);
        chatConnection.onSystemGreeting(onSystemGreeting);

        //Setup event handlers for graphical components
        jQuery('#sendButton').on('click', function(event){

            //Prevent the click from sending an http request
            event.preventDefault();
            event.stopPropagation();

            sendChatMessage()
        });
    });
});
