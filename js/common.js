/**
 * Common configuration of requireJS, should be required by any page's javascript entry point.
 */
require.config({
    "baseUrl": 'lib',
    "paths":{
        "jquery":"//ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min",
        "dust":"dust-core-1.2.5",
        "socketio":"../socket.io/socket.io",
        "app":"../app",
        //Define template renderer here
        "app/pageRenderer":"../app/dustRenderer"
    },
    shim: {
        //The code in the generated templates expects to have dust available, to register those templates.
        'app/templates': {
            'deps': ['dust']
        },
        'dust': {
            'exports': 'dust'
        }
    }
});
