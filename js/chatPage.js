var port = 8888;

require.config({
    "paths":{
        "jquery":"//ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min",
        "dust":"dust-core-1.2.5",
        "socket.io":"../socket.io/socket.io"
    },
    shim: {
        'templates': {
            'deps': ['dust']
        },
        'dust': {
            'exports': 'dust'
        }
    }
});

require(["jquery", "socket.io", "pageBuilder", "constants"], function(jQuery, io, pageBuilder, constants){
    jQuery(document).ready(function(){

        pageBuilder.setTemplateToElement("chatPage", {"title":"Stitchat"}, jQuery("#pageContainer"));

        function onMessage(data){
            if(data.message){

                //Remember if the chatField's scroll is at bottom
                var scrollBottomed = chatDisplay.prop('scrollHeight') - chatDisplay.scrollTop() == chatDisplay.height();

                //Append a div inside chatField
                var newLine = jQuery('<div class="chatLine"></div>');
                chatDisplay.append(newLine);
                newLine.text(data.message);

                //If scroll was at bottom, put it back to bottom
                if(scrollBottomed){
                    chatDisplay.scrollTop(chatDisplay.prop('scrollHeight') - chatDisplay.height())
                }
            } else {
                console.log('Message with no message? : ', data);
            }
        }


        var socket = io.connect('http://localhost:' + constants.CHAT_PORT);
        var field = jQuery('#chatField');
        var sendButton = jQuery('#sendButton');
        var chatDisplay = jQuery('#chatDisplay');

        socket.on('message', onMessage);

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
