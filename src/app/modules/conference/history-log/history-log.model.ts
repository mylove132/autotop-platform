// 历史记录列表
export interface HistoryLog {
    id: number;           // 历史记录ID
    createDate: string;   // 历史记录创建时间
    status: boolean;      // 接口执行结果
    executor: number;     // 执行者（0：手动执行，1：定时任务执行）
    result: string;       // 调用接口返回结果
    startTime: string;    // 调用接口开始时间
    endTime: string;      // 调用接口结束时间
    case: CaseEntity;     // 调用接口的case实体
}

// 接口用例case实体
export interface CaseEntity {
    id: number;           // 接口ID
    name: string;         // 接口名称
    header: string;       // 接口header值
    param: string;        // 接口参数
    paramType: number;    // 接口参数类型（TEXT = 0,FILE = 1）
    path: string;         // 接口url
    endpoint: string;     // endpoint
    type: number;         // 请求类型（GET = 0,POST = 1,DELETE = 2,PUT = 3）
    createDate: string;   // 接口创建时间
    updateDate: string;   // 接口更新时间
    assertText: string;   // 断言结果
    assertKey: string;    // 断言表达式
    isNeedToken: boolean; // 接口是否需要token
}
