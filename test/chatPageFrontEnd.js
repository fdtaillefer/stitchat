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
var chatTargetFieldLocator = webdriver.By.id("chatTarget");
var chatDisplayLocator = webdriver.By.id("chatDisplay");
var sendButtonLocator = webdriver.By.id("sendButton");
var greetingFieldLocator = webdriver.By.className(constants.SYSTEM_GREETING_CLASS);
var chatLineLocator = webdriver.By.className(constants.USER_MESSAGE_CLASS);
var chatTextLocator = webdriver.By.className(constants.MESSAGE_TEXT_CLASS);
var chatPreambleLocator = webdriver.By.className(constants.MESSAGE_PREAMBLE_CLASS);
var userJoinedFieldLocator = webdriver.By.className(constants.USER_JOINED_CLASS);
var userLeftFieldLocator = webdriver.By.className(constants.USER_LEFT_CLASS);
var userRenamedFieldLocator = webdriver.By.className(constants.USER_RENAMED_CLASS);

//Whisper locators
var whisperLineLocator = webdriver.By.className(constants.WHISPER_CLASS);
var whisperTextLocator = webdriver.By.className(constants.WHISPER_TEXT_CLASS);
var whisperPreambleLocator = webdriver.By.className(constants.WHISPER_PREAMBLE_CLASS);
var userNotExistsFieldLocator = webdriver.By.className(constants.USER_NOT_EXISTS_CLASS);

//Username feature locators
var nameConfirmationFieldLocator = webdriver.By.className(constants.USERNAME_CONFIRMATION_CLASS);
var userExistsFieldLocator = webdriver.By.className(constants.USER_EXISTS_CLASS);

var nameChangeFormLocator = webdriver.By.id("nameChangeForm");
var nameChangeFieldLocator = webdriver.By.id("nameChangeField");
var confirmNameChangeButtonLocator = webdriver.By.id("confirmNameChangeButton");
var cancelNameChangeButtonLocator = webdriver.By.id("cancelNameChangeButton");

var currentUsernameDisplayLocator = webdriver.By.id("currentUsernameDisplay");
var currentUsernameFieldLocator = webdriver.By.id("currentUsernameField");
var beginNameChangeButtonLocator = webdriver.By.id("beginNameChangeButton");

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

    //Clear target field
    setChatTarget(driver, '', waitForChatField);

    //Send the actual text line
    return outputText(driver, text, times, waitForChatField);
}

/**
 * Types and sends a whisper using the driver. This method also optionally makes sure the chat field is present
 * before attempting to send a message.
 * @param driver Driver that should perform the operation.
 * @param text The text to send as a chat line.
 * @param target User to send the whisper to.
 * @param waitForChatField Whether to wait for the chat field.
 * @return The promise returned by the last action this method does (so the last click of the button).
 */
function sendWhisper(driver, text, target, waitForChatField){

    setChatTarget(driver, target, waitForChatField);

    //Send the actual text line
    return outputText(driver, text, 1, waitForChatField);
}

/**
 * Types text in the text field and then sends it, regardless of the target.
 * @param driver Driver that should perform the operation.
 * @param text The text to send as a chat line.
 * @param times Number of times to send the text.
 * @param waitForChatField Whether to wait for the chat field.
 * @return The promise returned by the last action this method does (so the last click of the button).
 */
