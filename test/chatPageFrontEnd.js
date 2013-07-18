var SeleniumServer = require('selenium-webdriver/remote');
var fs = require('fs');
var assert = require('assert');
var webdriver = require('selenium-webdriver');

//We'll have 2 separate windows, so that we can test the behavior between separate windows
var driver, driver2;
var seleniumServer;
var chatServer;

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

//Locators

//Chat feature locators
var chatFieldLocator = webdriver.By.id("chatField");
var chatDisplayLocator = webdriver.By.id("chatDisplay");
var sendButtonLocator = webdriver.By.id("sendButton");
var greetingFieldLocator = webdriver.By.className(constants.SYSTEM_GREETING_CLASS);
var chatLineLocator = webdriver.By.className(constants.USER_MESSAGE_CLASS);
var chatTextLocator = webdriver.By.className(constants.MESSAGE_TEXT_CLASS);
var chatPreambleLocator = webdriver.By.className(constants.MESSAGE_PREAMBLE_CLASS);

//Username feature locators
var beginNameChangeButtonLocator = webdriver.By.id("beginNameChangeButton");
var confirmNameChangeButtonLocator = webdriver.By.id("confirmNameChangeButton");
var cancelNameChangeButtonLocator = webdriver.By.id("cancelNameChangeButton");
var currentUsernameFieldLocator = webdriver.By.id("currentUsernameField");
var nameConfirmationFieldLocator = webdriver.By.className(constants.USERNAME_CONFIRMATION_CLASS);
var usernameExistsFieldLocator = webdriver.By.className(constants.USERNAME_EXISTS_CLASS);
var nameChangeFieldLocator = webdriver.By.id("nameChangeField");
var nameChangeFormLocator = webdriver.By.id("nameChangeForm");
var currentUsernameDisplayLocator = webdriver.By.id("currentUsernameDisplay");

//Helper functions for testing the chat

/**
 * Types and sends the text using the driver. This method also optionally makes sure the chat field is present
 * before attempting to send a message.
 * @param driver Driver that should perform the operation.
 * @param text The text to send as a chat line.
 * @param times Number of times to send the text.
 * @param waitForChatField Whether to wait for the chat field.
 * @return The promise returned by the last action this method does (so the last click of the button).
 */
function sendChatLine(driver, text, times, waitForChatField){
    if(waitForChatField){
        waitForElement(driver, chatFieldLocator, 1000);
    }
    var chatField = driver.findElement(chatFieldLocator);
    var sendButton = driver.findElement(sendButtonLocator);

    var lastPromise;

    for(var i = 0; i < times; i++){
        chatField.sendKeys(text);
        lastPromise = sendButton.click();
    }

    return lastPromise;
}

/**
 * Begins a name change event by clicking on the proper button and waiting for
 * the form to become visible.
 * @param driver Driver that should perform the operation
 */
function beginNameChange(driver){
    waitForElement(driver, beginNameChangeButtonLocator, 1000);
    var button = driver.findElement(beginNameChangeButtonLocator);
    button.click();
    waitForElement(driver, nameChangeFormLocator, 1000);
}

/**
 * Cancels an in-progress name change event by clicking on the cancel button and waiting for
 * the current name field to become visible again.
 * @param driver Driver that should perform the operation
 */
function cancelNameChange(driver){
    var button = driver.findElement(cancelNameChangeButtonLocator);
    button.click();
    waitForElement(driver, currentUsernameDisplayLocator, 1000);
}

/**
 * Changes current username to newName.
 * @param driver Driver that should perform the operation
 * @param newName Username to change to.
 */
function changeName(driver, newName){
    beginNameChange(driver);
    var field = driver.findElement(nameChangeFieldLocator);
    field.sendKeys(newName);
    var button = driver.findElement(confirmNameChangeButtonLocator);
    button.click();
    waitForElement(driver, currentUsernameDisplayLocator, 1000);
}

/**
 * Asks the driver to wait for an element identified by the locator.
 * @param driver Driver that should perform the operation.
 * @param locator A selenium locator that describes how to identify the element to wait for.
 * @param timeout How long to wait (in milliseconds) before giving up.
 * @return The promise returned by the invoked driver.wait() function.
 */
