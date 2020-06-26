import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { finalize, timeout } from 'rxjs/operators';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  registrationForm: FormGroup;
  loginForm: FormGroup;

  displayLoginErrors = false;
  displayRegistrationErrors = false;

  notFound = false;
  displayLoader = false;

  errorLoginOccured = false;
  errorRegistrationOccured = false;

  ngOnInit() {
    this.buildRegistrationForm();
    this.buildLoginForm();

    if (this.userService.currentUserValue()) {
      this.router.navigate(['/all-users']);
    }
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

    this.displayLoader = true;

    let nickname: string = this.registrationForm.value.nickname.trim();
    nickname = nickname.replace(/\s/g, '');
    const password = this.registrationForm.value.password.trim();
    const confirmPassword = this.registrationForm.value.confirmPassword.trim();
    const introduction = this.registrationForm.value.introduction.trim();

    if (password !== confirmPassword) {
      return this.displayRegistrationErrors = true;
    }

    this.userService.register(nickname, password, introduction)
    .pipe(
      timeout(10000),
      finalize(() => this.displayLoader = false)
    )
    .subscribe(
      (result: any) => {
        localStorage.setItem('user', JSON.stringify(result.savedUser));
        this.userService.updateUserValue();
        this.router.navigate(['/posts']);
      },
      (error) => {
        this.errorRegistrationOccured = true;
        this.displayRegistrationErrors = true;
        console.error(error);
      },
      () => {
        const user = this.userService.currentUserValue();
        this.notificationService.addNotification(
          user._id,
          user.nickname,
          'Hi there :)',
          'Welcome into our awesome community! You can now take a look on unlocked functionality.',
          '/notifications',
          'info',
          true
        ).subscribe();
      }
    );
  }

  submitLoginForm() {
    if (this.loginForm.invalid) {
      return this.displayLoginErrors = true;
    }

    this.displayLoader = true;

    const nickname = this.loginForm.value.nickname.trim();
    const password = this.loginForm.value.password.trim();

    this.userService.login(nickname, password)
    .pipe(
      timeout(10000),
      finalize(() => this.displayLoader = false)
    )
    .subscribe(
      (result: Response) => {
        if (result) {
          localStorage.setItem('user', JSON.stringify(result));
          this.userService.updateUserValue();
          this.router.navigate(['/posts']);
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
    this.router.navigate(['/posts']);
  }

}
