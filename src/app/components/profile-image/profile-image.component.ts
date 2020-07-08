import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile-image',
  templateUrl: './profile-image.component.html',
  styleUrls: ['./profile-image.component.scss']
})
export class ProfileImageComponent implements OnInit {

  constructor() { }
  @Input() imageAsBase64: string;
  @Input() imageSize = '75px';

  fontSize: string;

  ngOnInit(): void {
    let imageSizeNumber = parseInt(this.imageSize.split('px')[0], 10);
    imageSizeNumber = imageSizeNumber * 0.6;
    this.fontSize = imageSizeNumber.toString() + 'px';
  }

}
