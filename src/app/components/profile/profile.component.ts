import { Component, OnInit, Input } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user';
import { timeout, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  constructor(
    public userService: UserService,
    private fb: FormBuilder,
    private router: Router
  ) { }

  @Input() myProfile: boolean;
  @Input() user: User;

  editForm: FormGroup;
  displayEditForm = false;
  displayLoader = false;
  displayConfirm = false;
  displayErrors = false;
  serverError = false;

  ngOnInit() {
    this.buildEditForm();
  }

  buildEditForm() {
    this.editForm = this.fb.group({
      introduction: [this.user.introduction, Validators.maxLength(100)],
      description: [this.user.description, Validators.maxLength(600)]
    });
  }

  toggleEditForm() {
    this.displayEditForm = !this.displayEditForm;
  }

  toggleConfirm() {
    this.displayConfirm = !this.displayConfirm;
  }

  submit() {
    this.displayErrors = false;
    this.serverError = false;

    if (this.editForm.invalid) {
      this.displayErrors = true;
      return;
    }

    this.displayLoader = true;

    const values = {
      introduction: this.editForm.value.introduction.trim(),
      description: this.editForm.value.description.replace(/\n(?=\n)/g, '').trim()
    };

    this.userService.editUserData(this.user._id, values)
    .pipe(
      timeout(10000),
      finalize(() => this.displayLoader = false)
    )
    .subscribe(
      (data) => {
        // Update local user data
        this.user.description = values.description;
        this.user.introduction = values.introduction;
        localStorage.setItem('user', JSON.stringify(this.user));
        this.userService.updateUserValue();
      },
      (error) => this.serverError = true,
      () => this.toggleEditForm()
    );
  }

  deleteAccount() {
    this.displayLoader = true;
    this.serverError = false;

    this.userService.deleteUser(this.user._id)
    .pipe(
      finalize(() => this.displayLoader = false)
    )
    .subscribe(
      (result) => null,
      (error) => this.serverError = true,
      () => {
        localStorage.removeItem('user');
        this.userService.updateUserValue();
        this.router.navigate(['/all-users']);
      }
    );
  }

}
