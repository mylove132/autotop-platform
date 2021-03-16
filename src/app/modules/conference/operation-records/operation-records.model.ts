export interface OperationRecords {
    id: number;               // 操作记录ID
    operateModule: number;    // 操作模块
    operateType: number;      // 操作类型
    operateDesc: string;      // 操作描述
    requestParam: string;     // 请求参数
    responseParam: string;    // 返回参数
    operateUri: string;       // 请求路径
    operateIp: string;        // 请求者IP
    user?: User;              // 请求者用户信息
    createDate: string;       // 创建时间
}

export interface User {
    id: number;               // ID
    username: string;         // 用户名
    userId: number;           //  用户ID
}

