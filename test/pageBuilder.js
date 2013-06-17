//Remember node's require variable, since we're about to overwrite it.
//This will allow our client-side script to access requireJS as expected when it uses require().
nodeRequire = require;
var assert = nodeRequire("assert");
var sinon = nodeRequire("sinon");
var jsdom = nodeRequire("jsdom").jsdom;

require = nodeRequire('requirejs');
require.config({
    "baseUrl": 'test/pageBuilderDependencies',
    paths: {
        "actual": '../../js/app',
        "app/pageRenderer":"../../js/app/dustRenderer",
        "app":"."
    },

    //Pass the top-level main.js/index.js require
    //function to requirejs so that node modules
    //are loaded relative to the top-level JS file.
    nodeRequire: nodeRequire
});

describe('pageBuilder', function(){

    var pageRenderer = require('app/pageRenderer');
    var pageBuilder = require('actual/pageBuilder');

    var doc = jsdom("<html><head></head><body><div id='testDiv'></div></body></html>");
    var docWindow = doc.createWindow();

    var jQuery = nodeRequire('jquery').create(docWindow);

    var renderStub;

    beforeEach(function(){
        //Stub the render method, make it always return the same thing.
        renderStub = sinon.stub(pageRenderer, "render", function(templateName, data, callback){
            callback("<span>Result</span>");
        });

        //Clear the div's html
        jQuery("#testDiv").html('');
    })

    afterEach(function(){
        renderStub.restore();
    })

    describe('.renderToElement', function(){

        it('Should ask its pageRenderer to render the template', function(){
            pageBuilder.renderToElement("Template", {"Some":"data"}, jQuery("#testDiv"));
            assert.equal(renderStub.callCount, 1);
            assert(renderStub.calledWith("Template", {"Some":"data"}));
        })

        it('Should set the element\'s html to the result ***TODO***', function(){
            pageBuilder.renderToElement("Template", {"Some":"data"}, jQuery("#testDiv"));
            assert.equal(jQuery("#testDiv").html(), "<span>Result</span>");
        })
    })

})
