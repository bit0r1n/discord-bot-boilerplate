import SlashCommand from "@commands/SlashCommand";
import BotClient from "@structures/Client";
import Context from "@structures/Context";

export default class TestCommand extends SlashCommand {
    constructor(client: BotClient) {
        super(client, {
            name: "test",
            description: "Test command",
            subcommands: [TestSubcommand]
        });
    }
}

class TestSubcommand extends SlashCommand {
    constructor(client: BotClient) {
        super(client, {
            name: "sub",
            description: "Sub command test",
        });
    }

    async handle(ctx: Context) {
        await ctx.reply("Subcommand xd");
    }
}