function outputText(driver, text, times, waitForChatField){
    if(waitForChatField){
        waitForElementPresent(driver, chatFieldLocator, 1000);
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
 * Sets the target of the next chat message.
 * @param driver Driver that should perform the operation
 * @param target Name of the target
 * @param waitForTargetField Whether to wait for the chat target field.
 */
function setChatTarget(driver, target, waitForTargetField){
    if(waitForTargetField){
        waitForElementPresent(driver, chatTargetFieldLocator, 1000);
    }
    var chatTargetField = driver.findElement(chatTargetFieldLocator);
    chatTargetField.clear();
    chatTargetField.sendKeys(target);
}

/**
 * Begins a name change event by clicking on the proper button and waiting for
 * the form to become visible.
 * @param driver Driver that should perform the operation
 */
function beginNameChange(driver){
    waitForElementPresent(driver, beginNameChangeButtonLocator, 1000);
    var button = driver.findElement(beginNameChangeButtonLocator);
    button.click();
    waitForElementDisplayed(driver, nameChangeFormLocator, 1000);
}

/**
 * Cancels an in-progress name change event by clicking on the cancel button and waiting for
 * the current name field to become visible again.
 * @param driver Driver that should perform the operation
 */
function cancelNameChange(driver){
    var button = driver.findElement(cancelNameChangeButtonLocator);
    button.click();
    waitForElementDisplayed(driver, currentUsernameDisplayLocator, 1000);
}

/**
 * Changes current username to newName.
 * @param driver Driver that should perform the operation
 * @param newName Username to change to.
 * @param returnWithoutWaiting Optional, causes the operation to skip its normal behavior
 * of waiting for the username display to become visible again.
 * Useful only when sending an empty name.
 */
function changeName(driver, newName, returnWithoutWaiting){

    beginNameChange(driver);
    var field = driver.findElement(nameChangeFieldLocator);
    field.clear();
    field.sendKeys(newName);
    var button = driver.findElement(confirmNameChangeButtonLocator);
    button.click();
    if(returnWithoutWaiting){
        return;
    }
    waitForElementDisplayed(driver, currentUsernameDisplayLocator, 1000);
}

/**
 * Asks the driver to wait for an element identified by the locator.
 * @param driver Driver that should perform the operation.
 * @param locator A selenium locator that describes how to identify the element to wait for.
 * @param timeout How long to wait (in milliseconds) before giving up.
 * @return The promise returned by the last driver operation.
 */
function waitForElementPresent(driver, locator, timeout){
    return driver.wait(function() {
        return driver.isElementPresent(locator);
    }, timeout);
}

/**
 * Asks the driver to wait for an element identified by the locator to be displayed.
 * @param driver Driver that should perform the operation.
 * @param locator A selenium locator that describes how to identify the element to wait for.
 * @param timeout How long to wait (in milliseconds) before giving up.
 * @return The promise returned by the last driver operation.
 */
function waitForElementDisplayed(driver, locator, timeout){
    return driver.wait(function() {
        return driver.findElement(locator).isDisplayed();
    }, timeout);
}

//Assertion functions, to ease test readability when using selenium-webdriver

/**
 * A helper function that asserts the presence of an element, after optionally giving it some time to appear.
 * @param driver Driver that should perform the test
 * @param locator Locator to find the element
 * @param timeout Optional, time (in milliseconds) to wait for the element to appear.
 * @param done Optional, a done callback to invoke if and when the assert succeeds.
 * @return The promise returned by the last driver operation.
 */
function assertPresent(driver, locator, timeout, done){
    if(timeout){
        waitForElementPresent(driver, locator, timeout);
    }
    return driver.isElementPresent(locator).then(function(present){
        assert.equal(present, true, "Element " + locator + "should have been found.");
        if(done){
            done();
        }
    });
}

/**
 * A helper function that asserts the absence of an element, after optionally giving it some time to appear.
 * @param driver Driver that should perform the test
 * @param locator Locator to find the element
 * @param timeout Optional, time (in milliseconds) to wait for the element to appear
 * @param done Optional, a done callback to invoke if and when the assert succeeds.
 * @return The promise returned by the last driver operation.
 */
function assertAbsent(driver, locator, timeout, done){
    if(timeout){

        //If there is a timeout, wait for the element.
        //If it appears, throw an error. If we reach the timeout, all is well.
        return waitForElementPresent(driver, locator, timeout).then(function(){
            throw "Element " + locator + " should not have been found.";
        }, function(err){
            //Eat the error, it's the behavior we wanted.
            if(done){
                done();
            }
        });
    } else {
        //If there is no timeout, we can simply check if element is present
        return driver.isElementPresent(locator).then(function(present){
            assert.equal(present, false, "Element " + locator + "should not have been found.");
            if(done){
                done();
            }
        });
    }
}

/**
 * A helper function that asserts that an element is displayed, after optionally giving it some time to be displayed.
 * @param driver Driver that should perform the test
 * @param locator Locator to find the element
 * @param timeout Optional, time (in milliseconds) to wait for the element to be displayed.
 * @param done Optional, a done callback to invoke if and when the assert succeeds.
 * @return The promise returned by the last driver operation.
 */
function assertDisplayed(driver, locator, timeout, done){
    if(timeout){
        waitForElementDisplayed(driver, locator, timeout);
    }
    return driver.findElement(locator).isDisplayed().then(function(displayed){
        assert.equal(displayed, true, "Element " + locator + "should be displayed.");
        if(done){
            done();
        }
    });
}

/**
 * A helper function that asserts that an element is not displayed, after optionally giving it some time to be displayed.
 * @param driver Driver that should perform the test
 * @param locator Locator to find the element
 * @param timeout Optional, time (in milliseconds) to wait for the element to be displayed
 * @param done Optional, a done callback to invoke if and when the assert succeeds.
 * @return The promise returned by the last driver operation.
 */
function assertNotDisplayed(driver, locator, timeout, done){
   if(timeout){

        //If there is a timeout, wait for the element.
        //If it appears, throw an error. If we reach the timeout, all is well.
        return waitForElementDisplayed(driver, locator, timeout).then(function(){
            throw "Element " + locator + " should not be displayed.";
        }, function(err){
            //Eat the error, it's the behavior we wanted.
            if(done){
                done();
            }
        });
    } else {
        //If there is no timeout, we can simply check if element is displayed
        return driver.findElement(locator).isDisplayed().then(function(displayed){
            assert.equal(displayed, false, "Element " + locator + "should not be displayed.");
            if(done){
                done();
            }
        });
    }
}

/**
 * A helper function that asserts that an element's text matches an expected value.
 * @param driver Driver that should perform the test
 * @param locator Locator to find the element whose text must be tested
 * @param expectedText Text that should equal the element's text.
 * @param done Optional, a done callback to invoke if and when the assert succeeds.
 * @return The promise returned by the last driver operation.
 */
function assertText(driver, locator, expectedText, done){
    return driver.findElement(locator).getText().then(function(returnedText){
        assert.equal(returnedText, expectedText);
        if(done){
            done();
        }
    });
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
        waitForElementPresent(driver, nameConfirmationFieldLocator, 1000).then(function(){
            driver2.get(connectionString);
            waitForElementPresent(driver2, nameConfirmationFieldLocator, 1000).then(function(){
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
        waitForElementPresent(driver, nameConfirmationFieldLocator, 1000).then(function(){
            driver2.get(connectionString);
            waitForElementPresent(driver2, nameConfirmationFieldLocator, 1000).then(function(){
                done();
            });
        });
    });

    describe('general behavior', function(){
        it("Should render the page when opening", function(done) {
            //The chat field won't be present if the page hasn't rendered.
            assertPresent(driver, chatFieldLocator, 1000, done);
        });

        it("Should greet the user when opening", function(done) {
            //Greeting text should appear by itself upon connection
            assertPresent(driver, greetingFieldLocator, 1000, done);
        });

        it("Should tell other users when someone joins", function(done) {
            //Message indicating second user's arrival should be there
            assertPresent(driver, userJoinedFieldLocator, 1000, done);
        });

        it("Should not tell a user that they themselves joined", function(done) {
            //Message indicating second user's arrival shouldn't be there for second user
            assertAbsent(driver2, userJoinedFieldLocator, 1000, done);
        });

        it("Should tell other users when someone leaves", function(done) {
            driver2.get(connectionString);
            //Message indicating second user's departure should show up
            assertPresent(driver, userLeftFieldLocator, 1000).then(function(){

                //After the test passes, we need to make sure we wait for client 2 to get its name.
                //Otherwise, it can receive it while client 1 is refreshing in preparation for
                //the next test, and then the names reverse and some tests fail.
                waitForElementPresent(driver2, nameConfirmationFieldLocator, 1000).then(function(){
                    done();
                });
            });
        });
    });

    describe('chat message', function(){
        it("Should display current user's message after it has been sent", function(done) {
            var textLine = "Line of text";
            sendChatLine(driver, textLine, 1, true);
            waitForElementPresent(driver, chatTextLocator, 1000);
            assertText(driver, chatTextLocator, textLine, done);
        });

        it("Should not display an empty message", function(done) {
            var textLine = "";
            sendChatLine(driver, textLine, 1, true);
            assertAbsent(driver, chatTextLocator, 1000, done);
        });

        it("Should display username along with a message", function(done) {
            var textLine = "Line of text";
            sendChatLine(driver, textLine, 1, true);
            waitForElementPresent(driver, chatPreambleLocator, 1000);
            //Looks like the reported text value gets trimmed, cause it's actually 'Guest: '.
            //No matter, it's not what we're checking.
            assertText(driver, chatPreambleLocator, "Guest:", done);
        });

        it("Should display another user's message after it has been sent", function(done) {
            var textLine = "Other line of text";
            sendChatLine(driver2, textLine, 1, true);
            waitForElementPresent(driver, chatTextLocator, 1000);
            assertText(driver, chatTextLocator, textLine, done);
        });
    });

    describe('whisper', function(){
        it("Should confirm the whisper to the sender after it has been sent", function(done) {
            var textLine = "Line of whisper";
            var target = "Guest2";
            sendWhisper(driver, textLine, target, true);
            waitForElementPresent(driver, whisperLineLocator, 1000);
            //Looks like the reported text value gets trimmed, cause it's actually 'To Guest2: '.
            //No matter, it's not what we're checking.
            assertText(driver, whisperPreambleLocator, 'To ' + target + ':');
            assertText(driver, whisperTextLocator, textLine, done);
        });

        it("Should send the whisper to the target", function(done) {
            var textLine = "Line of whisper";
            var target = "Guest2";
            sendWhisper(driver, textLine, target, true);
            waitForElementPresent(driver2, whisperLineLocator, 1000);
            //Looks like the reported text value gets trimmed, cause it's actually 'From Guest: '.
            //No matter, it's not what we're checking.
            assertText(driver2, whisperPreambleLocator, 'From Guest:').then(function(){
                assertText(driver2, whisperTextLocator, textLine, done);
            });
        });

        it("Should not send the whisper to a non-target", function(done) {
            var textLine = "Line of whisper";
            var target = "Guest";
            sendWhisper(driver, textLine, target, true);
            assertAbsent(driver2, whisperLineLocator, 1000, done);
        });

        it("Should notify if target doesn't exist", function(done) {
            var textLine = "Line of whisper";
            var target = "Mr. No one";
            sendWhisper(driver, textLine, target, true);
            assertPresent(driver, userNotExistsFieldLocator, 1000, done);
        });
    });

    describe('general display', function(){
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
    });

    describe('username', function(){

        it("Should attribute default usernames properly and display them in currentUsername field", function(done) {
            waitForElementPresent(driver, currentUsernameFieldLocator, 1000);
            assertText(driver, currentUsernameFieldLocator, "Guest").then(function(){
                waitForElementPresent(driver2, currentUsernameFieldLocator, 1000);
                assertText(driver2, currentUsernameFieldLocator, "Guest2", done);
            });
        });

        it("Should change a user's name", function(done) {
            changeName(driver, "ChangedName");
            var textLine = "Line of text";
            sendChatLine(driver, textLine, 1, true);
            waitForElementPresent(driver, chatPreambleLocator, 1000);
            //Looks like the reported text value gets trimmed, cause it's actually 'ChangedName: '.
            //No matter, it's not what we're checking.
            assertText(driver, chatPreambleLocator, "ChangedName:", done);
        });

        it("Should trim before changing a user's name", function(done) {
            changeName(driver, " ChangedName  ");
            var textLine = "Line of text";
            sendChatLine(driver, textLine, 1, true);
            waitForElementPresent(driver, chatPreambleLocator, 1000);
            //Looks like the reported text value gets trimmed, cause it's actually 'ChangedName: '.
            //No matter, it's not what we're checking.
            assertText(driver, chatPreambleLocator, "ChangedName:", done);
        });

        it("Should tell user if their name change is invalid because name exists", function(done) {
            changeName(driver, "Guest2");
            assertPresent(driver, userExistsFieldLocator, 1000, done);
        });

        it("Should acknowledge the user's username when opening", function(done) {
            //Name confirmation should appear by itself upon connection
            assertPresent(driver, nameConfirmationFieldLocator, 1000, done);
        });

        it("Should not display the name change form when opening", function(done) {
            waitForElementPresent(driver, nameChangeFormLocator, 1000);
            assertNotDisplayed(driver, nameChangeFormLocator, 1000, done);
        });

        it("Should display the name change form after beginning the name change", function(done) {
            beginNameChange(driver);
            assertDisplayed(driver, nameChangeFormLocator, null, done);
        });

        it("Should not display the username after beginning the name change", function(done) {
            beginNameChange(driver);
            assertNotDisplayed(driver, currentUsernameDisplayLocator, null, done);
        });

        it("Should no longer display the name change form after canceling the name change", function(done) {
            beginNameChange(driver);
            cancelNameChange(driver);
            assertNotDisplayed(driver, nameChangeFormLocator, null, done);
        });

        it("Should tell other users when someone changes their name", function(done) {
            //Message indicating second user's rename should be there
            changeName(driver, 'newName');
            assertPresent(driver2, userRenamedFieldLocator, 1000, done);
        });

        it("Should not give a user the third person message when they changed their name", function(done) {
            //(Third person) message indicating second user's rename shouldn't be there for second user
            changeName(driver, 'newName');
            assertAbsent(driver, userRenamedFieldLocator, 1000, done);
        });

        it("Should not send an empty name change", function() {
            changeName(driver, '', true);
            assertNotDisplayed(driver, currentUsernameDisplayLocator, 1000, done);
        });
    });
})
