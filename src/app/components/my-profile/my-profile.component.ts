import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss']
})
export class MyProfileComponent implements OnInit {

  constructor(
    public userService: UserService,
    private fb: FormBuilder
  ) { }

  user: User;

  editForm: FormGroup;
  displayEditForm = false;
  displayLoader = false;

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

}
