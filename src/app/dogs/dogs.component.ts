import { AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { catchError, map, tap } from 'rxjs/operators';

import { Observable, of } from 'rxjs';
import { DogService } from '../dog-service.service';

@Component({
  selector: 'app-dogs',
  templateUrl: './dogs.component.html',
  styleUrls: ['./dogs.component.css']
})
export class DogsComponent implements OnInit, AfterViewInit {
  dropdownOpen = false;
  breeds$: Observable<string[]> = of([]); 
  breedImageUrls: string[] = [];
  visibleImages: string[] = []; // Images currently displayed
  selectedBreed: string = '';
  selectedBreedDescription: string = '';
  showDogDisplay = false;
  observer!: IntersectionObserver;
  
  @ViewChildren('photoObserver') photos!: QueryList<ElementRef>; // References to all visible images

  
  constructor(private dogService: DogService) { }

  ngOnInit(): void {
    this.breeds$ = this.dogService.getBreeds().pipe(
      map(response => this.dogService.getBreedList(response))
    );
  }

  ngAfterViewInit(): void {
    this.setupObserver();
  }

  setupObserver(): void {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute('data-index')!, 10);
          if (index === this.visibleImages.length - 1) {
            this.loadMoreImages();
          }
        }
      })
    });

    this.photos.changes.subscribe((photoElements: QueryList<ElementRef>) => {
      photoElements.forEach((photo) => this.observer.observe(photo.nativeElement))
    });
  }

  loadMoreImages(): void {
    const currentLength = this.visibleImages.length;
    const nextImages = this.breedImageUrls.slice(currentLength, currentLength + 2);
    this.visibleImages = [...this.visibleImages, ...nextImages];
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectBreed(event: Event): void {
    const breed = (event.target as HTMLSelectElement).value;
    if (breed) {
      this.selectedBreed = breed;
      console.log(this.selectedBreed);
      this.toggleDropdown();
      this.showDogDisplay = true;

      //Call to get dog images
      this.dogService.getBreedImages(this.selectedBreed).pipe(
        map(response => this.dogService.getBreedImagesList(response, this.selectedBreed))
      ).subscribe(result => {
          this.breedImageUrls = result;
          this.visibleImages = this.breedImageUrls.slice(0, 5);
          console.log(this.breedImageUrls);
          console.log(result);
        }
      );

      //Call to get dog descriptions
      this.dogService.callGemini(this.selectedBreed).pipe(
        map(response => this.dogService.getBreedDescription(response))
      ).subscribe(result => {
        this.selectedBreedDescription = result;
        console.log(this.selectedBreedDescription);
      });

    }
    else console.error("Selected breed is null!");
    
  }

}
