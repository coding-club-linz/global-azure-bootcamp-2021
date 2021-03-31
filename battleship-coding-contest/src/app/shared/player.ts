export interface Player {
    id?: string;
    name: string;
    webApiUrl: string;
    hasApiKey: boolean;
    apiKey: string;
    apiKeyChanged?: boolean;
}