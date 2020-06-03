import { Component } from '@angular/core';

@Component({
  selector: 'app-loader',
  template: `
              <div class="loader-container">
                <div class="loader">
                  <div class="yellow-circle"></div>
                  <div class="black-circle"></div>
                </div>
                <span>Loading</span>
              </div>
            `,
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {}
