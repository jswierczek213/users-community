import { NgModule } from '@angular/core';
import {
  MatButtonModule, MatIconModule, MatMenuModule
} from '@angular/material';

const material = [
  MatButtonModule,
  MatIconModule,
  MatMenuModule
];

@NgModule({
  imports: [material],
  exports: [material]
})
export class MaterialModule { }
