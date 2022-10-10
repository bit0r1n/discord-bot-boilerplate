import { existsSync, readdirSync, statSync } from "fs";
import { join } from "path";

export const isDir = (dirpath: string) => existsSync(dirpath) ? statSync(dirpath).isDirectory() : false;

export function requireRecursive(dir: string) {
    return readdirSync(dir).reduce((arr: any[], file: string) => {
        if (file.startsWith(".") || file.startsWith("_")) return arr;
        const filepath = join(dir, file);
        if (isDir(filepath)) arr.push(...requireRecursive(filepath));
        else {
            const mod = require(filepath);
            arr.push(mod.default || mod);
        }
        return arr;
    }, []);
}