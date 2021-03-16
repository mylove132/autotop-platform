// Node数据例子
export interface SelectItem {
    displayName: string;
    iconName: string;
    children?: SelectItem[];
}

// 组件配置项
export interface Options {
    childrenField?: string;
    displayField?: string;
    iconField?: string;
    idField?: string;
    useFullLabel?: boolean;
    multiply?: boolean; // 是否需要多个根节点，默认是否，即组件会自动创建一个Root根节点
    placeholder?: string;
    branchClick?: boolean; // 是否支持枝干节点点选事件，默认不支持
}
