import cluster from "cluster";
import { Fleet, Options as FleetOptions } from "eris-fleet";
import winston from "winston";
import { Constants } from "eris";
import BotClient from "@structures/Client";
import Sentry from "winston-sentry-log";
import BotWorker from "./bot";

try {
    require("dotenv").config();
} catch { }

const transports = [
    new winston.transports.Console({
        level: "warn",
        format: winston.format.combine(
            winston.format.colorize({ all: true }),
            winston.format.timestamp({ format: "YYYY/MM/DD HH:mm:ss" }),
            winston.format.printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`)
        )
    }),
    new Sentry({
        config: {
            dsn: process.env.SENTRY_DSN
        },
        level: "warn"
    })
];

if (process.env.NODE_ENV === "development") {
    transports.length = 0;
    transports
        .push(new winston.transports.Console({
            level: "silly",
            format: winston.format.combine(
                winston.format.colorize({ all: true }),
                winston.format.timestamp({ format: "YYYY/MM/DD HH:mm:ss" }),
                winston.format.printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`)
            )
        }));
}

const logger = winston.createLogger({
    transports
});

const options: FleetOptions = {
    customClient: BotClient,
    BotWorker: BotWorker,
    token: process.env.BOT_TOKEN as string,
    startingStatus: {
        status: process.env.NODE_ENV === "development" ? "dnd" : "online",
        game: {
            name: process.env.BOT_STATUS || "",
            type: Constants.ActivityTypes.WATCHING
        }
    },
    clientOptions: {
        messageLimit: 0,
        intents: ["guilds", "guildMembers", "guildMessages"],
        restMode: true
    },
    loadCodeImmediately: true
};

const Admiral = new Fleet(options);

if (cluster.isPrimary) {
    Admiral.on("log", logger.info.bind(logger));
    Admiral.on("debug", logger.debug.bind(logger));
    Admiral.on("warn", logger.warn.bind(logger));
    Admiral.on("error", logger.error.bind(logger));
}