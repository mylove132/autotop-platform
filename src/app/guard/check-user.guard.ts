import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LocalDataService } from '../services/local-data.service';

@Injectable()
export class CheckUserGuard implements CanActivate {

  constructor(
    private router: Router,
    private localDataService: LocalDataService
  ) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      if (this.localDataService.isLogin() || true) {
        return true;
      } else {
        this.router.navigate(['./login']);
        return false;
      }
  }

}
