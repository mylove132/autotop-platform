// Endpoint列表
export interface EndpointList {
    id: number;         // 环境ID
    name: string;       // 环境名称
    endpoints: Array<Endpoint>; // Endpoint 列表
}

// Endpoint实体
export interface Endpoint {
    id: number;         // endpoint ID
    name: string;       // endpoint 名称
    endpoint: string;   // endpoint url
}
