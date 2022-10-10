export const Plurals = {
    "en_US": (n: number, plurals: string[]) => plurals[Number(n !== 1)],
    "ru_RU": (n: number, plurals: string[]) => plurals[(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2)],
};

export const getPluralFunction = (lang: string) => {
    switch(lang) {
    case "en_US": return Plurals["en_US"];
    case "ru_RU": return Plurals["ru_RU"];
    default: return Plurals["en_US"];
    }
};