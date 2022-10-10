import { Constants } from "eris";
import BaseComponent from "./BaseComponents";

interface IRawActionComponents {
    components: BaseComponent[];
}

export default class ActionRowComponent extends BaseComponent {
    declare public raw: IRawActionComponents;
    constructor(components?: BaseComponent[]) {
        super(Constants["ComponentTypes"].ACTION_ROW);
        this.raw.components = [];
        if (components) this.raw.components = components;
    }

    addComponents(components: BaseComponent): ActionRowComponent {
        this.raw.components.push(components);
        return this;
    }

    toJSON(): Record<string, any> {
        return {
            ...super.toJSON(),
            components: this.raw.components.map(component => component.toJSON())
        };
    }
}