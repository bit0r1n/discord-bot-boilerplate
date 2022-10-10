import { AnyInteraction, CommandInteraction, ComponentInteraction, Message } from "eris";
import { join } from "path";
import fs from "fs";
import { EventEmitter } from "node:events";
import BotClient from "@structures/Client";
import Context from "@structures/Context";
import BasePlugin from "./BasePlugin";
import { CommandType } from "@src/helpers/Constants";
import BaseCommand from "@commands/BaseCommand";
import { isDir, requireRecursive } from "@src/helpers/FS";
import TextCommand from "@commands/TextCommand";
import SlashCommand from "@commands/SlashCommand";

export type SingleComponentCustomId = string | RegExp;
export type ArrayComponentCustomId = (string | RegExp)[];
export type ComponentCustomId = SingleComponentCustomId | ArrayComponentCustomId;
export type ComponentListener = (component: ComponentInteraction, client: BotClient) => Promise<void> | void;

export interface CommandsOptions {
    prefix: string;
    commandsPath: string;
    middlewaresPath: string;
}

export default class CommandsPlugin extends BasePlugin {
    private readonly interactionEvents: EventEmitter;
    private readonly commandsPath: string;
    private readonly middlewaresPath: string;
    public readonly middlewares: any[];
    public readonly commands: Set<TextCommand | SlashCommand>;
    public prefix: string;
    
    constructor(client: BotClient, options: CommandsOptions) {
        super(client);
        this.interactionEvents = new EventEmitter();
        this.commandsPath = options.commandsPath;
        this.middlewaresPath = options.middlewaresPath;
        this.middlewares = [];
        this.commands = new Set();
        this.prefix = options.prefix;
    }

    register() {}

    addComponentListener(customId: ComponentCustomId, proc: ComponentListener): CommandsPlugin {
        this.interactionEvents.on("componentInteraction", async (i: ComponentInteraction) => {
            if (Array.isArray(customId) && customId.some(c => i.data.custom_id.match(c))) await proc.call(null, i, this.getClient());
            else if (i.data.custom_id.match(customId as SingleComponentCustomId)) await proc.call(null, i, this.getClient());
        });
        console.debug("Listening interactions components with custom_id: " + customId);
        return this;
    }

    removeAllCompoenentListeners() {
        console.debug("Removing all component listeners...");
        this.interactionEvents.removeAllListeners("componentInteraction");
    }

    async processInteraction(interaction: AnyInteraction) {
        if (interaction instanceof CommandInteraction) {
            const ctx = new Context(this.client, null, interaction);
            await this.processMiddlewares(ctx);
        } else if (interaction instanceof ComponentInteraction) {
            this.interactionEvents.emit("componentInteraction", interaction);
        }
    }

    async processMessages(message: Message) {
        const ctx = new Context(this.client, message);
        await this.processMiddlewares(ctx);
    }

    addCommands(commands: string | typeof BaseCommand | typeof BaseCommand[]) {
        if (typeof commands === "string") {
            const slashCommandsPath = join(commands, "slash");
            const textCommandsPath = join(commands, "text");

            if (isDir(slashCommandsPath)) {
                for (const module of requireRecursive(slashCommandsPath)) {
                    const command = new module(this.client);
                    this.commands.add(command);
                }
            }

            if (isDir(textCommandsPath)) {
                for (const module of requireRecursive(textCommandsPath)) {
                    const command = new module(this.client);
                    this.commands.add(command);
                }
            }
        } else if (Array.isArray(commands)) {
            for (const commandClass of commands) {
                const command = new commandClass(this.client) as TextCommand | SlashCommand;
                this.commands.add(command);
            }
        } else {
            const command = new commands(this.client) as TextCommand | SlashCommand;
            this.commands.add(command);
        }

        return this;
    }

    addMiddlewares(middlewaresPath: string) {
        if (fs.existsSync(middlewaresPath) && fs.statSync(middlewaresPath).isDirectory()) {
            for (const module of requireRecursive(middlewaresPath)) {
                const middleware = module.default || module;
                this.middlewares.push(middleware);
            }
        }

        return this;
    }

    getTextCommands(): TextCommand[] {
        const result = [];
        for (const command of this.commands) {
            if (command.type === CommandType.TEXT) result.push(command as TextCommand);
        }
        return result;
    }

    getSlashCommands(): SlashCommand[] {
        const result = [];
        for (const command of this.commands) {
            if (command.type === CommandType.SLASH) result.push(command as SlashCommand);
        }
        return result;
    }

    findTextCommand(trigger: string): TextCommand | undefined {
        for (const command of this.commands) {
            if (command.type === CommandType.TEXT &&
                (command as TextCommand).getTriggers().includes(trigger.toLowerCase())) return command as TextCommand;
        }
    }

    findSlashCommand(name: string): SlashCommand | undefined {
        for (const command of this.commands) {
            if (command.type === CommandType.SLASH &&
                (command as SlashCommand).name === name) return command as SlashCommand;
        }
    }

    start() {
        console.debug("Registering commands...");
        this.addCommands(this.commandsPath);
        console.debug("Registering middlewares...");
        this.addMiddlewares(this.middlewaresPath);
        this.client.on("interactionCreate", this.processInteraction.bind(this));
        console.debug("Listening for interactions...");
        this.client.on("messageCreate", this.processMessages.bind(this));
        console.debug("Listening for messages...");
    }

    stop() {
        console.debug("Stopping interaction listener...");
        this.client.removeListener("interactionCreate", this.processInteraction.bind(this));
        this.removeAllCompoenentListeners();
    }

    async processMiddlewares(context: Context) {
        for (const middleware of this.middlewares.sort((a, b) => a.priority - b.priority)) {
            try {
                context = await middleware.execute(context);
            } catch (e) {
                console.error(e);
                return context;
            }
        }
        return context;
    }
}