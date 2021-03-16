import { environment } from '../../environments/environment';
export const ENV_TITLE: string = environment.title;

// 8位简写UUID唯一编码
export const eightDigitUUID = () => {
    let currentDate = Date.now();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
        currentDate += performance.now();
    }
    return 'xxxxxxxx'.replace(/[xy]/g, function (c) {
        // tslint:disable-next-line:no-bitwise
        const randomCode = (currentDate + Math.random() * 16) % 16 | 0;
        currentDate = Math.floor(currentDate / 16);
        // tslint:disable-next-line:no-bitwise
        return (c === 'x' ? randomCode : (randomCode & 0x3 | 0x8)).toString(16);
    });
};


// 获取当前环境下的域名地址
export const currentDomainAddress = () => {
    switch (ENV_TITLE) {
        case 'test': return 'https://autotop.t.blingabc.com';
        case 'prod': return 'https://autotop.blingabc.com';
        default: return `https://autotop-${ENV_TITLE}.t.blingabc.com`;
    }
};

// string类型的Map转对象
export const strMapToObj = (strMap: Map<string, string>) => {
    const obj = Object.create(null);
    for (const[k, v] of strMap) {
      obj[k] = v;
    }
    return obj;
};

// 转换boolean值
export const toBoolean = (value: boolean | string): boolean => {
    return (value != null && `${value}` !== 'false');
};
