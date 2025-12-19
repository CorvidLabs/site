import { Component, input, OnInit } from '@angular/core';

@Component({
  selector: 'app-nft-card',
  templateUrl: 'nft-card.component.html'
})
export class NftCardComponent implements OnInit {
  imageUrl = input<string>('');
  title = input<string>('');
  description = input<string>('');

  constructor() {}
  ngOnInit() {}
}