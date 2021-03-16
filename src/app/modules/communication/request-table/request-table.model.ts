// 用例接口实体
export interface PeriodicElement {
    id: number;           // 接口ID
    name: string;         // 接口名称
    header: string;       // 接口header值
    paramType: number;    // 参数类型（TEXT = 0,FILE = 1）
    path: string;         // 接口url
    endpoint: string;     // endpoint表达式（已经废弃）
    type: number;         // 请求类型（GET = 0,POST = 1,DELETE = 2,PUT = 3）
    createDate: string;   // 接口创建时间
    updateDate: string;   // 接口更新时间
    assertText: string;   // 断言结果
    assertKey: string;    // 断言表达式
    isNeedToken: boolean; // 接口是否需要token
    endpointObject: any;  // 关联的endpoint实体
    assertType: any;      // 关联的断言类型
    assertJudge: any;     // 关联的断言条件
}

export interface GroupBy {
    name: string;
    isGroupBy: boolean;
    id: number;
}
