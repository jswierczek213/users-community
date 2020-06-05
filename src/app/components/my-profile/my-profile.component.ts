import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize, timeout } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss']
})
export class MyProfileComponent implements OnInit {

  constructor(
    public userService: UserService,
    private fb: FormBuilder,
    private router: Router
  ) { }

  user: User;

  editForm: FormGroup;
  displayEditForm = false;
  displayLoader = false;
  displayConfirm = false;

  ngOnInit() {
    this.user = this.userService.currentUserValue();
    this.buildEditForm();
  }

  buildEditForm() {
    this.editForm = this.fb.group({
      introduction: [this.user.introduction, Validators.maxLength(100)],
      description: [this.user.description, Validators.maxLength(255)]
    });
  }

  toggleEditForm() {
    this.displayEditForm = !this.displayEditForm;
  }

  showConfirm() {
    this.displayConfirm = true;
  }

  submit() {
    if (this.editForm.invalid) {
      return;
    }

    this.displayLoader = true;

    const values = {
      introduction: this.editForm.value.introduction,
      description: this.editForm.value.description
    };

    this.userService.editUserData(this.user._id, values)
    .pipe(
      timeout(7000),
      finalize(() => {
        this.displayLoader = false;
        this.toggleEditForm();
      })
    )
    .subscribe(
      (data) => {
        // Update local user data
        this.user.description = values.description;
        this.user.introduction = values.introduction;
        localStorage.setItem('user', JSON.stringify(this.user));
        this.userService.updateUserValue();
      },
      (error) => console.error(error)
    );
  }

  deleteAccount() {
    this.displayLoader = true;

    this.userService.deleteUser(this.user._id)
    .pipe(
      finalize(() => this.displayLoader = false)
    )
    .subscribe(
      (result) => null,
      (error) => console.error(error),
      () => {
        localStorage.removeItem('user');
        this.userService.updateUserValue();
        this.router.navigate(['/all-users']);
      }
    );
  }

}
