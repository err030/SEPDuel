import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './component/login/login.component';
import { RegisterComponent } from './component/register/register.component';
import {VerifyComponent} from "./component/verify/verify.component";
import { userAuthGuard } from './auth-guard/auth.guard.user';
import { adminAuthGuard } from './auth-guard/auth.guard.admin';
import {HomepageUserComponent} from "./homepage-user/homepage-user.component";
import {HomepageAdminComponent} from "./homepage-admin/homepage-admin.component";
import {DeckListComponent} from "./component/deck-list/deck-list.component";
import {CardListComponent} from "./component/card-list/card-list.component";
import {AboutComponent} from "./component/about/about.component";

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify', component: VerifyComponent },
  { path: '**', redirectTo: 'login' },
  { path: 'deck-list', component: DeckListComponent },
  { path: 'card-list', component: CardListComponent },
  { path: 'about', component: AboutComponent },
  {
    path: 'user',
    component: HomepageUserComponent,
    canActivate: [userAuthGuard] // 应用 userAuthGuard
  },
  // 示例受保护的管理员页面路由
  {
    path: 'admin',
    component: HomepageAdminComponent,
    canActivate: [adminAuthGuard] // 应用 adminAuthGuard
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
