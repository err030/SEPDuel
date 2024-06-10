import {userAuthGuard} from "./auth-guard/auth.guard.user";
import {adminAuthGuard} from "./auth-guard/auth.guard.admin";
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {LoginComponent} from "./component/login/login.component";
import {RegisterComponent} from "./component/register/register.component";
import {VerifyComponent} from "./component/verify/verify.component";
import {HomepageUserComponent} from "./component/homepage-user/homepage-user.component";
import {HomepageAdminComponent} from "./component/homepage-admin/homepage-admin.component";


import {CardListComponent} from "./component/card-list/card-list.component";
import {DeckListComponent} from "./component/deck-list/deck-list.component";
import {ProfileComponent} from "./component/profile/profile.component";
import {ResetPasswordComponent} from "./component/reset-password/reset-password.component";
import {AllCardsComponent} from "./component/all-cards/all-cards.component";
import {FriendlistComponent} from "./component/friendlist/friendlist.component";
import {CardUploadComponent} from "./component/card-upload/card-upload.component";
import {AddfriendComponent} from "./component/addfriend/addfriend.component";
import {FriendComponent} from "./component/friend/friend.component";
import {AdminUserlistComponent} from "./component/admin-userlist/admin-userlist.component";
import {AllfriendlistComponent} from "./component/allfriendlist/allfriendlist.component";
import {DuelBoardComponent} from "./component/duel-board/duel-board.component";
import {LeaderboardComponent} from "./component/leaderboard/leaderboard.component";
import {LootboxComponent} from "./component/lootbox/lootbox.component";



export const routes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'verify', component: VerifyComponent},
  {path: 'homepage-user', component: HomepageUserComponent, canActivate: [userAuthGuard]},
  {path: 'homepage-admin', component: HomepageAdminComponent, canActivate: [adminAuthGuard]},
  {path: 'profile', component: ProfileComponent},
  {path: 'reset-password', component: ResetPasswordComponent},

  {path: 'card-list', component: CardListComponent},
  {path: 'deck-list', component: DeckListComponent},
  {path: 'all-cards', component: AllCardsComponent},
  {path: "card-upload", component: CardUploadComponent},
  {path: "lootbox", component: LootboxComponent},
  {path: 'duel', component: DuelBoardComponent},


  {path: 'addfriend', component:AddfriendComponent},

  {
    path: 'admin-userlist',
    component: AdminUserlistComponent,
    canActivateChild: [adminAuthGuard],
    children: [
      {path: 'allfriendlist/:userId', component: AllfriendlistComponent},
    ]
  },

  {
    path: 'friendlist',
    component: FriendlistComponent,
    canActivateChild: [userAuthGuard],
    children: [
      {path: 'friend/:friendId', component: FriendComponent},
    ]
  },

  {path: 'leaderboard', component: LeaderboardComponent},

  {path: '**', redirectTo: 'login'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
