import { Component } from '@angular/core';

@Component({
  selector: 'app-loader',
  template: `
              <div class="loader-container">
                <div class="circle-container">
                  <div class="circle1"></div>
                  <div class="circle2"></div>
                  <div class="circle3"></div>
                  <div class="circle4"></div>
                </div>
              </div>
            `,
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {}
