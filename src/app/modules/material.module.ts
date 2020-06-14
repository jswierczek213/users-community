import { NgModule } from '@angular/core';
import {
  MatButtonModule, MatIconModule, MatMenuModule, MatSnackBarModule
} from '@angular/material';

const material = [
  MatButtonModule,
  MatIconModule,
  MatMenuModule,
  MatSnackBarModule
];

@NgModule({
  imports: [material],
  exports: [material]
})
export class MaterialModule { }
