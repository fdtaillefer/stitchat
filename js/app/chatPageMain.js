require(["jquery", "socket.io", "app/pageBuilder", "app/componentUtils", "app/constants"], function(jQuery, io, pageBuilder, componentUtils, constants){

    /**
     * Handles an incoming user message.
     * @param Data object describing the message.
     */
    var onUserMessage = function(data){

        //Append a div inside chatField
        var newLine = jQuery('<div class="userMessage"></div>');
        newLine.text(data.message);
        componentUtils.appendMaintainingScroll(jQuery('#chatDisplay'), newLine);
    }

    /**
     * Handles an incoming system message.
     * @param Data object describing the message.
     */
    var onSystemMessage = function(data){

        //Append a div inside chatField
        var newLine = jQuery('<div class="systemMessage"></div>');
        newLine.text(data.message);
        componentUtils.appendMaintainingScroll(jQuery('#chatDisplay'), newLine);
    }

    /**
     * Sends a chat message to the chat server.
     * @param socket The socket that will send the message
     * @param message The actual text of the message
     */
    function outputChatMessage(socket, message){

        //Build message data
        var data = {};
        data['message'] = message;

        //Send message
        socket.emit('sendChat', data);
    }

    /**
     * Performs UI tasks related to sending a chat message, as well as ouputting the message to the server.
     * @param socket The socket that will send the message
     */
    function sendChatMessage(socket){
        var chatField = jQuery('#chatField');

        outputChatMessage(socket, chatField.val());

        //Clear the field
        chatField.val('');
    }

    //Once initial page is done loading, run client-side initialization
    jQuery(document).ready(function(){

        //Render template and apply the result to the skeleton.
        //We have token data here (a static title) for now, to validate that rendering used it.
        pageBuilder.setTemplateToElement("chatPage", {"title":"Stitchat"}, jQuery("#pageContainer"));

        //Setup event handlers for chat events incoming from server
        var chatConnectionString = constants.HOST + ':' + constants.CHAT_PORT;
        var socket = io.connect(chatConnectionString);
        socket.on('userMessage', onUserMessage);
        socket.on('systemMessage', onSystemMessage);

        //Setup event handlers for graphical components
        jQuery('#sendButton').on('click', function(event){

            //Prevent the click from sending an http request
            event.preventDefault();
            event.stopPropagation();

            sendChatMessage(socket)
        });
    });
});
