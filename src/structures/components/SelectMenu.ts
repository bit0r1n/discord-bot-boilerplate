import { Constants } from "eris";
import BaseComponent from "./BaseComponents";
import SelectOption from "./SelectOption";

interface IRawSelectMenu {
    custom_id?: string;
    options: SelectOption[];
    placeholder?: string;
    min_values?: number;
    max_values?: number;
    disabled?: boolean;
}

export default class SelectMenuComponent extends BaseComponent {
    declare public raw: IRawSelectMenu;
    constructor(options?: IRawSelectMenu) {
        super(Constants["ComponentTypes"].SELECT_MENU);
        this.raw.options = [];
        if (options) {
            this.raw.custom_id = options.custom_id;
            this.raw.options = options.options;
            this.raw.placeholder = options.placeholder;
            this.raw.min_values = options.min_values;
            this.raw.max_values = options.max_values;
            this.raw.disabled = options.disabled;
        }
    }

    setCustomId(customId: string) {
        this.raw.custom_id = customId;
        return this;
    }

    addOption(option: SelectOption | SelectOption[]) {
        if (Array.isArray(option)) this.raw.options.push(...option);
        else this.raw.options.push(option);
        return this;
    }

    setPlaceholder(placeholder: string) {
        this.raw.placeholder = placeholder;
        return this;
    }

    setMinValues(minValues: number) {
        this.raw.min_values = minValues;
        return this;
    }

    setMaxValues(maxValues: number) {
        this.raw.max_values = maxValues;
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