import BotClient from "@structures/Client";
import { BaseClusterWorker, IPC } from "eris-fleet";
import AbstractPlugin from "./BasePlugin";

export interface IPCOptions {
    worker: BaseClusterWorker;
}

export default class IPCPlugin extends AbstractPlugin {
    private readonly worker: BaseClusterWorker;
    constructor(client: BotClient, options: IPCOptions) {
        super(client);
        this.worker = options.worker;
        this.worker.shutdown = this.stop.bind(this);
    }

    getWorker(): BaseClusterWorker {
        return this.worker;
    }

    getIPC(): IPC {
        return this.worker.ipc;
    }

    getWorkerId(): number {
        return this.worker.workerID;
    }

    getClusterId(): number {
        return this.worker.clusterID;
    }

    public register() {}
    public start() {}
    public async stop(done: () => void) {
        const plugins = this.getClient().getPlugins();

        for (const [name, plugin] of plugins) {
            if (plugin instanceof IPCPlugin) continue;
            console.debug("Stopping plugin: " + name);
            await plugin.stop();
        }

        done();
    }
}