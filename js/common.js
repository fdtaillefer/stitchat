require.config({
    "baseUrl": 'lib',
    "paths":{
        "jquery":"//ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min",
        "dust":"dust-core-1.2.5",
        "socket.io":"../socket.io/socket.io",
        "app":"../app"
    },
    shim: {
        'app/templates': {
            'deps': ['dust']
        },
        'dust': {
            'exports': 'dust'
        }
    }
});
