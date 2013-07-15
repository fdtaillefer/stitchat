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
    this.socketsByUsername = {};
    this.defaultUsername = defaultUsername;

    /**
     * Removes all existing users from the manager.
     */
    function _clearUsers(){
        this.socketsByUsername = {};
    }
    this.clearUsers = _clearUsers;

    /**
     * Indicates whether the provided username exists in the user manager.
     * @return
     */
    function _usernameExists(username){
        return this.socketsByUsername.hasOwnProperty(username);
    }
    this.usernameExists = _usernameExists;


    /**
     * Creates a user for the provided socket, adding it to the internal map
     * and giving it a username.
     * @param socket Socket for which to create a user.
     * @return The username given to the user.
     */
    function _createUser(socket){
        var username = this.generateUsername();
        socket.set('username', username);
        this.socketsByUsername[username] = socket;
        return username;
    }
    this.createUser = _createUser;

    /**
     * Removes the user that corresponds to the provided socket.
     * If no user corresponds to that socket, does nothing.
     * @param socket Socket whose user to remove
     * @return Whether the user was successfully removed.
     */
    function _removeUser(socket){
        var username = socket.get('username');
        if(this.usernameExists(username)){
            delete this.socketsByUsername[username];
            return true;
        }
        return false;
    }
    this.removeUser = _removeUser;

    /**
     * Attempts to rename a user.
     * If new name is free and socket has a user, user is renamed.
     * @param socket Socket whose user to rename
     * @param newUsername New username to give to the user
     * @return The removed previous username, or null if operation failed.
     */
    function _renameUser(socket, newUsername){

        //Don't do anything if the new name is already in use
        if(this.usernameExists(newUsername)){
            return null;
        }

        //If name is free, then remove socket's user and add it back with its new name.
        var username = socket.get('username');
        if (this.removeUser(socket)){
            socket.set('username', newUsername);
            this.socketsByUsername[newUsername] = socket;
            return username;
        } else {
            return null;
        }
    }
    this.renameUser = _renameUser;

    /**
     * Generates an unused username, containing the default username and probably a number.
     * @return The generated username
     */
    function _generateUsername(){
        var newUsername;

        if(!this.usernameExists(this.defaultUsername)){
            newUsername = this.defaultUsername;
        } else {
            var i = 2;
            while(this.usernameExists(this.defaultUsername + i)){
                i++;
            }
            newUsername = this.defaultUsername + i;
        }

        return newUsername;
    }
    this.generateUsername = _generateUsername;

    /**
     * Returns the socket associated with the provided username.
     * @param username Name by which to get a socket.
     * @return the user's socket, or undefined if there isn't one.
     */
    function _getUserSocket(username){
        return this.socketsByUsername[username];
    }
    this.getUserSocket = _getUserSocket;

}

exports.create = createUserManager;