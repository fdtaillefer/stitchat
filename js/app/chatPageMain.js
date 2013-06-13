require(["jquery", "socket.io", "app/pageBuilder", "app/constants"], function(jQuery, io, pageBuilder, constants){
    jQuery(document).ready(function(){

        /**
         * Appends newNode to element, scrolling element back to bottom if it was previously that way.
         */
        function appendMaintainingScroll(element, newNode){

            //Remember if the element's scroll is at bottom
            var scrollBottomed = element.prop('scrollHeight') - element.scrollTop() == element.height();

            //Append the new node inside element
            element.append(newNode);

            //If scroll was at bottom, put it back to bottom
            if(scrollBottomed){
                element.scrollTop(element.prop('scrollHeight') - element.height());
            }
        }

        pageBuilder.setTemplateToElement("chatPage", {"title":"Stitchat"}, jQuery("#pageContainer"));

        var onUserMessage = function(data){

            //Append a div inside chatField
            var newLine = jQuery('<div class="userMessage"></div>');
            newLine.text(data.message);
            appendMaintainingScroll(chatDisplay, newLine);
        }

        var onSystemMessage = function(data){

            //Append a div inside chatField
            var newLine = jQuery('<div class="systemMessage"></div>');
            newLine.text(data.message);
            appendMaintainingScroll(chatDisplay, newLine);
        }


        var socket = io.connect( constants.HOST + ':' + constants.CHAT_PORT);
        var field = jQuery('#chatField');
        var sendButton = jQuery('#sendButton');
        var chatDisplay = jQuery('#chatDisplay');

        socket.on('userMessage', onUserMessage);
        socket.on('systemMessage', onSystemMessage);

        sendButton.on('click', function(event){

            //Prevent the click from sending an http request
            event.preventDefault();
            event.stopPropagation();

            //Send the message
            var data = {};
            data['message'] = field.val();
            socket.emit('sendChat', data);

            //Clear the field
            field.val('');
        });

    });
});
