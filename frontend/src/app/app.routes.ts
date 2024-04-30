import {userAuthGuard} from "./auth-guard/auth.guard.user";
import {adminAuthGuard} from "./auth-guard/auth.guard.admin";
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {LoginComponent} from "./component/login/login.component";
import {RegisterComponent} from "./component/register/register.component";
import {VerifyComponent} from "./component/verify/verify.component";
import { HomepageUserComponent } from "./component/homepage-user/homepage-user.component";
import { HomepageAdminComponent } from "./component/homepage-admin/homepage-admin.component";


import {HomeComponent} from "./home/home.component";
import {AboutComponent} from "./about/about.component";
import {CardListComponent} from "./card-list/card-list.component";
import {DeckListComponent} from "./deck-list/deck-list.component";


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  { path: 'verify', component: VerifyComponent },
  { path: 'homepage-user', component: HomepageUserComponent, canActivate: [userAuthGuard] },
  { path: 'homepage-admin', component: HomepageAdminComponent, canActivate: [adminAuthGuard] },

  {path: 'home', component: HomeComponent},
  {path: 'about', component: AboutComponent},
  {path: 'card-list', component: CardListComponent},
  {path: 'deck-list', component: DeckListComponent},

  {path: '**', redirectTo: 'login'}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
