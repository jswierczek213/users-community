import { NgModule } from '@angular/core';
import {
  MatButtonModule, MatIconModule, MatMenuModule, MatSnackBarModule, MatBadgeModule
} from '@angular/material';

const material = [
  MatButtonModule,
  MatIconModule,
  MatMenuModule,
  MatSnackBarModule,
  MatBadgeModule
];

@NgModule({
  imports: [material],
  exports: [material]
})
export class MaterialModule { }
