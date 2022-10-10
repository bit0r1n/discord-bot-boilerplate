import { PartialEmoji } from "eris";

interface ISelectOption {
    label?: string;
    value?: string;
    description?: string;
    emoji?: PartialEmoji;
    default?: boolean;
}

export default class SelectOption {
    private raw: Record<string, any> = {}; 
    constructor(option?: ISelectOption) {
        if (option) {
            this.raw.label = option.label;
            this.raw.value = option.value;
            this.raw.description = option.description;
            this.raw.emoji = option.emoji;
            this.raw.default = option.default;
        }
    }

    setLabel(label: string) {
        this.raw.label = label;
        return this;
    }

    setValue(value: string) {
        this.raw.value = value;
        return this;
    }

    setDescription(description: string) {
        this.raw.description = description;
        return this;
    }

    setEmoji(emoji: PartialEmoji) {
        this.raw.emoji = emoji;
        return this;
    }

    setDefault(isDefault = true) {
        this.raw.default = isDefault;
        return this;
    }

    default() {
        this.raw.default = true;
        return this;
    }

    undefault() {
        this.raw.default = false;
        return this;
    }

    toJSON() {
        return this.raw;
    }
}