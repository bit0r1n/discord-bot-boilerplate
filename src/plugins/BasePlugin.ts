import BotClient from "@structures/Client";

export default abstract class AbstractPlugin {
    protected client: BotClient;
    public startBeforeConnecting = false;

    constructor(client: BotClient) {
        this.client = client;
    }
    public getClient(): BotClient {
        return this.client;
    }
    public abstract start(...args: any[]): Promise<void> | void;
    public abstract stop(...args: any[]): Promise<void> | void;
    public abstract register(...args: any[]): void;
}