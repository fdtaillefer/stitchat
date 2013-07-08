var webdriverjs = require('webdriverjs');
var client;
var SeleniumServer = require('selenium-webdriver/remote');
var fs = require('fs');
var server;

var assert = require('assert');



//Doing this works but it pollutes the output.
//Also, it causes requiresjs to be configured twice and pretty much needs both configs to be the same.
//Going to comment it out, a test mode of some kind could be added to work around those problems.
//var chatServer = require("../server");
//chatServer.start();

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
//Webdriverjs seems to expect selenium server's default port 4444,
//whilst starting a server programmatically without giving a port seems to default to 0.
var SELENIUM_PORT = 4444;

describe('Chat page frontend', function(done){

    //Starting firefox is just really slow, so we'll start and end it just once.
    before(function(done){
        //Starting this is longer than the default timeout
        this.timeout(30000);

        var jar = process.env.SELENIUM;
        assert.ok(!!jar, 'SELENIUM environment variable not set');
        assert.ok(fs.existsSync(jar), 'The specified jar does not exist: ' + jar);

        server = new SeleniumServer.SeleniumServer({jar: jar, port:SELENIUM_PORT});
        server.start();

        //We have asynchronously asked the server to start.
        //However, it is not ready to start accepting requests.
        //It will be ready when the address() promise resolves; we can't start our client till then.
        server.address().then(function(address){
            //TODO find a way to pass the server port number here rather than rely on default config
            client = webdriverjs.remote({ desiredCapabilities: {browserName: 'firefox'},
                logLevel: 'silent'
            });

            //We'll also load the url once here, because the first time is a lot slower.
            client.init().url(connectionString, done);
        });
    });

    after(function(done) {
        client.end(done);
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
