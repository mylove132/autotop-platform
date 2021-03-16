import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BaseComponent, LoadStatusEnum } from '../../common/base-component/base.component';
import { LocalDataService } from '../../services/local-data.service';
import { UserService } from './../../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent extends BaseComponent implements OnInit {
  form: FormGroup;
  errorStatus = false;
  errorTip: any;
  loadStatus = LoadStatusEnum.LoadData;
  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private localDataService: LocalDataService
  ) {
    super();
    this.form = this.formBuilder.group({
      userName: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  loadBg() {
    const placeholder = document.querySelector('.placeholder') as any;
    const small = placeholder.querySelector('.img-small') as any;
    const img = new Image();
    img.src = small.src;
    img.onload = function () {
      small.classList.add('loaded');
    };
    const imgLarge = new Image();
    imgLarge.src = placeholder.dataset.large;
    imgLarge.style.cssText = 'position: absolute;left:0;top:0;opacity:0;width:100%;height:100%;transition: opacity 1s linear;';
    imgLarge.onload = function () {
      imgLarge.style.cssText = 'position: absolute;left:0;top:0;opacity:1;width:100%;height:100%;transition: opacity 1s linear;';
    };
    placeholder.appendChild(imgLarge);
  }

  login() {
    this.loadStatus = LoadStatusEnum.Loading;
    this.userService.login(this.form.value).subscribe(res => {
      if (res.result) {
        if (typeof res.data === 'string') {
          this.errorStatus = true;
          this.errorTip = res.data;
        } else {
          this.success(res.data);
        }
      } else {
        this.errorStatus = true;
        this.errorTip = '请求失败';
      }
      this.loadStatus = LoadStatusEnum.LoadData;
    });
  }

  ngOnInit() {
    this.loadBg();
  }


  success(data): void {
    this.localDataService.setUserInfo(data['userInfoVO']);
    this.localDataService.setMenuInfo(data['menuList']);
    this.router.navigate(['./home-page']);
  }

  inputChange(event) {
    this.errorStatus = false;
  }

}
