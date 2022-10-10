import { Client, Constants, GuildTextableChannel } from "eris";

export function checkPermissions(client: Client, channel: GuildTextableChannel, permissions: (keyof Constants["Permissions"])[]) {
    return permissions.every(p => channel.permissionsOf(client.user.id).has(p));
}