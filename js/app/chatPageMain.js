/**
 * The main javascript of the chat page.
 * Contains code that pertains to the view.
 */
require(["jquery", "app/pageBuilder", "app/chatConnection", "app/scrollUtils", "app/constants"], function(jQuery, pageBuilder, chatConnection, scrollUtils, constants){

    /**
     * Appends a system message. The message will have the SYSTEM_MESSAGE_CLASS
     * as well as any other found in classes.
     * @text Text of the system message
     * @classes A list of additional classes that the element should have.
     */
    function appendSystemMessage(text, classes){
        var otherClasses = '';
        for(var i = 0; i < classes.length; i++){
            otherClasses += ' ' + classes[i];
        }

        var newLine = jQuery('<div class="' + constants.SYSTEM_MESSAGE_CLASS
            + otherClasses + '"></div>');
        newLine.text(text);
        scrollUtils.appendMaintainingScroll(jQuery('#chatDisplay'), newLine);
    }

    /**
     * Handles an incoming event of a chat message.
     * @param data object describing the message.
     */
    var onChatMessage = function(data){

        //Append a div inside chatField
        var newLine = jQuery('<div class="'+ constants.USER_MESSAGE_CLASS +'"></div>');
        var preamble = jQuery('<span class="' + constants.MESSAGE_PREAMBLE_CLASS + ' ' + constants.PREAMBLE_CLASS + '"></span>');
        preamble.text(data.username + ': ');
        var text = jQuery('<span class="' + constants.MESSAGE_TEXT_CLASS + ' ' + constants.TEXT_CONTENTS_CLASS + '"></span>');
        text.text(data.message);
        newLine.append(preamble, text);
        scrollUtils.appendMaintainingScroll(jQuery('#chatDisplay'), newLine);
    }

    /**
     * Handles an incoming event of a sent whisper confirmation.
     * @param data object describing the message.
     */
    var onWhisperSent = function(data){

        //Append a div inside chatField
        var newLine = jQuery('<div class="'+ constants.WHISPER_CLASS +'"></div>');
        var preamble = jQuery('<span class="' + constants.WHISPER_PREAMBLE_CLASS + ' ' + constants.PREAMBLE_CLASS + '"></span>');
        preamble.text('To ' + data.username + ': ');
        var text = jQuery('<span class="' + constants.WHISPER_TEXT_CLASS + ' ' + constants.TEXT_CONTENTS_CLASS + '"></span>');
        text.text(data.message);
        newLine.append(preamble, text);
        scrollUtils.appendMaintainingScroll(jQuery('#chatDisplay'), newLine);
    }

    /**
     * Handles an incoming event of a whisper from another user.
     * @param data object describing the message.
     */
    var onWhisperReceived = function(data){

        //Append a div inside chatField
        var newLine = jQuery('<div class="'+ constants.WHISPER_CLASS +'"></div>');
        var preamble = jQuery('<span class="' + constants.WHISPER_PREAMBLE_CLASS + ' ' + constants.PREAMBLE_CLASS + '"></span>');
        preamble.text('From ' + data.username + ': ');
        var text = jQuery('<span class="' + constants.WHISPER_TEXT_CLASS + ' ' + constants.TEXT_CONTENTS_CLASS + '"></span>');
        text.text(data.message);
        newLine.append(preamble, text);
        scrollUtils.appendMaintainingScroll(jQuery('#chatDisplay'), newLine);
    }

    /**
     * Handles an incoming event of a system greeting.
     * @param data object describing the message.
     */
    var onSystemGreeting = function(data){
        appendSystemMessage('Hello! Welcome to Stitchat!', [constants.SYSTEM_GREETING_CLASS]);
    }

    /**
     * Handles an incoming event that a name change succeeded.
     * @param data object describing the message.
     */
    var onUsernameConfirmation = function(data){
        appendSystemMessage('You are now known as ' + data.username + '.', [constants.USERNAME_CONFIRMATION_CLASS]);

        //Update the field that displays the username
        var usernameDisplayField = jQuery('#currentUsernameField');
        usernameDisplayField.text(data.username);
    }

    /**
     * Handles an incoming event signifying that a user exists.
     * @param data object describing the message.
     */
    var onUserExists = function(data){
        appendSystemMessage('The user ' + data.username + ' exists.',
            [constants.USER_EXISTS_CLASS]);
    }

    /**
     * Handles an incoming event that a name change failed because the name already exists.
     * @param data object describing the message.
     */
    var onUserNotExists = function(data){
        appendSystemMessage('The user ' + data.username + ' doesn\'t exist.',
            [constants.USER_NOT_EXISTS_CLASS]);
    }

    /**
     * Handles an incoming event that a user has joined the chat.
     * @param data object describing the message.
     */
    var onUserJoin = function(data){
        appendSystemMessage(data.username + ' has joined the chat.',
            [constants.USER_JOINED_CLASS]);
    }

    /**
     * Handles an incoming event that a user has left the chat.
     * @param data object describing the message.
     */
    var onUserLeave = function(data){
        appendSystemMessage(data.username + ' has left the chat.',
            [constants.USER_LEFT_CLASS]);
    }

    /**
     * Handles an incoming event that a user has changed their name.
     * @param data object describing the message.
     */
    var onUserRename = function(data){
        appendSystemMessage(data.oldUsername + ' is now known as ' + data.newUsername + '.',
            [constants.USER_RENAMED_CLASS]);
    }

    /**
     * Performs UI tasks related to sending a chat message, as well as ouputting the message to the server.
     */
    function sendChatMessage(){
        var chatField = jQuery('#chatField');
        var textLine = chatField.val();

        //If text is empty, don't bother sending
        if(jQuery.trim(textLine) !== ''){

            var chatTargetField = jQuery('#chatTarget');
            var chatTarget = jQuery.trim(chatTargetField.val());

            //If no target, send a public line of chat
            if(chatTarget === ''){
                chatConnection.outputChatMessage(textLine);
            }//If there's a target, send a whisper
            else {
                chatConnection.outputWhisper(textLine, chatTarget);
            }


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
        var newName = jQuery.trim(nameChangeField.val());
        //If text is empty, don't bother sending
        if(newName !== ''){
            chatConnection.outputNameChange(newName);

            nameChangeField.val('');

            endNameChange();
        }
    }

    //Once initial page is done loading, run client-side initialization
    jQuery(document).ready(function(){

        //Render template and apply the result to the skeleton.
        //We have token data here (a static title) for now, to validate that rendering used it.
        pageBuilder.renderToElement("chatPage", {"title":"Stitchat"}, jQuery("#pageContainer"));

        //Setup event handlers for chat events incoming from server
        chatConnection.connect();
        chatConnection.onChatMessage(onChatMessage);
        chatConnection.onWhisperSent(onWhisperSent);
        chatConnection.onWhisperReceived(onWhisperReceived);
        chatConnection.onSystemGreeting(onSystemGreeting);
        chatConnection.onUsernameConfirmation(onUsernameConfirmation);
        chatConnection.onUserExists(onUserExists);
        chatConnection.onUserNotExists(onUserNotExists);
        chatConnection.onUserJoin(onUserJoin);
        chatConnection.onUserLeave(onUserLeave);
        chatConnection.onUserRename(onUserRename);

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