function waitForElement(driver, locator, timeout){
    return driver.wait(function() {
        return driver.isElementPresent(locator);
    }, timeout);
}


describe('Chat page frontend', function(done){

    //If we're working with a real browser, things can sometimes get slow,
    //so we'll give ourselves a bit of leeway
    this.timeout(5000);

    //Starting firefox is just really slow, so we'll start and end it just once.
    before(function(done){
        //Starting this is longer than the default timeout, and duration can vary a lot
        this.timeout(60000);

        //Start the chat server with WARNING level output and giving it the requirejs we just configured,
        //so that it won't try re-configuring it.
        chatServer = nodeRequire("../chatServer");
        chatServer.start({logLevel:1, requirejs:require});

        //Make sure the selenium server's jar location environment variable has been set and exists
        var jar = process.env.SELENIUM;
        assert.ok(!!jar, 'SELENIUM environment variable not set');
        assert.ok(fs.existsSync(jar), 'The specified jar does not exist: ' + jar);

        //Start a selenium server
        seleniumServer = new SeleniumServer.SeleniumServer({jar: jar});
        seleniumServer.start();

        //Start 2 browsers, but let's try to make them both start at the same time
        driver = new webdriver.Builder().
            usingServer(seleniumServer.address()).
            withCapabilities({'browserName': 'firefox'}).
            build();
        driver2 = new webdriver.Builder().
            usingServer(seleniumServer.address()).
            withCapabilities({'browserName': 'firefox'}).
            build();

        //Also load the url once here, because the first time is a lot slower.
        //For consistency's sake, we'll make sure each driver's username
        //has been attributed before we go on, so we can guarantee who's who.
        driver.get(connectionString);
        waitForElement(driver, greetingFieldLocator, 1000).then(function(){
            driver2.get(connectionString);
            waitForElement(driver2, greetingFieldLocator, 1000).then(function(){
                done();
            });
        });
    });

    after(function(done) {

        //Stop clients
        driver.quit().then(function(){
            driver2.quit().then(function(){

                //Stop chat server
                chatServer.stop();

                //Stop selenium server
                seleniumServer.stop().then(function(){
                    done();
                });
            });
        });
    });

    //We'll do a fresh connection to the server before each test
    beforeEach(function(done){


        //For consistency's sake, we'll make sure each driver's username
        //has been attributed before we go on, so we can guarantee who's who.
        driver.get(connectionString);
        waitForElement(driver, greetingFieldLocator, 1000).then(function(){
            driver2.get(connectionString);
            waitForElement(driver2, greetingFieldLocator, 1000).then(function(){
                done();
            });
        });
    });

    it("Should render the page when opening", function(done) {

        //The chat field won't be present if the page hasn't rendered\
        waitForElement(driver, chatFieldLocator, 1000);
        driver.isElementPresent(chatFieldLocator).then(function(present){
            assert.equal(present, true);
            done();
        });
    });

    it("Should greet the user when opening", function(done) {

        //Greeting text should appear by itself upon connection
        waitForElement(driver, greetingFieldLocator, 1000);
        driver.isElementPresent(greetingFieldLocator).then(function(present){
            assert.equal(present, true);
            done();
        });
    });

    it("Should attribute default usernames properly and display them in currentUsername field", function(done) {

        waitForElement(driver, currentUsernameFieldLocator, 1000);
        driver.findElement(currentUsernameFieldLocator).getText().then(function(text){
            assert.equal(text, "Guest");
            waitForElement(driver2, currentUsernameFieldLocator, 1000);
            driver2.findElement(currentUsernameFieldLocator).getText().then(function(text2){
                assert.equal(text2, "Guest2");
                done();
            });
        });
    });

    it("Should acknowledge the user's username when opening", function(done) {
        //Name confirmation should appear by itself upon connection
        waitForElement(driver, nameConfirmationFieldLocator, 1000);
        driver.isElementPresent(nameConfirmationFieldLocator).then(function(present){
            assert.equal(present, true);
            done();
        });
    });

    it("Should not display the name change form when opening", function(done) {
        waitForElement(driver, nameChangeFormLocator, 1000);
        driver.findElement(nameChangeFormLocator).isDisplayed().then(function(displayed){
            assert.equal(displayed, false);
            done();
        });

    });

    it("Should display the name change form after beginning the name change", function(done) {
        beginNameChange(driver);
        driver.findElement(nameChangeFormLocator).isDisplayed().then(function(displayed){
            assert.equal(displayed, true);
            done();
        });
    });

    it("Should not display the username after beginning the name change", function(done) {
        beginNameChange(driver);
        driver.findElement(currentUsernameDisplayLocator).isDisplayed().then(function(displayed){
            assert.equal(displayed, false);
            done();
        });
    });

    it("Should no longer display the name change form after canceling the name change", function(done) {
        beginNameChange(driver);
        cancelNameChange(driver);
        driver.findElement(nameChangeFormLocator).isDisplayed().then(function(displayed){
            assert.equal(displayed, false);
            done();
        });
    });

    it("Should display current user's message after it has been sent", function(done) {

        var textLine = "Line of text";
        sendChatLine(driver, textLine, 1, true);

        waitForElement(driver, chatTextLocator, 1000);
        driver.findElement(chatTextLocator).getText().then(function(text){
            assert.equal(text, textLine);
            done();
        });
    });

    it("Should not display an empty message", function(done) {
        var textLine = "";
        sendChatLine(driver, textLine, 1, true);

        waitForElement(driver, chatTextLocator, 1000).then(null, function(err){
            done();
        });
    });

    it("Should display username along with a message", function(done) {
        var textLine = "Line of text";
        sendChatLine(driver, textLine, 1, true);

        waitForElement(driver, chatPreambleLocator, 1000);
        driver.findElement(chatPreambleLocator).getText().then(function(text){
            //Looks like the reported text value gets trimmed, cause it's actually 'Guest: '.
            //No matter, it's not what we're checking.
            assert.equal(text, "Guest:");
            done();
        });
    });

    it("Should display another user's message after it has been sent", function(done) {

        var textLine = "Other line of text";
        sendChatLine(driver2, textLine, 1, true);

        waitForElement(driver, chatTextLocator, 1000);
        driver.findElement(chatTextLocator).getText().then(function(text){
            assert.equal(text, textLine);
            done();
        });
    });

    it("Should keep chatDisplay scrolled down if it is, or not scrolled down if it's not, after it receives a new message while full", function(done) {

        //Normally this would be in two separate tests, but it is a lengthy test to run.

        var textLine = "Text to fill screen. This is a big line of text because then hopefully "
        + "we can fill out the chat screen in less messages, which should help speed things up "
        + "and help us test the scroll behavior faster";
        sendChatLine(driver, textLine, 1, true);
        sendChatLine(driver, textLine, 5, false);

        chatDisplay = driver.findElement(chatDisplayLocator);

        var shouldScrollScrollTop;
        driver.executeScript("return arguments[0].scrollTop;", chatDisplay).then(function(result){
            shouldScrollScrollTop = result;
        });

        chatDisplay.click();
        chatDisplay.sendKeys(webdriver.Key.HOME);
        sendChatLine(driver, textLine, 1, false);
        var executionPromise = driver.executeScript("return arguments[0].scrollTop;", chatDisplay);
        executionPromise.then(function(result){
            assert.equal(shouldScrollScrollTop > 0, true);
            assert.equal(result, 0);
            done();
        });
    });

    it("Should change a user's name", function(done) {
        changeName(driver, "ChangedName");

        var textLine = "Line of text";
        sendChatLine(driver, textLine, 1, true);

        waitForElement(driver, chatPreambleLocator, 1000);
        driver.findElement(chatPreambleLocator).getText().then(function(text){
            //Looks like the reported text value gets trimmed, cause it's actually 'ChangedName: '.
            //No matter, it's not what we're checking.
            assert.equal(text, "ChangedName:");
            done();
        });
    });

    it("Should tell user if their name change is invalid because name exists", function(done) {
        changeName(driver, "Guest2");
        waitForElement(driver, usernameExistsFieldLocator, 1000);
        driver.isElementPresent(usernameExistsFieldLocator).then(function(present){
            assert.equal(present, true);
            done();
        });
    });
})
