var assert = require("assert");

var manager;
var socket1, socket2;

function socket(){
    this.properties = {};
    function set(property, value, callback){
        this.properties[property] = value;
        callback();
    }
    this.set = set;

    function get(property, callback){
        callback(null, this.properties[property]);
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

        it('Should remove all registered users', function(done){

            userManager.createUser(socket1, function(user1){
                userManager.createUser(socket2, function(user2){
                    userManager.clearUsers();

                    assert.equal(userManager.usernameExists(user1), false);
                    assert.equal(userManager.usernameExists(user2), false);
                    done();
                });
            });
        })
    })

    describe('.usernameExists', function(){

        it("Should return false if username doesn't exist", function(){
            assert.equal(userManager.usernameExists("AbsoluteRandomName"), false);
        })

        it("Should return true if username exists", function(done){
            userManager.createUser(socket1, function(user1){
                assert.equal(userManager.usernameExists(user1), true);
                done();
            });
        })

    })

    describe('.createUser', function(){
        it("Should call the callback with a different username each time if users aren't deleted", function(done){
            userManager.createUser(socket1, function(user1){
                userManager.createUser(socket2, function(user2){
                    assert.notEqual(user1, null);
                    assert.notEqual(user2, null);
                    assert.notEqual(user1, user2);
                    done();
                });
            });

        })

        it("Should create a user that has the returned username", function(done){
            userManager.createUser(socket1, function(user1){
                assert.equal(userManager.usernameExists(user1), true);
                done();
            });
        })

        it("Should properly assign the username to the socket", function(done){
            userManager.createUser(socket1, function(user1){
                socket1.get('username', function(err, returnedName){
                    assert.equal(returnedName, user1);
                    done();
                })
            });
        })
    })

    describe('.removeUser', function(){
        it("Should not remove a user if user is not found", function(done){
            userManager.createUser(socket1, function(user1){
                userManager.removeUser(socket2, function(username){throw "This shouldn't be called, user doesn't exist";},
                        function(){
                    assert.equal(userManager.usernameExists(user1), true);
                    done();
                });
            });
        })

        it("Should remove a user if it is found", function(done){
            userManager.createUser(socket1, function(user1){
                userManager.removeUser(socket1, function(username){
                    assert.equal(userManager.usernameExists(user1), false);
                    done();
                }, function(){throw "This shouldn't be called, user exists";});
            });
        })
    })

    describe('.renameUser', function(){
        it("Should call the callback with previous username if new username is free", function(done){
            userManager.createUser(socket1, function(user1){
                var newName = "ChangedName";
                userManager.renameUser(socket1, newName, function(oldUsername){
                    assert.equal(oldUsername, user1);
                    done();
                }, function(){throw "This shouldn't be called, new name doesn't exist.";},
                function(){throw "There shouldn't be an error";});
            });
        })

        it("Should properly rename the user in the inner map if new username is free", function(done){
            userManager.createUser(socket1, function(user1){
                var newName = "ChangedName";
                userManager.renameUser(socket1, newName, function(oldUsername){
                    assert.equal(userManager.usernameExists(user1), false);
                    assert.equal(userManager.usernameExists(newName), true);
                    done();
                }, function(){throw "This shouldn't be called, new name doesn't exist.";},
                function(){throw "There shouldn't be an error";});
            });
        })

        it("Should properly assign the new name to the socket if new username is free", function(done){

            userManager.createUser(socket1, function(user1){
                var newName = "ChangedName";
                userManager.renameUser(socket1, newName, function(oldUsername){
                    socket1.get('username', function(err, returnedName){
                        assert.equal(returnedName, newName);
                        done();
                    });
                }, function(){throw "This shouldn't be called, new name doesn't exist.";},
                function(){throw "There shouldn't be an error";});
            });
        })

        it("Should call existsCallback if new username is in use", function(done){
            userManager.createUser(socket1, function(user1){
                userManager.createUser(socket2, function(user2){
                    userManager.renameUser(socket2, user1,
                        function(oldUsername){throw "This shouldn't be called, new name exists.";},
                        function(){
                            done();
                        }, function(){throw "There shouldn't be an error";});
                });
            });
        })

        it("Should not rename the user if new username is in use", function(done){

            userManager.createUser(socket1, function(user1){
                userManager.createUser(socket2, function(user2){
                    userManager.renameUser(socket2, user1,
                        function(oldUsername){throw "This shouldn't be called, new name exists.";},
                        function(){
                            assert.equal(userManager.usernameExists(user2), true);
                            done();
                        }, function(){throw "There shouldn't be an error";});
                });
            });
        })

        it("Should not change the socket's name if new username is in use", function(done){

            userManager.createUser(socket1, function(user1){
                userManager.createUser(socket2, function(user2){
                    userManager.renameUser(socket2, user1,
                        function(oldUsername){throw "This shouldn't be called, new name exists.";},
                        function(){
                            socket2.get('username', function(err, returnedName){
                                assert.equal(returnedName, user2);
                                done();
                            });
                        }, function(){throw "There shouldn't be an error";});
                });
            });
        })
    })

    describe('.generateUsername', function(){

        it("Should generate defaultName if not in use", function(){
            var name = userManager.generateUsername();
            assert.equal(name, "guest");
        })

        it("Should generate defaultName2 if not in use and defaultName is in use", function(done){
            userManager.createUser(socket1, function(user1){
                var name = userManager.generateUsername();
                assert.equal(name, "guest2");
                done();
            });
        })

        it("Should check defaultNames sequentially until one not in use is found", function(done){
            var socket3 = new socket();
            userManager.createUser(socket1, function(user1){
                userManager.createUser(socket2, function(user2){
                    userManager.createUser(socket3, function(user3){
                        var name = userManager.generateUsername();
                        assert.equal(name, "guest4");
                        done();
                    });
                });
            });
        })

        it("Should return the first unused name, not the last name+1", function(done){
            var socket3 = new socket();
            var socket4 = new socket();
            userManager.createUser(socket1, function(user1){
                userManager.createUser(socket2, function(user2){
                    userManager.createUser(socket3, function(user3){
                        userManager.createUser(socket4, function(user4){
                            userManager.removeUser(socket3, function(removedUsername){
                                var name = userManager.generateUsername();
                                assert.equal(name, "guest3");
                                done();
                            }, function(){throw "There shoult be no error";});
                        });
                    });
                });
            });
        })
    })

    describe('.getUserSocket', function(){
        it("Should return the socket associated with a username if found", function(done){
            userManager.createUser(socket1, function(user1){
                userManager.createUser(socket2, function(user2){
                    var returnedSocket = userManager.getUserSocket(user2);
                    assert.notEqual(returnedSocket, socket1);
                    assert.equal(returnedSocket, socket2);
                    done();
                });
            });
        })

        it("Should return undefined if username not found", function(done){
            userManager.createUser(socket1, function(user1){
                var returnedSocket = userManager.getUserSocket("BogusUser");
                assert.equal(returnedSocket, undefined);
                done();
            });
        })
    })

})
