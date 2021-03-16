export interface DbList {
    id: number;
    dbName: string;
    dbHost: string;
    dbPort: number;
    dbUsername: string;
    dbPassword: string;
    createDate: string;
    updateDate: string;
    isRealDelete: boolean;
}

export interface SqlList {
    id: number;
    sql: string;
    name: string;
    createDate: string;
    updateDate: string;
    sqlAlias: string;
    resultFields?: any;
    isRealDelete: boolean;
}
