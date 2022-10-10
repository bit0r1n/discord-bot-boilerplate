import { Constants, PartialEmoji } from "eris";
import BaseComponent from "./BaseComponents";

type ValueOf<T> = T[keyof T];

interface IRawButtonComponent {
    style?: ValueOf<Constants["ButtonStyles"]>;
    label?: string;
    emoji?: PartialEmoji;
    custom_id?: string;
    url?: string;
    disabled?: boolean;
}

export default class ButtonComponent extends BaseComponent {
    declare public raw: IRawButtonComponent;
    constructor(button?: IRawButtonComponent) {
        super(Constants["ComponentTypes"].BUTTON);
        if (button) {
            this.raw.style = button.style;
            this.raw.label = button.label;
            this.raw.emoji = button.emoji;
            this.raw.custom_id = button.custom_id;
            this.raw.url = button.url;
            this.raw.disabled = button.disabled;
        }
    }

    static styles = Constants["ButtonStyles"];

    setColor(color: ValueOf<Constants["ButtonStyles"]>) {
        this.raw.style = color;
        return this;
    }

    setLabel(label: string) {
        this.raw.label = label;
        return this;
    }

    setEmoji(emoji: PartialEmoji) {
        this.raw.emoji = emoji;
        return this;
    }

    setCustomId(customId: string) {
        this.raw.custom_id = customId;
        return this;
    }

    setUrl(url: string) {
        this.raw.url = url;
        this.raw.style = Constants["ButtonStyles"].LINK;
        return this;
    }

    setDisabled(disabled = true) {
        this.raw.disabled = disabled;
        return this;
    }

    disable() {
        this.raw.disabled = true;
        return this;
    }

    enable() {
        this.raw.disabled = false;
        return this;
    }
}