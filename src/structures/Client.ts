import { Client, ClientOptions } from "eris";
import BasePlugin from "@plugins/BasePlugin";

export default class BotClient extends Client {
    private plugins: Map<string, BasePlugin>;
    private admins: string[] = [];

    constructor(token: string, options: ClientOptions) {
        super(token, options);
        this.options.compress = true;

        this.plugins = new Map();
    }

    get version() {
        return "1.0.0";
    }

    getAdmins() {
        return this.admins;
    }

    setAdmins(admins: string[]) {
        this.admins = admins;
    }

    getPlugins() {
        return this.plugins;
    }

    getPlugin(name: string): any {
        return this.plugins.get(name);
    }

    createPlugin<O>(name: string, Plugin: any, options?: O): BotClient {
        const plugin = new Plugin(this, options);
        if (plugin.startBeforeConnecting === true) {
            console.debug("Starting plugin BEFORE CONNECTING: " + name);
            plugin.start();
        }
        this.plugins.set(name, plugin);
        return this;
    }

    registerPlugin(name: string, ...args: any[]): BotClient {
        const plugin = this.plugins.get(name);
        if (!plugin) throw new Error(`Plugin ${name} not found`);
        plugin.register(...args);
        return this;
    }

    async connect() {
        for (const [name, plugin] of this.plugins) {
            if (plugin.startBeforeConnecting === true) continue;
            console.debug("Registering plugin: " + name);
            await plugin.start();
        }

        console.debug("Connecting to Discord");

        return super.connect();
    }
}