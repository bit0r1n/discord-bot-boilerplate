import { ShardEvents } from "eris";
import BasePlugin from "./BasePlugin";

export default class EventRouter extends BasePlugin {
    private events: Record<string, ((...args: any[]) => any)[]> = {};

    public addEventListner(event: keyof ShardEvents, listener: (...args: any[]) => any) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(listener);
        return this;
    }

    public removeEventListner(event: keyof ShardEvents, listener: (...args: any[]) => any) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(l => l !== listener);
        return this;
    }

    public async start() {
        for (const event of Object.keys(this.events)) {
            for (const listener of this.events[event]) {
                this.client.on(event, listener.bind(null, this.client));
            }
        }
    }
    public stop() {
        for (const event of Object.keys(this.events)) {
            for (const listener of this.events[event]) {
                this.client.removeListener(event, listener);
            }
        }
    }
    public register() {}    
}