import { BaseClusterWorker } from "eris-fleet";
import { Setup } from "eris-fleet/dist/clusters/BaseClusterWorker";
import { join } from "path";

import BotClient from "@structures/Client";

import CommandsPlugin, { CommandsOptions } from "@plugins/Commands";
import IPCPlugin, { IPCOptions } from "@plugins/IPC";
import EventRouter from "@plugins/Events";
import LocalizationPlugin, { LocalizationOptions } from "@plugins/Localization";

class BotBaseClusterWorker extends BaseClusterWorker {
    declare public bot: BotClient;
}

export default class BotWorker extends BotBaseClusterWorker {
    constructor(setup: Setup) {
        super(setup);

        this.bot.setAdmins(process.env.ADMINS!.split(","));

        this.bot
            .createPlugin<LocalizationOptions>("l10n", LocalizationPlugin, {
                localesPath: join(__dirname, "..", "locales"),
            }) // creating first bc it will be used in registering of other plugins (startBeforeConnecting = true)
            .createPlugin<CommandsOptions>("commands", CommandsPlugin, {
                prefix: process.env.NODE_ENV === "production" ? (process.env.PREFIX || "!") : "!",
                commandsPath: join(__dirname, "commands"),
                middlewaresPath: join(__dirname, "middlewares"),
            })
            .createPlugin<IPCOptions>("ipc", IPCPlugin, {
                worker: this
            })
            .createPlugin("events", EventRouter);

        
        this.shutdown = (this.bot.getPlugin("ipc") as IPCPlugin).stop.bind(this.bot.getPlugin("ipc"));

        // if you want to listen components
        /*
            (this.bot.getPlugin("commands") as CommandsPlugin)
                .addComponentListener("customId", componentListener1)
                .addComponentListener(/customId\d+/, componentListener2)
                .addComponentListener([/customId\.(\d+){17,19}/, "coolButton"], componentListener3);
        */

        // if you want listen some bot events
        /*
            const eventRouter = this.bot.getPlugin("events") as EventRouter;

            eventRouter
                .addEventListener("messageCreate", messageCreateListener)
                .addEventListener("guildDelete", guildDeleteListener));
        */
    }
}