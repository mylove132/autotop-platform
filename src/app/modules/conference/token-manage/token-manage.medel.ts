export interface Token {
    id: number;               // token id
    username: string;         // token用户名
    body: string;             // token登录data
    token: string;            // token值
    url: string;              // 登录url
    env?: Env;                // 环境
    platformCode?: Platform;  // 平台编码
    createDate?: string;      // 创建时间
    updateDate?: string;      // 更新时间
}

export interface Env {
    id: number;
    name: string;
}

export interface Platform {
    id: number;
    platformCode: string;
    name: string;
}
