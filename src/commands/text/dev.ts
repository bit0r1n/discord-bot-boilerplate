import TextCommand from "@commands/TextCommand";
import BotClient from "@structures/Client";
import Context from "@structures/Context";
import { inspect } from "util";

export default class DevCommand extends TextCommand {
    constructor(client: BotClient) {
        super(client, {
            name: "dev",
            description: "Developer commands",
            group: "dev",
            adminOnly: true,
            hidden: true,
            subcommands: [EvalCommand]
        });
    }
}

class EvalCommand extends TextCommand {
    constructor(client: BotClient) {
        super(client, {
            name: "eval",
            description: "Evaluates JavaScript code",
            group: "dev",
            args: [{ name: "code", last: true }],
            flags: [{ name: "async", aliases: ["a"] }],
            hidden: true,
        });
    }

    async handle(ctx: Context) {
        const code = ctx.getArg("code") as string;
        if (!code) return;
        try {
            const runCode = ctx.getFlag("async") ? `(async () => {${code}})()` : code;
            const result = await eval(runCode);
            await ctx.reply(
                inspect(result, { depth: 0 })
                    .replace(process.env.BOT_TOKEN!, "TOKEN")
            );
        } catch (e) {
            console.error(e);
            const err = e as Error;
            await ctx.reply({ content: `${err.name}: ${err.message}` });
        }
    }
}