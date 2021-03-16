export interface SlectToken {
    platformId: string | number;
    envId: string | number;
    tokenId: string | number;
}

// 平台
export interface Platform {
    id: string | number;
    platformCode: string;
    name: string;
}

// 环境
export interface Env {
    id: string | number;
    name: string;
}

// token
export interface User {
    username: string;
    tokenId: string | number;
}
