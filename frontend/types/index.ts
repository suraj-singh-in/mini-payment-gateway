export type MerchantStatus = "active" | "inactive" | "pending" | string;

export type Merchant = {
    id: string;
    business_name: string;
    status: MerchantStatus;
    api_key: string;
    webhook_url?: string | null;
};

export type MerchantCredentials = {
    api_key: string;
    api_secret: string;
};

export interface WindowAnalytics {
    totalVolume: number;
    successfulPayments: number;
    failedPayments: number;
    conversionRate: number; // percentage, e.g. 93.3
}

export interface MerchantAnalytics {
    last24h: WindowAnalytics;
    last7d: WindowAnalytics;
}
