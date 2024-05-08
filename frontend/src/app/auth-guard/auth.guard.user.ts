//auth.guard.user.ts
import {inject} from '@angular/core';
import {
  CanActivateFn, CanMatchFn, Router, CanActivateChildFn
} from '@angular/router';
import {UserService} from "../service/user.service";

/**
 * 定义普通用户的路由守卫
 */
export const userAuthGuard: CanMatchFn | CanActivateFn | CanActivateChildFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);
  const loggedUser = userService.loggedUser;
  // 检查userService中是否已经保存登录用户的信息
  if (loggedUser) {
    // 如果有，检查用户组是否为1
    return loggedUser.groupId == 1;
  } else {
    // 如果没有，比如页面刷新过，则检查Local Storage中是否有Token
    const token = localStorage.getItem('token');
    if (token) {
      // 有Token的话，根据Token获取用户信息
      userService.getUserByToken(token).subscribe({
        next: (response) => {
          userService.loggedUser = response.body;
          // 如果用户组是1，则跳转至普通用户首页
          if (userService.loggedUser && userService.loggedUser.groupId == 1) {
            void router.navigateByUrl("/homepage-user");
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
