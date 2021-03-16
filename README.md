# AutoTop

这个项目是用 [Angular CLI](https://github.com/angular/angular-cli) 9.1.0版生成的.

> 遗留待优化的问题（PS：不影响生产的使用）：
> 1. @angular-builders/custom-webpack 打包工具需要升级（issues： https://github.com/angular/angular/issues/37731）
> 2. ngx-markdown、ngx-echart、ang-jsoneditor、socket.io-client 的CommonJS依赖打包警告（https://angular.io/guide/build#configuring-commonjs-dependencies）

# CRM菜单权限配置

菜单级别 | 中文名 | 英文名 | 菜单URL | 菜单Icon | 菜单描述 | 菜单顺序
---|---|---|---|---|---|---
**一级** | **首页** | **home page** | **/home-page** | **assets/images/work_icon.png** | **数据面板以及汇总相关** | **1**
**一级** | **自动化测试** | **automated test** | **/home-page** | **assets/images/default_icon.png** | **自动化测试相关** | **2**
二级 | 接口测试 | interface test | /home-page/communication/request-table | assets/images/default_icon.png | 单个或者多个接口和用例测试 | 1
二级 | 环境配置 | environment configuration | /home-page/conference/config-manage | assets/images/default_icon.png | 环境配置相关 | 2
二级 | endpoint配置 | endpoint configuration | /home-page/conference/endpoint-manage | assets/images/default_icon.png | endpoint相关配置 | 3
二级 | 历史记录 | historical record | /home-page/conference/history-log | assets/images/default_icon.png | 用例测试历史记录相关 | 4
二级 | 定时任务 | timed task | /home-page/conference/timed-task | assets/images/default_icon.png | 用例测试定时任务相关 | 5
二级 | token配置 | token configuration | /home-page/conference/token-manage | assets/images/default_icon.png | token配置相关 | 6
二级 | 操作记录 | operate record | /home-page/conference/operation-records | assets/images/default_icon.png | 测试平台操作记录 | 7
**一级** | **性能测试** | **performance testing** | **/home-page/conference/performance-test** | **assets/images/default_icon.png** | **压测以及性能测试相关** | **9**

## 比邻web项目规范梳理1.0
## [参考风格指南](https://angular.cn/guide/styleguide)
### 一 项目结构：
```
├── e2e                                 端到端测试目录
├── src                                 源码目录
|   ├── app                             应用程序源码目录
|   |   ├── common                      公共组件目录
|   |   ├── config                      公共配置目录
|   |   ├── decorators                  公共装饰器目录
|   |   ├── directives                  公共指令目录
|   |   ├── guard                       公共守卫目录
|   |   ├── home                        模块具体内容/懒加载方式加载各个模块（包含库）
|   |   ├── interceptor                 拦截器目录
|   |   ├── modules                     项目模块化目录
|   |   ├── pipes                       公共管道模块
|   |   ├── services                    公共服务模块
|   |   ├── utils                       公共工具模块
|   |   ├── app-routing.module.ts       根路由模块文件
|   |   ├── app.component.html          入口 页面
|   |   ├── app.component.scss          入口 页面样式
|   |   ├── app.component.ts            入口 页面逻辑
|   |   └── app.module.ts               根模块文件
|   ├── assets                          资源文件目录
|   |   ├── css                         css目录
|   |   ├── icons                       icons目录
|   |   ├── icons                       icons目录
|   |   ├── images                      公共图片目录
|   |   └── js                          js目录
|   ├── environments                    环境配置目录
|   ├── style.scss                      全局样式文件 
|   ├── index.html                      index 页面目录
|   └── main.ts                         项目入口文件
├── angular.json                        Angular脚手架配置文件
├── extra-webpack-config.js             自定义WebPack打包脚本文件
├── tsconfig.json                       全局TypeScript编译配置文件
├── tslint.json                         全局TypeScript语法检查配置文件
└── package.json                        全局项目依赖配置文件
```

### 二 代码规范:
- 1.组件规范
   * 1.1 组件相关命名以英文翻译小写 复合名称采用-分割，如：

    ```
        audio.component.html, role-management.component.html;
    ```
   * 1.2 ts文件下的方法声明、自定义变量等添加注释说明用途，如：

    ```
            imageShow: boolean = false; // 是否显示放大图片 
            imageUrl: string; // 图片url
    ```
   - 1.3 scss样式声明与组件风格保持一致，如：

    ```
        .main {}
        .image-dialog {}
    ```
   - 1.4 禁止使用数字与拼音声明组件、服务、指令、管道（使用业务名的英文翻译）

- 2.删除无效引用

- 3.module规范
   - 3.1 CONTENT_COMPONENT数组接收注入的组件，如：
   
    ```
        const CONTENT_COMPONENT = [
            WordManagementComponent,
            WordImpComponent,
            ...
        ];
    ```
   - 3.2 CONTENT_PROVIDERS接收注入的服务，如：

    ```
    const CONTENT_PROVIDERS = [
        ClassService,
        LessonService,
        ...
    ];
    ```

#### 4.变量规范
- 4.1 驼峰式-首字母小写，如：

```
firstName: string;
```
- 4.2 公有属性和局部变量不能用_开头;

#### 5.方法规范
- 5.1 当期服务命名规范小写+xxx(业务名称) 加注解(方法名称 接口地址)，如：

```
        /**
            * 角色对话练习发布/冻结/解冻
            * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=1280546
            * @param parm
            * @returns {Observable<any[]>}
            */
        updateRolesStatus(params): Observable<any> {
        return xxx;}
```
- 5.2 声明例子，如：
   - 获取信息以getXXX（业务名）
   - 修改信息以updateXXX（业务名）
   - 添加信息以addXXX（业务名）
   - 删除信息以delXXX（业务名）
   - 设置信息以setXXX（业务名）
   - 自定义其他方法以小写前缀+XXX（业务名）

#### 6.注释规范

- 6.1 属性必须加注释;
- 6.2 方法超过10行必须加注释;

#### 7.有订阅情况离开页面需销毁

#### 8.常用的命名

```
    constructor(
        private contentService: ContentService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private modalCtrl: ModalController) { }
```