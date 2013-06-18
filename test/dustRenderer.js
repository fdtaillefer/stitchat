//Remember node's require variable, since we're about to overwrite it.
//This will allow our client-side script to access requireJS as expected when it uses require().
nodeRequire = require;
var assert = nodeRequire("assert");
var sinon = nodeRequire("sinon");

require = nodeRequire('requirejs');
//Shim config doesn't work with node, so we can't use the real dust dependency and just stub the render() method.
//Instead, we'll have to substitute our own class which will pretty much act as a stub.
//It's less graceful because the stubbed behavior is in another file, but it works.
require.config({
    "baseUrl": 'test/dustRendererDependencies',
    paths: {
        "actual": '../../js/app',
        "app":"."
    },
    //Pass the top-level main.js/index.js require
    //function to requirejs so that node modules
    //are loaded relative to the top-level JS file.
    nodeRequire: nodeRequire
});

describe('dustRenderer', function(){

    var dustRenderer = require('actual/dustRenderer');
    var dust = require('dust');
    var renderStub;

    beforeEach(function(){
        renderStub = sinon.stub(dust, "render", function(templateName, data, callback){
            if(templateName === "error"){
                callback("error", null);
            } else {
                callback(null, "success");
            }
        })
    })

    afterEach(function(){
        renderStub.restore();
    })

    describe('.render', function(){

        it('Should ask dust to render the template', function(){
            //Check that dust's render method is called exactly once, with the proper template and data.
            dustRenderer.render("Template", {"Some":"data"}, function(result){});
            assert.equal(renderStub.callCount, 1);
            assert(renderStub.calledWith("Template", {"Some":"data"}));
        })

        it('Should throw an error if dust fails to render the template', function(){
            assert.throws(function(){
                dustRenderer.render("error", {"Some":"data"}, function(result){});
            });
        })

        it('Should call the callback with the results after a successful render', function(done){
            dustRenderer.render("Template", {"Some":"data"}, function(result){
                assert.equal(result, "success");
                done();
            });
        })
    })
})
