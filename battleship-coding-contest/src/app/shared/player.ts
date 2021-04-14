export interface Player {
    id?: string;
    name: string;
    webApiUrl: string;
    hasApiKey: boolean;
    lastMeasurement?: Date;
    avgNumberOfShots?: number;
    stdDev?: number;
    apiKey: string;
    apiKeyChanged?: boolean;
    needsThrottling: boolean;
    gitHubUrl?: string;
    expanded?: boolean;
}