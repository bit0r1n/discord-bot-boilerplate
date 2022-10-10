import { ApplicationCommandOptions, Constants, InteractionDataOptions, InteractionDataOptionsSubCommand } from "eris";
import { CommandType } from "@src/helpers/Constants";
import BotClient from "@structures/Client";
import Context from "@structures/Context";
import BaseCommand, { CommandOptions } from "./BaseCommand";

export interface SlashCommandOptions extends CommandOptions {
    args?: ApplicationCommandOptions[];
    group?: boolean;
}

type ValueOf<T> = T[keyof T];

export default class SlashCommand extends BaseCommand {
    declare public subcommands: SlashCommand[];
    public readonly commandType: ValueOf<Constants["ApplicationCommandTypes"]> | ValueOf<Constants["ApplicationCommandOptionTypes"]["SUB_COMMAND"]> | ValueOf<Constants["ApplicationCommandOptionTypes"]["SUB_COMMAND_GROUP"]>;
    protected args: ApplicationCommandOptions[];
    private group: boolean = false;
    constructor(client: BotClient, ...options: SlashCommandOptions[]) {
        super(client, ...options);

        this.type = CommandType.SLASH;
        this.args = [];

        for (const option of options) {
            if (option.args) {
                this.args = option.args;
            }

            if (option.group) {
                this.group = option.group;
            }
        }
        
        const _options: SlashCommandOptions = {};
        options.forEach(o => Object.assign(_options, o));

        this.commandType = Constants.ApplicationCommandTypes.CHAT_INPUT;

        this.commandType = Constants.ApplicationCommandTypes.CHAT_INPUT;
        if (this.parent) {
            this.commandType = Constants.ApplicationCommandOptionTypes.SUB_COMMAND;
        } else if (this.group) {
            this.commandType = Constants.ApplicationCommandOptionTypes.SUB_COMMAND_GROUP;
        }
    }

    public async execute(context: Context, skipFind = false): Promise<void> {
        const executable = this.isExecutable(context);
        if (!executable.executable) return this.sendError(context, executable);
        try {
            if (skipFind) return this.handle(context);

            const interaction = context.getInteraction()!;
            if (interaction.data.options?.[0]?.type === Constants.ApplicationCommandOptionTypes.SUB_COMMAND_GROUP) {
                const groupName = interaction.data.options[0].name;
                const subcommandName = interaction.data.options[0].options[0].name;
                
                const subcommand = this.subcommands.find(g => g.name === groupName)!
                    .subcommands.find(s => s.name === subcommandName)! as SlashCommand;

                const subcommandExecutable = subcommand.isExecutable(context);
                if (!subcommandExecutable.executable) return this.sendError(context, subcommandExecutable);
                context.setArgs((interaction.data.options[0].options[0] as InteractionDataOptionsSubCommand).options as InteractionDataOptions[] || []);
                await subcommand.execute(context, true);
            } else if (interaction.data.options?.[0]?.type === Constants.ApplicationCommandOptionTypes.SUB_COMMAND) {
                const subcommandName = interaction.data.options[0].name;

                const subcommand = this.subcommands.find(g => g.name === subcommandName)! as SlashCommand;

                const subcommandExecutable = subcommand.isExecutable(context);
                if (!subcommandExecutable.executable) return this.sendError(context, subcommandExecutable);
                context.setArgs(interaction.data.options[0].options || []);
                await subcommand.execute(context, true);
            } else {
                await this.handle(context);
            }
        } catch (e: any) { console.error(`Failed to execute SLASH ${this.name} command: ${e.stack}`); }
    }

    toDeployJSON(): Record<string, any> {
        const options = this.subcommands.length ? this.subcommands.map(c => c.toDeployJSON()) : this.args;

        return {
            name: this.name,
            description: this.description,
            type: this.commandType,
            options
        };
    }
}