/**
 * Contains constants. Can be used to share constants between client-side and server-side code.
 */
define({
    CHAT_PORT: 8888,
    HOST:"http://localhost",

    CHAT_MESSAGE:"chatMessage",
    SYSTEM_GREETING:"systemGreeting",
    SYSTEM_USERNAME_CONFIRMATION:"systemUsernameConfirmation",
    SYSTEM_USERNAME_EXISTS:"systemUsernameExists",
    SYSTEM_USER_JOIN:"systemUserJoin",
    SYSTEM_USER_LEAVE:"systemUserLeave",
    SYSTEM_USER_RENAME:"systemUserRename",
    NAME_CHANGE:"nameChange",

    //Note that these constants are not used by the css files, they use the text directly,
    //so do check there when changing them
    SYSTEM_MESSAGE_CLASS:"systemMessage",
    SYSTEM_GREETING_CLASS:"systemGreeting",
    USERNAME_CONFIRMATION_CLASS:"usernameConfirmation",
    USERNAME_EXISTS_CLASS:"usernameExists",
    USER_JOINED_CLASS:"userJoined",
    USER_LEFT_CLASS:"userLeft",
    USER_RENAMED_CLASS:"userRenamed",
    USER_MESSAGE_CLASS:"userMessage",
    MESSAGE_PREAMBLE_CLASS:"messagePreamble",
    MESSAGE_TEXT_CLASS:"messageText",

    DEFAULT_CHAT_USERNAME:"Guest"
});

