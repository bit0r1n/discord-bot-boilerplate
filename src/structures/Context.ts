import { Attachment, Collection, CommandInteraction, Constants, FileContent, InteractionDataOptions, Member, Message, MessageContent, PartialChannel, Role, TextChannel, User } from "eris";
import BotClient from "./Client";
import Command from "@commands/BaseCommand";
import LocalizationPlugin from "@plugins/Localization";
import TextCommand from "@commands/TextCommand";
import SlashCommand from "@commands/SlashCommand";

interface ResolvedArguments {
    users?: Collection<User>;
    members?: Collection<Member>;
    roles?: Collection<Role>;
    channels?: Collection<PartialChannel>;
    messages?: Collection<Message>;
    attachments?: Record<string, Attachment>;
}

export default class Context {
    private readonly client: BotClient;
    private readonly message?: Message;
    private readonly interaction?: CommandInteraction;

    public admins: string[];
    public readonly storage: Map<string, any>;
    public args: Record<string, string> | InteractionDataOptions[];
    public flags: Record<string, string | boolean> = {}; // only used in text commands
    public command?: Command;

    constructor(client: BotClient, message?: Message | null, interaction?: CommandInteraction | null) {
        this.client = client;
        if (message) this.message = message;
        if (interaction) this.interaction = interaction;

        this.admins = [];
        this.storage = new Map();
        this.args = [];
    }

    getClient(): BotClient {
        return this.client;
    }

    getPlugins(): Map<string, any> {
        return this.client.getPlugins();
    }

    getPlugin(name: string): any {
        return this.client.getPlugin(name);
    }

    getLanguage(): string {
        return "en_US"; // you should implement this
    }
    
    t(key: string, variables?: string[], lang?: string) {
        return (this.getPlugin("l10n") as LocalizationPlugin)
            .getLocale(key).render(lang || this.getLanguage(), variables);
    }

    getChannel(): TextChannel {
        return (this.interaction?.channel || this.message?.channel) as TextChannel;
    }

    getAuthor(): User {
        return (this.interaction?.member?.user || this.message?.author) as User;
    }

    getMember(): Member {
        return (this.interaction?.member || this.message?.member) as Member;
    }

    getMessage(): Message | undefined {
        return this.message;
    }

    getInteraction(): CommandInteraction | undefined {
        return this.interaction;
    }

    isMessage(): boolean {
        return !!this.message;
    }

    isInteraction(): boolean {
        return !!this.interaction;
    }

    isAdmin(): boolean {
        return this.admins.includes(this.getAuthor().id || "");
    }

    setAdmins(ids: string[]) {
        this.admins = ids;
        return this;
    }

    addAdmin(id: string) {
        this.admins.push(id);
        this.getClient().setAdmins(this.admins);
        return this;
    }

    removeAdmin(id: string) {
        this.admins = this.admins.filter(admin => admin !== id);
        this.getClient().setAdmins(this.admins);
        return this;
    }
    
    isCommand(): boolean {
        return !!this.command;
    }

    getArgs() {
        if (this.command instanceof TextCommand) {
            return this.args as Record<string, string>;
        } else if (this.command instanceof SlashCommand) {
            return this.args as InteractionDataOptions[];
        } else {
            throw new Error("Unknown command type");
        }
    }

    getArg(name: string): string | InteractionDataOptions | undefined {
        if (this.command instanceof TextCommand) {
            return (this.getArgs() as Record<string, string>)[name];
        } else {
            return (this.getArgs() as InteractionDataOptions[]).find(arg => arg.name === name);
        }
    }

    setArgs(args: Record<string, string> | InteractionDataOptions[]) {
        this.args = args;
        return args;
    }

    getFlags(): Record<string, string | boolean> {
        return this.flags;
    }

    getFlag(name: string): string | boolean | undefined {
        return this.flags[name];
    }

    setFlags(flags: Record<string, string | boolean>) {
        this.flags = flags;
        return this;
    }

    getUserArg(id: string) {
        return this.getInteraction()!.data.resolved?.users?.get(id);
    }

    getMemberArg(id: string) {
        return this.getInteraction()!.data.resolved?.members?.get(id);
    }

    getRoleArg(id: string) {
        return this.getInteraction()!.data.resolved?.roles?.get(id);
    }

    getChannelArg(id: string) {
        return this.getInteraction()!.data.resolved?.channels?.get(id);
    }

    getMessageArg(id: string) {
        return this.getInteraction()!.data.resolved?.messages?.get(id);
    }

    getAttacmentArg(id: string) {
        return (
            (this.getInteraction()!.data.resolved as ResolvedArguments)
                ?.attachments)
            ?.[id];
    }

    hasPermissions(member: Member, perms: (keyof Constants["Permissions"])[] | keyof Constants["Permissions"]) {
        if (!Array.isArray(perms)) perms = [perms];
        return perms.every(perm => this.getChannel().permissionsOf(member).has(perm));
    }

    hasAuthorPermissions(perms: (keyof Constants["Permissions"])[] | keyof Constants["Permissions"]) {
        return this.hasPermissions(this.getMember(), perms);
    }

    hasBotPermissions(perms: (keyof Constants["Permissions"])[] | keyof Constants["Permissions"]) {
        return this.hasPermissions(
            this.getChannel().guild.members.get(this.getClient().user.id)!,
            perms
        );
    }

    async private(): Promise<void> {
        if (this.isInteraction()) await this.getInteraction()!.acknowledge(64);
    }

    reply(content: string | MessageContent, file: FileContent | FileContent[] | undefined = undefined) {
        if (this.isInteraction()) {
            return this.getInteraction()!.createMessage(content, file);
        } else {
            let payload: MessageContent = {};
            if (this.hasBotPermissions("readMessageHistory")) {
                payload.messageReference = {
                    messageID: this.getMessage()!.id,
                    failIfNotExists: false
                };
            }
            if (typeof content === "string") {
                payload.content = content;
            } else {
                payload = { ...payload, ...content };
            }

            return this.getChannel().createMessage(payload, file);
        }
    }

    async think() {
        if (this.isInteraction()) await this.getInteraction()!.acknowledge();
        else await this.getChannel().sendTyping();
    }
}