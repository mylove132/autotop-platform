import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalDataService {

  storageDatas = {};

  authUrl;

  constructor() {
    // 将本地数据，加载到内存中
    this.loadStorageData();
  }

  private loadStorageData() {
    const keys = Object.keys(StorageKeys);
    if (keys && keys.length > 0) {
      for (let i = 0; i < keys.length; i++) {
        if (keys[i] === StorageKeys.UserInfoVO || keys[i] === StorageKeys.MenuList) {
          this.storageDatas[keys[i]] = JSON.parse(this.getStorageItem(keys[i]));
        } else {
          this.storageDatas[keys[i]] = this.getStorageItem(keys[i]);
        }
      }
    }
  }

  public getStorageItem(key) {
    return localStorage.getItem(key);
  }

  public setStorageItem(key, value) {
    localStorage.setItem(key, value);
  }

  public removeStorageItem(key) {
    localStorage.removeItem(key);
  }

  public updateInfo(info) {
    this.storageDatas[StorageKeys.UserInfoVO] = info['userInfoVO'];
    if (this.getUserInfo()) {
      this.storageDatas[StorageKeys.UserInfoVO] = Object.assign(this.getUserInfo(), info);
    } else {
      this.storageDatas[StorageKeys.UserInfoVO] = Object.assign({}, info);
    }
    this.setUserInfo(this.storageDatas[StorageKeys.UserInfoVO]);
  }

  public isLogin() {
    return this.getUserInfo() && this.getMenuInfo();
  }

  public removeUserInfo() {
    this.storageDatas[StorageKeys.UserInfoVO] = null;
    this.removeStorageItem(StorageKeys.UserInfoVO);
  }

  public setUserInfo(value) {
    this.storageDatas[StorageKeys.UserInfoVO] = value;
    this.setStorageItem(StorageKeys.UserInfoVO, JSON.stringify(value));
  }

  public getUserInfo() {
    if (this.storageDatas[StorageKeys.UserInfoVO]) {
      return this.storageDatas[StorageKeys.UserInfoVO];
    } else {
      if (this.getStorageItem(StorageKeys.UserInfoVO)) {
        this.storageDatas[StorageKeys.UserInfoVO] = JSON.parse(this.getStorageItem(StorageKeys.UserInfoVO));
        return this.storageDatas[StorageKeys.UserInfoVO];
      } else {
        return null;
      }
    }
  }

  public setMenuInfo(value) {
    this.storageDatas[StorageKeys.MenuList] = value;
    this.setStorageItem(StorageKeys.MenuList, JSON.stringify(value));
  }

  public getMenuInfo() {
    if (this.storageDatas[StorageKeys.MenuList]) {
      return this.storageDatas[StorageKeys.MenuList];
    } else {
      if (this.getStorageItem(StorageKeys.MenuList)) {
        this.storageDatas[StorageKeys.MenuList] = JSON.parse(this.getStorageItem(StorageKeys.MenuList));
        return this.storageDatas[StorageKeys.MenuList];
      } else {
        return null;
      }
    }
  }

  public getToken() {
    if (this.getUserInfo()) {
      return this.getUserInfo()['token'];
    } else {
      return null;
    }
  }

  public getJavaToken() {
    if (this.getUserInfo()) {
      return this.getUserInfo()['javaToken'];
    } else {
      return null;
    }
  }

  public getUserId() {
    if (this.getUserInfo()) {
      return this.getUserInfo()['id'];
    } else {
      return null;
    }
  }

  public getTeacherId() {
    if (this.getUserInfo()) {
      return this.getUserInfo()['teacherId'];
    } else {
      return null;
    }
  }

  public getRoleId() {
    if (this.getUserInfo()) {
      return this.getUserInfo()['roleId'];
    } else {
      return null;
    }
  }

  public getUserName() {
    if (this.getUserInfo()) {
      return this.getUserInfo()['name'];
    } else {
      return null;
    }
  }

  private clearStorage() {
    const keys = Object.keys(StorageKeys);
    if (keys && keys.length > 0) {
      for (let i = 0; i < keys.length; i++) {
        this.storageDatas[keys[i]] = null;
      }
    }
    localStorage.clear();
  }

  public clearAll() {
    this.clearStorage();
  }

}

export const StorageKeys = {
  MenuList: 'AotMenuList',
  UserInfoVO: 'AotUserInfoVO'
};
