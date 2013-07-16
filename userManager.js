/**
 * An object that manages the users and their name and socket.
 * Sockets received by this object should be socket.io sockets, or minimally
 * objects which can have named properties set and gotten in the same way.
 */

/**
 * Creates and returns a new user manager with the provided default username.
 */
function createUserManager(defaultUsername){
    return new userManager(defaultUsername);
}

function userManager(defaultUsername){

    //removeUser's call to usernameExists via a callback causes this to change scope,
    //and the method to fail. This ensures self always refers to the current scope of this.
    var self = this;
    self.socketsByUsername = {};
    self.defaultUsername = defaultUsername;

    /**
     * Removes all existing users from the manager.
     */
    function _clearUsers(){
        self.socketsByUsername = {};
    }
    self.clearUsers = _clearUsers;

    /**
     * Indicates whether the provided username exists in the user manager.
     * @return
     */
    function _usernameExists(username){
        return self.socketsByUsername.hasOwnProperty(username);
    }
    self.usernameExists = _usernameExists;


    /**
     * Creates a user for the provided socket, adding it to the internal map
     * and giving it a username.
     * @param socket Socket for which to create a user.
     * @param callback Callback that is called after creating the user. It receives the username as a parameter.
     */
    function _createUser(socket, callback){
        var username = self.generateUsername();
        socket.set('username', username, function(){
            self.socketsByUsername[username] = socket;
            callback(username);
        });
    }
    self.createUser = _createUser;

    /**
     * Removes the user that corresponds to the provided socket.
     * If no user corresponds to that socket, does nothing.
     * @param socket Socket whose user to remove
     * @param callback Called after a successful removal. Receives one parameter, the removed username.
     * @param errback Optional, called with an error message if removal fails.
     */
    function _removeUser(socket, callback, errback){
        socket.get('username', function(err, username){

            if(err){
                if(errback){
                    errback(err);
                }
                return;
            }

            if(self.usernameExists(username)){
                delete self.socketsByUsername[username];
                callback(username);
            } else {
                if(errback){
                    errback("No user associated to socket");
                }
            }
        });
    }
    self.removeUser = _removeUser;

    /**
     * Attempts to rename a user.
     * If new name is free and socket has a user, user is renamed.
     * @param socket Socket whose user to rename
     * @param newUsername New username to give to the user
     * @param callback Called in case of success. Receives one parameter, the old username.
     * @param existsCallback Called if the operation fails specifically because newUsername is already in use.
     * @param errback Optional, called with an error message in case of unhandled failure.
     */
    function _renameUser(socket, newUsername, callback, existsCallback, errback){

        //Call proper callback if the new name is already in use
        if(self.usernameExists(newUsername)){
            existsCallback();
            return;
        }


        //If name is free, then remove socket's user and add it back with its new name.
        self.removeUser(socket, function(oldUsername){
            socket.set('username', newUsername, function(){
                self.socketsByUsername[newUsername] = socket;
                callback(oldUsername);
            });
        }, errback);
    }
    self.renameUser = _renameUser;

    /**
     * Generates an unused username, containing the default username and probably a number.
     * @return The generated username
     */
    function _generateUsername(){
        var newUsername;

        if(!self.usernameExists(self.defaultUsername)){
            newUsername = self.defaultUsername;
        } else {
            var i = 2;
            while(self.usernameExists(self.defaultUsername + i)){
                i++;
            }
            newUsername = self.defaultUsername + i;
        }

        return newUsername;
    }
    self.generateUsername = _generateUsername;

    /**
     * Returns the socket associated with the provided username.
     * @param username Name by which to get a socket.
     * @return the user's socket, or undefined if there isn't one.
     */
    function _getUserSocket(username){
        return self.socketsByUsername[username];
    }
    self.getUserSocket = _getUserSocket;

}

exports.create = createUserManager;