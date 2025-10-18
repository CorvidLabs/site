import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-nft-card',
  templateUrl: 'nft-card.component.html'
})
export class NftCardComponent implements OnInit {
  @Input() imageUrl: string = '';
  @Input() title: string = '';
  @Input() description: string = '';

  constructor() {}
  ngOnInit() {}
}