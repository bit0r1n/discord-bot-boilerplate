import Context from "@structures/Context";
import { TextChannel, User } from "eris";
import Fuse from "fuse.js";
import { idOrMentionChannelRegexp, idOrMentionRegexp } from "./RegExp";

export interface GetChannelOptions {
    includeNSFW?: boolean;
    filter?: (ctx: Context, channel: TextChannel) => boolean;
}

// Methods are using only in text commands

export function getUser(context: Context, query: string): User | undefined {
    if (!context.getMessage()) return undefined;
    const guild = context.getChannel()!.guild;

    const mentionedMember = context.getMessage()!.mentions?.find(m => m.id === query.match(idOrMentionRegexp)?.[1]);
    if (mentionedMember) return mentionedMember;

    if (guild.members.has(query)) return guild.members.get(query)!.user;

    const fuse = new Fuse(Array.from(guild.members.values()), {
        keys: ["username", "nick"]
    });

    const result = fuse.search(query);
    if (result.length > 0) {
        const res = result[0];
        fuse.remove(() => true);
        return res.item.user;
    }

    return undefined;
}

export function getChannel(context: Context, query: string, options?: GetChannelOptions): TextChannel | undefined {
    if (!context.getMessage()) return undefined;
    const guild = context.getChannel()!.guild;
    let channels = guild.channels.filter(c =>
        c.type === 0
            && (options?.includeNSFW || !c.nsfw)
                && c.permissionsOf(context.getAuthor().id).has("viewChannel")) as TextChannel[];
    if (options?.filter) channels = channels.filter(c => options.filter!(context, c));

    const mentionedChannel = channels.find(c => c.id === query.match(idOrMentionChannelRegexp)?.[1]);
    if (mentionedChannel) return mentionedChannel;

    const fuse = new Fuse(channels, {
        keys: ["name"]
    });

    const result = fuse.search(query);
    if (result.length > 0) {
        const res = result[0];
        fuse.remove(() => true);
        return res.item;
    }

    return undefined;
}