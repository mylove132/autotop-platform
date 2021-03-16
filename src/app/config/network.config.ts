import { environment } from '../../environments/environment';
export const API_V1 = environment.API;
export const SFILE_V1 = environment.sfile;
export const OAPI_V1 = environment.OAPI;
export const AuthKey = {
    prod: 'dd34e0ff4e10a1d3b9428589369138e0',
    test: 'dd34e0ff4e10a1d3b9428589369138e0',
    token: ''
};

export const User = {
    Login: API_V1 + '/api/user/login', // 登录
};

export const Request = {
  getList: API_V1 + '/api/case',    // 获取接口用例
  addRequest: API_V1 + '/api/case', // 添加接口用例
  delRequest: API_V1 + '/api/case', // 删除接口用例
  sendRequest: API_V1 + '/api/run/script', // 执行接口用例
  operateRequest: API_V1 + '/api/run/case-script',  // 通过用例Id执行接口用例
  getAssert: API_V1 + '/api/case/assert-type',      // 获取断言类型
  getAssertType: API_V1 + '/api/case/assert-judge', // 获取断言关系
  GetCaseList: API_V1 + '/api/case/search', // 搜索接口用例（模糊检索）
  BatchUpdate: API_V1 + '/api/case/batchUpdate', // 批量更新接口目录
};

export const Evn = {
  getEvn: API_V1 + '/api/env', // 获取运行环境
  getEndpointList: API_V1 + '/api/env/endpoint', // 获取运行环境
  deleteEndpoint: API_V1 + '/api/env/endpoint',  // 删除endpoint
  addEndpoint: API_V1 + '/api/env/endpoint',     // 添加endpoint
  addEnv: API_V1 + '/api/env',    // 添加环境
  deleteEnv: API_V1 + '/api/env', // 删除环境
};

export const Catalog = {
    List: API_V1 + '/api/catalog',   // 目录列表
    Create: API_V1 + '/api/catalog', // 创建目录
    Update: API_V1 + '/api/catalog', // 更新目录
    Delete: API_V1 + '/api/catalog', // 删除目录
    DragAndDrop: API_V1 + '/api/catalog/dragSwtich', // 拖拽目录
};

export const History = {
    List: API_V1 + '/api/history/list', // 根据模糊匹配接口路获取历史记录
};

export const Base = {
    FILE_UPLOAD: SFILE_V1 + '/open-api/file/v1/upload', // 阿里云附件上传（公共读权限)
    QueryPlatform: OAPI_V1 + '/bms/admin-api/platform/v1/list', // 查询平台列表【code】
    GetPlatformList: API_V1 + '/api/catalog/platformCodeList', // 查询平台列表【id】
};

export const TimedTask = {
    List: API_V1 + '/api/scheduler', // 获取定时任务列表
    Create: API_V1 + '/api/scheduler', // 创建定时任务
    Pause: API_V1 + '/api/scheduler/stop', // 停止定时任务
    Delete: API_V1 + '/api/scheduler', // 删除定时任务
    Restart: API_V1 + '/api/scheduler/restart', // 删除定时任务
    Update: API_V1 + '/api/scheduler', // 更新接口定时任务
    QueryResult: API_V1 + '/api/scheduler/taskResult', // 获取定时任务执行结果
    Log: API_V1 + '/api/scheduler/taskResult', // 根据定时任务ID获取定时任务运行结果
};

export const Token = {
    List: API_V1 + '/api/token', // 获取Token列表
    Create: API_V1 + '/api/token', // 创建Token
    Update: API_V1 + '/api/token', // 更新Token
    Delete: API_V1 + '/api/token', // 删除Token
    GetPlatformByToken: API_V1 + '/api/token/platform', // 获取token中所有平台（去重）
    GetEnvByPlatfromId: API_V1 + '/api/token/env', // 通过平台ID获取token中所有环境（去重）
    GetTokenByEnvIdAndPlatfromId: API_V1 + '/api/token/userAndToken', // 通过平台ID和环境ID获取token中所有用户和tokenID
};

export const OperationRecords = {
    List: API_V1 + '/api/operate', // 获取操作记录列表
    UserList: API_V1 + '/api/user', // 获取所有用户列表
};

export const PerformanceTest = {
    Create: API_V1 + '/api/jmeter', // 创建压测信息
    Delete: API_V1 + '/api/jmeter', // 删除压测信息数据
    Update: API_V1 + '/api/jmeter', // 更新压测信息数据
    Run: API_V1 + '/jmeter', // 运行压测脚本
    Watch: API_V1 + '/api/jmeter/watchResult', // 查看某个报告信息
    Log: API_V1 + '/api/jmeter/watchLog', // 查看脚本执行的日志信息
    ResultList: API_V1 + '/api/jmeter/jmeterResultList', // 查看所有的脚本执行历史结果列表
    List: API_V1 + '/api/jmeter/jmeterList', // 查看所有上传脚本列表
    Result: API_V1 + '/api/jmeter/jmeterResultListByJmeterIds', // 查看压测脚本执行结果
    CreateByCaseId: API_V1 + '/api/jmeter/generate', // 将接口用例转化为性能测试
    GetJmeterFileText: API_V1 + '/api/analysis/getanaylist', // 获取jmeter脚本文件文本内容
    SyncJmeterFileText: API_V1 + '/api/analysis/updateGetanaylist', // 更新jmeter脚本并同步至数据库
};

export const Home = {
    IntfAndCtlg: API_V1 + '/api/catalog/interface/count', // 查询项目所有平台接口数据
    Intf: API_V1 + '/api/case/count', // 查询项目所有接口数
    IntfExecuteCount: API_V1 + '/api/history/count', // 查询接口执行次数
    IntfTimedTaskCount: API_V1 + '/api/scheduler/interface/count', // 查询接口定时任务数
    IntfTimedTaskExecuteCount: API_V1 + '/api/scheduler/interface/run/count', // 查询接口定时任务执行次数
    JmeterCount: API_V1 + '/api/scheduler/jmeter/count', // 查询jmeter定时任务数
    JmeterTaskExecuteCount: API_V1 + '/api/scheduler/jmeter/run/count', // 查询jmeter定时任务执行次数
};

export const DbManage = {
    ConfList: API_V1 + '/api/db', // 查询所有的数据库配置
    SqlList: API_V1 + '/api/db/sql', // 查询所有的sql语句
    CreateDbConfig: API_V1 + '/api/db', // 添加数据库配置
    UpdateDbConfig: API_V1 + '/api/db', // 更新数据库配置
    DeleteDbConfig: API_V1 + '/api/db', // 删除数据库配置
    AddSql: API_V1 + '/api/db/sql', // 添加sql语句
    UpdateSql: API_V1 + '/api/db/sql', // 更新sql语句
    DeleteSql: API_V1 + '/api/db/sql', // 删除sql语句
    ExecSql: API_V1 + '/api/db/sql/exec', // 执行Sql语句
    QuerySql: API_V1 + '/api/db/query', // 根据ID查询Sql语句
    CheckSql: API_V1 + '/api/db/sql/grammarCheck', // Sql语法检查
};
