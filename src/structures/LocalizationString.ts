import { getPluralFunction } from "@src/helpers/Plurals";

export default class LocalizationString {
    private readonly name: string;
    private readonly translations: Map<string, string>;
    private readonly defaultLanguage: string;
    constructor(name: string, defaultLanguage: string, translations?: Record<string, string>) {
        this.name = name;
        this.translations = new Map();
        this.defaultLanguage = defaultLanguage;

        if (translations) {
            if (!translations[defaultLanguage]) throw new Error(`Default language "${defaultLanguage}" is not defined`);
            for (const [lang, translation] of Object.entries(translations)) {
                this.translations.set(lang, translation);
            }
        }
    }

    public getName(): string {
        return this.name;
    }

    public getTranslations(): Map<string, string> {
        return this.translations;
    }

    public addTranslation(lang: string, translation: string) {
        this.translations.set(lang, translation);
    }

    public renderAll(variables?: string[]): Map<string, string> {
        const result: Map<string, string> = new Map();
        for (const lang of this.translations.keys()) {
            result.set(lang, this.render(lang, variables));
        }
        return result;
    }

    public render(lang: string, variables?: string[]) {
        if (!this.translations.has(lang) ||
            this.translations.get(lang) === this.translations.get(this.defaultLanguage)) lang = this.defaultLanguage;
        return this.translations.get(lang)!
            .replaceAll(/{(\d+?)}|\${(\d+)\|(.+?)}/g, (...args) => {
                if (args[0][0] === "$") {
                    const plurals = args[3].split("|");
                    const index = Number(args[2]);
                    if (!variables?.[index]) return args[0];
                    const pluralFunction = getPluralFunction(lang);
                    return pluralFunction(Number(variables[index]), plurals);
                } else {
                    return variables?.[Number(args[1])] || args[0];
                }
            });
    }
}