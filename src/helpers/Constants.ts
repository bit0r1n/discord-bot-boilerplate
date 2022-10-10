export enum CommandType {
    ABSTRACT,
    SLASH,
    TEXT
}

export enum CommandExecuteError {
    NO_BOT_PERMISSIONS,
    NO_USER_PERMISSIONS,
    ADMIN_ONLY
}