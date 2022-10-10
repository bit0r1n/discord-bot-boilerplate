import { CommandType } from "@src/helpers/Constants";
import BotClient from "@structures/Client";
import Context from "@structures/Context";
import LocalizationString from "@structures/LocalizationString";
import BaseCommand, { CommandOptions } from "./BaseCommand";

export interface TextCommandOptions extends CommandOptions {
    group?: LocalizationString | string;
    args?: TextCommandArgument[];
    flags?: TextCommandFlag[];
    aliases?: string[];
    usageExamples?: string[];
    argsHelp?: string;
    hidden?: boolean;
}

export interface TextCommandFlag {
    name: string;
    acceptValue?: boolean;
    aliases?: string[];
}

export interface TextCommandArgument {
    name: string;
    last?: boolean;
}

export interface ParseFlagsResult {
    flags: Record<string, string | boolean>;
    usedArgs: number[];
}

export default class TextCommand extends BaseCommand {
    declare public subcommands: TextCommand[];
    public group: LocalizationString | string = "misc";
    public readonly aliases: string[] = [];
    protected args: TextCommandArgument[] = [];
    public flags: TextCommandFlag[] = [];
    public argsHelp: string = "";
    public usageExamples: string[] = [];
    public hidden: boolean = false;
    constructor(client: BotClient, ...options: TextCommandOptions[]) {
        super(client, ...options);

        this.type = CommandType.TEXT;

        for (const option of options) {
            if (option.group) this.group = option.group;

            if (option.args) this.args = option.args;
            if (option.flags) this.flags.push(...option.flags);

            if (option.aliases) this.aliases.push(...option.aliases);

            if (option.usageExamples) this.usageExamples.push(...option.usageExamples);
            if (option.argsHelp) this.argsHelp = option.argsHelp;

            if (option.hidden) this.hidden = option.hidden;
            if (this.adminOnly) this.hidden = true;
        }
        
        const _options: TextCommandOptions = {};
        options.forEach(o => Object.assign(_options, o));
    }

    public async execute(context: Context): Promise<void> {
        const executable = this.isExecutable(context);
        if (!executable.executable) return this.sendError(context, executable);

        try {
            const rawArgs = context.storage.get("rawArgs") as string[];
            const subcommand = this.subcommands.find(c => c.getTriggers().includes(rawArgs[0]));
            if (subcommand) {
                console.debug(`Executing TEXT subcommand ${subcommand.name} of ${this.name}`);
                context.storage.set("rawArgs", rawArgs.slice(1));
                await subcommand.execute(context);
            } else {
                if (this.handle) {
                    console.debug(`Executing TEXT command ${this.name}`);
                    const parsedFlags = this.parseFlags(context.storage.get("rawArgs") as string[]);
                    context.setFlags(parsedFlags.flags);
                    context.storage.set("rawArgs", rawArgs.filter((_, i) => !parsedFlags.usedArgs.includes(i)));
                    const parsedArgs = this.parseArgs(context.storage.get("rawArgs") as string[]);
                    context.setArgs(parsedArgs);
                    await this.handle(context);
                } else console.warn(`No handle function for command ${this.name}`);
            }
        } catch (e: any) {
            console.error(`Failed to execute TEXT ${this.name} command: ${e.stack}`);
        }
    }

    getTriggers(): string[] {
        return [this.name, ...this.aliases];
    }

    parseFlags(args: string[]): ParseFlagsResult {
        const flags: Record<string, string | boolean> = {};
        const usedArgs: number[] = [];
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (arg.startsWith("--")) {
                const flag = this.flags.find(f => f.name === arg.slice(2));
                if (flag) {
                    if (flag.acceptValue) {
                        if (args[i + 1]) {
                            flags[flag.name] = args[i + 1];
                            usedArgs.push(i + 1);
                        }
                    } else flags[flag.name] = true;
                    usedArgs.push(i);
                }
            } else if (arg.startsWith("-")) {
                const flag = this.flags.find(f => f.aliases?.includes(arg.slice(1)));
                if (flag) {
                    if (flag.acceptValue) {
                        if (args[i + 1]) {
                            flags[flag.name] = args[i + 1];
                            usedArgs.push(i + 1);
                        }
                    } else flags[flag.name] = true;
                    usedArgs.push(i);
                }
            }
        }

        return { flags, usedArgs };
    }

    parseArgs(rawArgs: string[]): Record<string, string> {
        const args: Record<string, string> = {};
        let lastArg: string | undefined;
        for (let i = 0; i < rawArgs.length; i++) {
            const arg = rawArgs[i];
            const argDef = this.args[i];
            if (!argDef) break;
            if (argDef.last) {
                lastArg = rawArgs.slice(i).join(" ");
                break;
            }

            if (arg.startsWith('"') || arg.startsWith("'")) {
                const quote = arg[0];
                let end = i;
                for (let j = i + 1; j < rawArgs.length; j++) {
                    if (rawArgs[j].endsWith(quote)) {
                        end = j;
                        break;
                    }
                }

                args[argDef.name] = rawArgs.slice(i, end + 1).join(" ").slice(1, -1);
                i = end;
            } else args[argDef.name] = arg;
        }

        if (lastArg) args[this.args[this.args.length - 1].name] = lastArg;

        return args;
    }
}