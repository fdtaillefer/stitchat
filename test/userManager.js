var assert = require("assert");

var manager;
var socket1, socket2;

function socket(){
    this.properties = {};
    function set(property, value){
        this.properties[property] = value;
    }
    this.set = set;

    function get(property){
        return this.properties[property];
    }
    this.get = get;
}

describe('userManager', function(){

    before(function(){
        userManager = require("../userManager").create("guest");
    })

    beforeEach(function(){
        userManager.clearUsers();
        socket1 = new socket();
        socket2 = new socket();
    })

    describe('.clearUsers', function(){

        it('Should remove all registered users', function(){
            var user1 = userManager.createUser(socket1);
            var user2 = userManager.createUser(socket2);

            userManager.clearUsers();

            assert.equal(userManager.usernameExists(user1), false);
            assert.equal(userManager.usernameExists(user2), false);
        })

    })

    describe('.usernameExists', function(){

        it("Should return false if username doesn't exist", function(){
            assert.equal(userManager.usernameExists("AbsoluteRandomName"), false);
        })

        it("Should return true if username exists", function(){
            var user1 = userManager.createUser(socket1);
            assert.equal(userManager.usernameExists(user1), true);
        })

    })

    describe('.createUser', function(){
        it("Should return a different username each time if users aren't deleted", function(){
            var user1 = userManager.createUser(socket1);
            var user2 = userManager.createUser(socket2);

            assert.notEqual(user1, null);
            assert.notEqual(user2, null);
            assert.notEqual(user1, user2);
        })

        it("Should create a user that has the returned username", function(){
            var user1 = userManager.createUser(socket1);
            assert.equal(userManager.usernameExists(user1), true);
        })

        it("Should properly assign the username to the socket", function(){
            var user1 = userManager.createUser(socket1);
            assert.equal(socket1.get('username'), user1);
        })
    })

    describe('.removeUser', function(){
        it("Should not remove a user if user is not found", function(){
            var user1 = userManager.createUser(socket1);
            userManager.removeUser(socket2);
            assert.equal(userManager.usernameExists(user1), true);
        })

        it("Should remove a user if it is found", function(){
            var user1 = userManager.createUser(socket1);
            userManager.removeUser(socket1);
            assert.equal(userManager.usernameExists(user1), false);
        })
    })

    describe('.renameUser', function(){
        it("Should return the previous username if new username is free", function(){
            var user1 = userManager.createUser(socket1);
            var newName = "ChangedName";
            var returnValue = userManager.renameUser(socket1, newName);

            assert.equal(returnValue, user1);
        })

        it("Should properly rename the user in the inner map if new username is free", function(){
            var user1 = userManager.createUser(socket1);
            var newName = "ChangedName";

            userManager.renameUser(socket1, newName);

            assert.equal(userManager.usernameExists(user1), false);
            assert.equal(userManager.usernameExists(newName), true);
        })

        it("Should properly assign the new name to the socket if new username is free", function(){
            var user1 = userManager.createUser(socket1);
            var newName = "ChangedName";

            userManager.renameUser(socket1, newName);

            assert.equal(socket1.get('username'), newName);
        })

        it("Should return null if new username is in use", function(){
            var user1 = userManager.createUser(socket1);
            var user2 = userManager.createUser(socket2);

            var returnValue = userManager.renameUser(socket2, user1);
            assert.equal(returnValue, null);
        })

        it("Should not rename the user if new username is in use", function(){
            var user1 = userManager.createUser(socket1);
            var user2 = userManager.createUser(socket2);

            var returnValue = userManager.renameUser(socket2, user1);
            assert.equal(userManager.usernameExists(user2), true);
        })

        it("Should not change the socket's name if new username is in use", function(){
            var user1 = userManager.createUser(socket1);
            var user2 = userManager.createUser(socket2);

            var returnValue = userManager.renameUser(socket2, user1);
            assert.equal(socket2.get('username'), user2);
        })
    })

    describe('.generateUsername', function(){

        it("Should generate defaultName if not in use", function(){
            var name = userManager.generateUsername();
            assert.equal(name, "guest");
        })

        it("Should generate defaultName2 if not in use and defaultName is in use", function(){
            userManager.createUser(socket1);
            var name = userManager.generateUsername();
            assert.equal(name, "guest2");
        })

        it("Should check defaultNames sequentially until one not in use is found", function(){
            userManager.createUser(socket1);
            userManager.createUser(socket2);
            userManager.createUser(new socket());
            var name = userManager.generateUsername();
            assert.equal(name, "guest4");
        })

        it("Should return the first unused name, not the last name+1", function(){
            userManager.createUser(socket1);
            userManager.createUser(socket2);
            var socket3 = new socket();
            userManager.createUser(socket3);
            var socket4 = new socket();
            userManager.createUser(socket4);
            userManager.removeUser(socket3);
            var name = userManager.generateUsername();
            assert.equal(name, "guest3");
        })

    })

    describe('.getUserSocket', function(){
        it("Should return the socket associated with a username if found", function(){
            userManager.createUser(socket1);
            var user2 = userManager.createUser(socket2);
            var returnedSocket = userManager.getUserSocket(user2);
            assert.notEqual(returnedSocket, socket1);
            assert.equal(returnedSocket, socket2);
        })

        it("Should return undefined if username not found", function(){
            userManager.createUser(socket1);
            var returnedSocket = userManager.getUserSocket("BogusUser");
            assert.equal(returnedSocket, undefined);
        })
    })

})
