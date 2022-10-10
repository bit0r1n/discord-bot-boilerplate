import Context from "./Context";

interface IMiddleware {
    priority: number;
    execute(context: Context): Promise<Context>;
}

export class Middleware implements IMiddleware {
    constructor(public priority: number, public execute: (context: Context) => Promise<Context>) {}
}