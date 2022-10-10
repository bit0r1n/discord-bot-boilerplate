import { Constants } from "eris";
import { CommandExecuteError, CommandType } from "@src/helpers/Constants";
import BotClient from "@structures/Client";
import Context from "@structures/Context";
import LocalizationString from "@structures/LocalizationString";

export interface CommandOptions {
    type?: CommandType;
    name?: string;
    description?: LocalizationString | string;
    userPermissions?: (keyof Constants["Permissions"])[];
    botPermissions?: (keyof Constants["Permissions"])[];
    adminOnly?: boolean;
    subcommands?: (typeof BaseCommand)[];
}

export interface ExecutableResult {
    executable: boolean;
    reason?: CommandExecuteError;
    extra?: any;
}

export default class BaseCommand {
    public usageCount: number;
    protected readonly client: BotClient;
    private readonly subcommandsToRegister: (typeof BaseCommand)[];

    public type: CommandType;
    public name: string;
    public description: LocalizationString | string;
    public userPermissions: (keyof Constants["Permissions"])[];
    public botPermissions: (keyof Constants["Permissions"])[];
    public adminOnly: boolean;
    public subcommands: BaseCommand[];

    protected parent: BaseCommand | null = null;

    constructor(client: BotClient, ...options: CommandOptions[]) {
        this.usageCount = 0;
        this.client = client;
        this.subcommandsToRegister = [];

        this.type = CommandType.ABSTRACT;
        this.name = "";
        this.description = "";
        this.userPermissions = [];
        this.botPermissions = [];
        this.adminOnly = false;
        this.subcommands = [];

        this.registerSubcommands();

        for (const option of options) {
            if (option.type) {
                this.type = option.type;
            }
            if (option.name) {
                this.name = option.name;
            }
            if (option.description) {
                this.description = option.description;
            }
            if (option.userPermissions) {
                this.userPermissions = option.userPermissions;
            }
            if (option.botPermissions) {
                this.botPermissions = option.botPermissions;
            }
            if (option.adminOnly) {
                this.adminOnly = option.adminOnly;
            }
            if (Array.isArray(option.subcommands)) {
                this.subcommandsToRegister.push(...option.subcommands);
            }

            this.registerSubcommands();
        }
    }

    private registerSubcommands(): void {
        for (const subcommand of this.subcommandsToRegister) {
            const command = new subcommand(this.client);
            command.setParent(this);
            this.subcommands.push(command);
        }
        this.subcommandsToRegister.length = 0;
    }

    public setParent(parent: BaseCommand): void {
        this.parent = parent;
    }

    public getClient(): BotClient {
        return this.client;
    }

    public getPlugins(): Map<string, any> {
        return this.client.getPlugins();
    }

    public getPlugin(name: string): any {
        return this.client.getPlugin(name);
    }

    increaseUsageCount(): number {
        return ++this.usageCount;
    }

    getUsageCount(): number {
        return this.usageCount;
    }

    public async execute(context: Context): Promise<any> { }

    public isExecutable(context: Context): ExecutableResult {
        const result: ExecutableResult = { executable: true };

        if (this.adminOnly && !context.isAdmin()) {
            result.executable = false;
            result.reason = CommandExecuteError.ADMIN_ONLY;
            return result;
        }

        if (!this.botPermissions.includes("sendMessages"))
            this.botPermissions.push("sendMessages");

        const botPermissions = context.getChannel().permissionsOf(context.getClient().user.id);
        if (!this.botPermissions.every(permission => botPermissions.has(permission))) {
            result.executable = false;
            result.reason = CommandExecuteError.NO_BOT_PERMISSIONS;
            result.extra = this.botPermissions.filter(p => !botPermissions.has(p));
            return result;
        }

        if (!context.isAdmin()) {
            const userPermissions = context.getChannel().permissionsOf(context.getMember());
            if (!this.userPermissions.every(permission => userPermissions.has(permission))) {
                result.executable = false;
                result.reason = CommandExecuteError.NO_USER_PERMISSIONS;
                result.extra = this.userPermissions.filter(p => !userPermissions.has(p));
                return result;
            }
        }

        return result;
    }

    public async sendError(context: Context, error: ExecutableResult) {
        if (error.executable) return;

        let content = "";
        switch (error.reason) {
        case CommandExecuteError.ADMIN_ONLY:
            content = "";
            break;
        case CommandExecuteError.NO_BOT_PERMISSIONS:
            content = context.t("common.NO_BOT_PERMISSIONS_ERROR", [
                (error.extra! as string[]).map(p => context.t(`permissions.${p}`)).join(", ")
            ]);
            break;
        case CommandExecuteError.NO_USER_PERMISSIONS:
            content = context.t("common.NO_USER_PERMISSIONS_ERROR", [
                (error.extra! as string[]).map(p => context.t(`permissions.${p}`)).join(", ")
            ]);
            break;
        default:
            content = "";
            break;
        }

        if (!content.length) return;
        await context.reply(context.isInteraction() ? { content, flags: 64 } : content);
    }

    public async handle(context: Context): Promise<any> {
        throw new Error("Method not implemented.");
    }

    toString(): string {
        const commandNames: string[] = [];

        let command: BaseCommand | null = this;
        while (command) {
            commandNames.unshift(command.name);
            command = command.parent;
        }

        return commandNames.join(" ");
    }
}