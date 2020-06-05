import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AllUsersComponent } from './components/all-users/all-users.component';
import { AboutComponent } from './components/about/about.component';
import { UserDetailsComponent } from './components/user-details/user-details.component';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { MyProfileComponent } from './components/my-profile/my-profile.component';
import { AuthGuard } from './auth.guard';


const routes: Routes = [
  { path: '', redirectTo: '/all-users', pathMatch: 'full' },
  { path: 'all-users', component: AllUsersComponent },
  { path: 'user/:id', component: UserDetailsComponent },
  { path: 'about', component: AboutComponent },
  { path: 'login-page', component: LoginPageComponent },
  { path: 'my-profile', component: MyProfileComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
