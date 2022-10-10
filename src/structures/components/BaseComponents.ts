import { Constants } from "eris";

type ValueOf<T> = T[keyof T];

export default class BaseComponent {
    protected raw: Record<string, any>;
    constructor(type: ValueOf<Constants["ComponentTypes"]>) {
        this.raw = { type };
    }

    toJSON() {
        return this.raw;
    }
}