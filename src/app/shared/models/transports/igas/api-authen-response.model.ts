export interface ApiAuthenResponse {
    access_token?: string;
    token_type?: string;
    expires_in?: number;
    refresh_token?: string;
    expires?: Date | string;
}
