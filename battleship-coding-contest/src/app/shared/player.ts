export interface Player {
    id?: string;
    name: string;
    webApiUrl: string;
    hasApiKey: boolean;
    lastMeasurement?: Date;
    avgNumberOfShots?: number;
    apiKey: string;
    apiKeyChanged?: boolean;
}