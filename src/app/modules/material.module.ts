import { NgModule } from '@angular/core';
import {
  MatButtonModule, MatIconModule
} from '@angular/material';

const material = [
  MatButtonModule,
  MatIconModule
];

@NgModule({
  imports: [material],
  exports: [material]
})
export class MaterialModule { }
