var webdriverjs = require('webdriverjs');
var assert = require('assert');

var client = webdriverjs.remote({ desiredCapabilities: {browserName: 'firefox'},
    logLevel: 'silent'
});

//Doing this works but it pollutes the output.
//Also, it causes requiresjs to be configured twice and pretty much needs both configs to be the same.
//Furthermore, the selenium server still isn't started.
//Going to comment it out.
//var server = require("../server");
//server.start();


var nodeRequire = require;
require = require('requirejs');
require.config({
    "baseUrl": 'js',
    //Pass the top-level main.js/index.js require
    //function to requirejs so that node modules
    //are loaded relative to the top-level JS file.
    nodeRequire: require
});

var constants = require('app/constants');
var connectionString = constants.HOST + ":" + constants.CHAT_PORT;

var chatFieldSelector = '#chatField';
var greetingFieldSelector = '.' + constants.SYSTEM_WELCOME;

describe.skip('Chat page frontend', function(done){



    //Starting firefox is just really slow, so we'll start and end it just once.
    before(function(done){
        //Starting this is longer than the default timeout
        this.timeout(30000);

        //We'll also load the url once here, because the first time is a lot slower.
        client.init().url(connectionString, done);
    });

    after(function(done) {
        client.end(done);
        //driver.quit(done);
    });

    //We'll do a fresh connection to the server before each test
    beforeEach(function(done){
        client.url(connectionString, done);
    });

    it("Should render the page when opening", function(done) {

        //The chat field won't be present if the page hasn't rendered
        client.waitFor(chatFieldSelector, 1000, function(err, element){
            assert.equal(null, err);
            done();
        })
    });

    it("Should greet the user when opening", function(done) {
        //The chat field won't be present if the page hasn't rendered
        client.waitFor(greetingFieldSelector, 1000, function(err, element){
            assert.equal(null, err);
            done();
        })
    });
})
