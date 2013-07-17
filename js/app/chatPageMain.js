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
        newLine.text('Hello! Welcome to Stitchat!');
        scrollUtils.appendMaintainingScroll(jQuery('#chatDisplay'), newLine);
    }

    /**
     * Handles an incoming confirmation of current user's username
     */
    var onUsernameConfirmation = function(data){
        //Append a div inside chatField
        var newLine = jQuery('<div class="' + constants.SYSTEM_MESSAGE_CLASS + ' '
            + constants.USERNAME_CONFIRMATION_CLASS + '"></div>');
        newLine.text('You are now known as ' + data.username);
        scrollUtils.appendMaintainingScroll(jQuery('#chatDisplay'), newLine);

        //Update field that displays the username
        var usernameDisplayField = jQuery('#currentUsernameField');
        usernameDisplayField.text(data.username);
    }

    /**
     * Handles an incoming message that a name change failed because the name already exists.
     */
    var onUsernameExists = function(data){
        //Append a div inside chatField
        var newLine = jQuery('<div class="' + constants.SYSTEM_MESSAGE_CLASS + ' '
            + constants.USERNAME_EXISTS_CLASS + '"></div>');
        newLine.text('Could not change names. The name ' + data.username + ' is already in use.');
        scrollUtils.appendMaintainingScroll(jQuery('#chatDisplay'), newLine);
    }

    /**
     * Performs UI tasks related to sending a chat message, as well as ouputting the message to the server.
     */
    function sendChatMessage(){
        var chatField = jQuery('#chatField');
        var textLine = chatField.val();

        //If text is empty, don't bother sending
        if(jQuery.trim(textLine) !== ''){
            chatConnection.outputChatMessage(textLine);

            //Clear the field
            chatField.val('');
        }
    }

    /**
     * This method begins the name change procedure.
     * It hides the currentName display, and shows and initializes the name change form.
     */
    function beginNameChange(){

        //Hide the current name display, and show the name change form
        var nameDisplay = jQuery('#currentUsernameDisplay');
        var nameChangeForm = jQuery('#nameChangeForm');
        nameDisplay.addClass('hidden');
        nameChangeForm.removeClass('hidden');

        //Update the text field to show current name
        var usernameDisplayField = jQuery('#currentUsernameField');
        var nameChangeField = jQuery('#nameChangeField');
        nameChangeField.val(usernameDisplayField.text());
        nameChangeField.focus();
    }

    /**
     * This method ends the name change procedure, regardless of whether it was canceled or completed.
     * It hides the name change form, and shows the currentName display.
     */
    function endNameChange(){
        var nameDisplay = jQuery('#currentUsernameDisplay');
        var nameChangeForm = jQuery('#nameChangeForm');
        nameDisplay.removeClass('hidden');
        nameChangeForm.addClass('hidden');
    }

    /**
     * Performs UI tasks related to sending a name change, as well as ouputting the message to the server.
     */
    function sendNameChange(){
        var nameChangeField = jQuery('#nameChangeField');
        chatConnection.outputNameChange(nameChangeField.val());

        nameChangeField.val('');

        endNameChange();
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
        chatConnection.onUsernameConfirmation(onUsernameConfirmation);
        chatConnection.onUsernameExists(onUsernameExists);

        //Setup event handlers for graphical components
        jQuery('#sendButton').on('click', function(event){

            //Prevent the click from sending an http request
            event.preventDefault();
            event.stopPropagation();

            sendChatMessage()
        });

        jQuery('#beginNameChangeButton').on('click', function(event){
            beginNameChange();
        });

        jQuery('#cancelNameChangeButton').on('click', function(event){
            endNameChange();
        });

        jQuery('#confirmNameChangeButton').on('click', function(event){
             //Prevent the click from sending an http request
            event.preventDefault();
            event.stopPropagation();

            sendNameChange();
        });

        jQuery("#nameChangeField").focus(function(){
            // Select input field contents
            this.select();
        });


    });
});

