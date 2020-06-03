import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AllUsersComponent } from './components/all-users/all-users.component';
import { AboutComponent } from './components/about/about.component';
import { UserDetailsComponent } from './components/user-details/user-details.component';


const routes: Routes = [
  { path: '', redirectTo: '/all-users', pathMatch: 'full' },
  { path: 'all-users', component: AllUsersComponent },
  { path: 'about', component: AboutComponent },
  { path: 'user/:id', component: UserDetailsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
