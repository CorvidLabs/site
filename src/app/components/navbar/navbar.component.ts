import { CommonModule } from '@angular/common';
import { Component, input, InputSignal, OnInit } from '@angular/core';

export interface NavbarItem {
  label: string;
  link: string;
  styling?: string;
}

@Component({
  selector: 'cvd-navbar',
  templateUrl: 'navbar.component.html',
  imports: [CommonModule]
})
export class NavbarComponent implements OnInit {
  navbarItems: InputSignal<NavbarItem[]> = input.required<NavbarItem[]>();
  pixelBorder: InputSignal<boolean> = input<boolean>(true);

  constructor() { }

  ngOnInit() { }
}