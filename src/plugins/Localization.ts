import BotClient from "@structures/Client";
import BasePlugin from "./BasePlugin";
import fs from "fs";
import LocalizationString from "@structures/LocalizationString";
import { join } from "path";

export interface LocalizationOptions {
    localesPath: string;
}

/*
    Localization folder structure:
    - {localization folder}/
        - {language name folder}/
            - {localization file name}.json

    get locale: Localization.getLocale("locale_file.locale_field").render("lang", ["variable1", "variable2"])
*/

export const DEFAULT_LANGUAGE = "en_US";

export default class LocalizationPlugin extends BasePlugin {
    private readonly localesPath: string;
    private readonly locales: Map<string, Map<string, LocalizationString>>;

    constructor(client: BotClient, options: LocalizationOptions) {
        super(client);

        this.startBeforeConnecting = true;

        this.localesPath = options.localesPath;
        this.locales = new Map();
    }

    private loadLocales(): void {
        console.debug("Getting languages for localization");

        const languages = fs.readdirSync(this.localesPath);

        console.debug(`Got languages: ${languages.join(", ")}`);
        for (const language of languages) {
            console.debug(`Loading language ${language}`);
            const languagePath = join(this.localesPath, language);
            const files = fs.readdirSync(languagePath);
            console.debug(`Got files: ${files.join(", ")}`);
            for (const file of files) {
                const filePath = join(languagePath, file);
                const localeName = file.replace(".json", "");
                const fileData = fs.readFileSync(filePath, "utf8");
                const localization = JSON.parse(fileData);

                if (!this.locales.has(localeName)) {
                    this.locales.set(localeName, new Map<string, LocalizationString>());
                }

                const locales = this.locales.get(localeName)!;

                for (const [key, value] of Object.entries(localization)) {
                    const localeKey: string = key;
                    const localeValue = value as string;
                    if (!locales.has(localeKey)) {
                        locales.set(localeKey, new LocalizationString(localeKey, DEFAULT_LANGUAGE));
                    }

                    locales.get(key)!.addTranslation(language, localeValue);
                }
            }
        }
    }

    public getLocale(localeVar: string): LocalizationString {
        const [file, locale] = localeVar.split(".");
        if (!this.locales.has(file)) throw new Error(`Locale file ${file} not found`);
        if (!this.locales.get(file)!.has(locale)) throw new Error(`Locale ${file}.${locale} not found`);
        return this.locales.get(file)!.get(locale)!;
    }

    public start(): void {
        this.loadLocales();
    }
    public stop(): void {}
    public register(): void {}
}