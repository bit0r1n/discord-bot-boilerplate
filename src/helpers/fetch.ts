import http, { IncomingMessage } from "http";
import https from "https";
import { URLSearchParams } from "url";

export interface FetchOptions {
    method?: string;
    body?: string;
    headers?: { [key: string]: string };
    query?: { [key: string]: string };
}

export default function fetch(url: string, options?: FetchOptions): Promise<Response> {
    return new Promise((resolve, reject) => {
        const requester = url.startsWith("https") ? https : http;
        const qs = Object.keys(options?.query || {}).length ?
            new URLSearchParams(options!.query).toString()
            : null;

        const request = requester.request(url + (qs ? `?${qs}` : ""), {
            method: options?.method || "GET",
            headers: options?.headers || {}
        }, (response) => {
            let data = "";
            response.on("data", (chunk) => {
                data += chunk;
            });
            response.on("end", () => {
                resolve(new Response(data, response));
            });
        }).on("error", (error) => {
            reject(error);
        });
        if (options?.body) request.write(options.body);
        request.end();
    });
}

export class Response {
    private readonly rawResponse: string;
    public readonly headers: Map<string, string | string[] | undefined>;
    public readonly statusMessage: string;
    public readonly statusCode: number;
    constructor(data: string, response: IncomingMessage) {
        this.rawResponse = data;
        this.headers = new Map(Object.entries(response.headers));
        this.statusMessage = response.statusMessage!;
        this.statusCode = response.statusCode!;
    }

    get ok(): boolean {
        return this.statusCode >= 200 && this.statusCode < 300;
    }

    buffer(): Buffer {
        return Buffer.from(this.rawResponse);
    }

    json() {
        try {
            const json = JSON.parse(this.rawResponse);
            return json;
        } catch (error) {
            return null;
        }
    }

    text(): string {
        return this.rawResponse;
    }
}