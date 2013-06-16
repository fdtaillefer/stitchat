var assert = require("assert");
var phantom=require('node-phantom');

describe('scrollUtils', function(){

    //This script works with jQuery components, and more specifically with browser environment properties (such as scrollHeight),
    //so we need to run the tests inside a DOM environment AND with a browser. Hence the use of phantomJS.
    var _ph, _page;

    before(function(done){

        //Initialize phantomJS...
        phantom.create(function(err, ph){
            _ph = ph;

            //Create a page
            return ph.createPage(function(err, page) {
                page.onConsoleMessage = function (msg) {
                    console.log(msg);
                };

                //Open our componenUtils test html
                return page.open("test/scrollUtils.html", function(err,status) {
                    _page = page;

                    //Include jQuery
                    page.includeJs('../lib/jquery-1.10.1.min.js', function() {

                        //Include scrollUtils so we can test it
                        page.includeJs('../js/app/scrollUtils.js', function() {

                            //Initialize two global variables inside the page sandbox.
                            //These variables will point to two nodes;
                            //We'll always reset one to be scrolled down and the other to be scrolled up
                            page.evaluate(function(){
                                atBottom = jQuery("#atBottom");
                                notBottom = jQuery("#notBottom");
                            },function(err,result){

                                //Finally notify mocha that after all those async calls, before() is done running.
                                done();
                            });
                        });
                    });
                });
            });
        },{phantomPath:require('phantomjs').path})

    })

    //Reinitialize our two components before each test
    beforeEach(function(done){
        _page.evaluate(function(){
            atBottom.scrollTop(atBottom.prop('scrollHeight') - atBottom.height());
            notBottom.scrollTop(0);
        },function(err,result){
            done();
        })

    })

    describe('.isScrollAtBottom', function(){
        it("Should return false if scroll isn't at bottom and is in fact at top", function(done){
            _page.evaluate(function(){
                return isScrollAtBottom(notBottom);
            },function(err,result){
                assert.equal(result, false);
                done();
            });
        })
        it("Should return false if scroll isn't at bottom but also not at top", function(done){
            _page.evaluate(function(){
                notBottom.scrollTop(1);
                return isScrollAtBottom(notBottom);
            },function(err,result){
                assert.equal(result, false);
                done();
            });
        })
        it("Should return true if scroll is at bottom", function(done){
            _page.evaluate(function(){
                return isScrollAtBottom(atBottom);
            },function(err,result){
                assert.equal(result, true);
                done();
            });
        })
    })

    describe('.scrollToBottom', function(){
        it("Should make an element scrolled down if it isn't", function(done){
            //This test depends on isScrollAtBottom, so its result is unreliable if that method's tests fail.
            _page.evaluate(function(){
                scrollToBottom(notBottom);
                return isScrollAtBottom(notBottom);
            },function(err,result){
                assert.equal(result, true);
                done();
            });
        })
        it("Should maintain an element scrolled down if it already is", function(done){
            //This test depends on isScrollAtBottom, so its result is unreliable if that method's tests fail.
            _page.evaluate(function(){
                scrollToBottom(atBottom);
                return isScrollAtBottom(atBottom);
            },function(err,result){
                assert.equal(result, true);
                done();
            });
        })
    })

    describe('.appendMaintainingScroll', function(){
        it("Should properly append the new element", function(done){
            _page.evaluate(function(){

                //Append a new node
                var newLine = jQuery('<div id="properAppend"></div>');
                newLine.text("There");
                appendMaintainingScroll(atBottom, newLine);

                //To make sure the node was appended, get atBottom's last child and make sure it's the node
                return atBottom.children().last().attr('id');
            },function(err,result){
                assert.equal(result, "properAppend");
                done();
            });
        })

        it("Should not touch an element's scroll if not at bottom", function(done){
            _page.evaluate(function(){

                notBottom.scrollTop(1);

                //Append a new node
                var newLine = jQuery('<div></div>');
                appendMaintainingScroll(notBottom, newLine);

                //Return the container's "new" scrollTop
                return notBottom.scrollTop();
            },function(err,result){
                assert.equal(result, 1);
                done();
            });
        })

        it("Should scroll down an element if at bottom", function(done){
            //This test depends on isScrollAtBottom, so its result is unreliable if that method's tests fail.
            _page.evaluate(function(){

                //Append a new node
                var newLine = jQuery('<div></div>');
                appendMaintainingScroll(atBottom, newLine);

                //Return whether the container's at bottom
                return isScrollAtBottom(atBottom);
            },function(err,result){
                assert.equal(result, true);
                done();
            });
        })
    })

    after(function(){
        _ph.exit();
    })
})
