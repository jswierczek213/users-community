import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UserService } from './services/user.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './modules/material.module';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { AllUsersComponent } from './components/all-users/all-users.component';
import { AboutComponent } from './components/about/about.component';
import { LoaderComponent } from './components/loader/loader.component';
import { UserDetailsComponent } from './components/user-details/user-details.component';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { MyProfileComponent } from './components/my-profile/my-profile.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    AllUsersComponent,
    AboutComponent,
    LoaderComponent,
    UserDetailsComponent,
    LoginPageComponent,
    MyProfileComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MaterialModule,
    ReactiveFormsModule
  ],
  providers: [UserService],
  bootstrap: [AppComponent]
})
export class AppModule { }
