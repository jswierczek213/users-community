import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) { }

  registrationForm: FormGroup;
  loginForm: FormGroup;

  displayLoginErrors = false;
  displayRegistrationErrors = false;

  notFound = false;

  errorLoginOccured = false;
  errorRegistrationOccured = false;

  ngOnInit() {
    this.buildRegistrationForm();
    this.buildLoginForm();
  }

  buildRegistrationForm() {
    this.registrationForm = this.fb.group({
      nickname: ['', [ Validators.required, Validators.minLength(3), Validators.maxLength(15) ]],
      password: ['', [ Validators.required, Validators.minLength(5) ]],
      confirmPassword: ['', [ Validators.required ]],
      introduction: ['']
    });
  }

  buildLoginForm() {
    this.loginForm = this.fb.group({
      nickname: ['', [ Validators.required, Validators.maxLength(15) ]],
      password: ['', [ Validators.required ]]
    });
  }

  submitRegistrationForm() {
    if (this.registrationForm.invalid) {
      return this.displayRegistrationErrors = true;
    }

    interface Response {
      userData?: User;
      loggedIn: boolean;
    }

    const nickname = this.registrationForm.value.nickname.trim();
    const password = this.registrationForm.value.password.trim();
    const confirmPassword = this.registrationForm.value.confirmPassword.trim();
    const introduction = this.registrationForm.value.introduction.trim();

    if (password !== confirmPassword) {
      return this.displayRegistrationErrors = true;
    }

    this.userService.register(nickname, password, introduction)
    .subscribe(
      (result: Response) => {
        localStorage.setItem('loggedIn', result.loggedIn.toString());
        localStorage.setItem('myId', result.userData._id);
        localStorage.setItem('myNickname', result.userData.nickname);
        this.router.navigate(['/all-users']);
      },
      (error) => {
        this.errorRegistrationOccured = true;
        this.displayRegistrationErrors = true;
        console.error(error);
      }
    );
  }

  submitLoginForm() {
    if (this.loginForm.invalid) {
      return this.displayLoginErrors = true;
    }

    interface Response {
      userData?: User;
      loggedIn: boolean;
    }

    const nickname = this.loginForm.value.nickname.trim();
    const password = this.loginForm.value.password.trim();

    this.userService.login(nickname, password)
    .subscribe(
      (result: Response) => {
        if (result.loggedIn) {
          localStorage.setItem('loggedIn', result.loggedIn.toString());
          localStorage.setItem('myId', result.userData._id);
          localStorage.setItem('myNickname', result.userData.nickname);
          this.router.navigate(['/all-users']);
        } else {
          this.loginForm.reset();
          this.registrationForm.reset();
          this.displayLoginErrors = true;
          this.notFound = true;
        }
      },
      (error) => {
        this.errorLoginOccured = true;
        this.displayLoginErrors = true;
        console.error(error);
      }
    );
  }

  goBack() {
    this.router.navigate(['/all-users']);
  }

}
