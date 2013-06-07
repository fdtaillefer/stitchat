jQuery.noConflict();

var port = 8888;


jQuery(document).ready(function(){
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


    var socket = io.connect('http://localhost:' + port);
    var field = jQuery('#chatField');
    var sendButton = jQuery('#sendButton');
    var chatDisplay = jQuery('#chatDisplay');

    socket.on('message', onMessage);

    sendButton.on('click', function(event){
        event.preventDefault();
        event.stopPropagation();
        var data = {};
        data['message'] = field.val();
        socket.emit('sendChat', data);
        field.val('');
    });

});