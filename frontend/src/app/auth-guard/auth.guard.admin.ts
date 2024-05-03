//auth.guard.admin.ts
import {inject} from '@angular/core';
import {
  CanActivateFn, CanMatchFn, Router, CanActivateChildFn
} from '@angular/router';
import {UserService} from "../service/user.service";

/**
 * 定义管理员的路由守卫
 */
export const adminAuthGuard: CanMatchFn | CanActivateFn | CanActivateChildFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);
  const loggedUser = userService.loggedUser;
  // 检查userService中是否已经保存登录用户的信息
  if (loggedUser) {
    // 如果有，检查用户组是否为2
    return loggedUser.groupId == 2;
  } else {
    // 如果没有，比如页面刷新过，则检查Local Storage中是否有Token
    const token = localStorage.getItem('token');
    if (token) {
      // 有Token的话，根据Token获取用户信息
      userService.getUserByToken(token).subscribe({
        next: (response) => {
          userService.loggedUser = response.body;
          // 如果用户组是2，则跳转至管理员首页
          if(userService.loggedUser && userService.loggedUser.groupId == 2) {
            void router.navigateByUrl("/homepage-admin");
          }
        },
        error: () => {
          localStorage.clear();
          return false;
        }
      });
    }
  }
  return router.parseUrl('/login');
};
