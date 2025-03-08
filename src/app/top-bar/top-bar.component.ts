import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent implements OnInit {

  dropdownOpen = false;
  
  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }
  
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.menu')) {
      this.dropdownOpen = false;
    }
  }

  constructor() { }

  ngOnInit(): void {
  }

}
