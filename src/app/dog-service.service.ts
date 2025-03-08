import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DogService {
  private getBreedsUrl = 'https://dog.ceo/api/breeds/list/all';

  /* The call to Gemini won't work without my Google Cloud account key.
     A production app would need an organizational account and tokenize this key 
     The app will still work, but will lack the AI generated breed description.
   */
  private geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBmkN1KhRhts2kaH1CZ43pVMOJfglsOt8c';

  constructor(private http: HttpClient) { }

  getBreeds(): Observable<any> {
    return this.http.get<string[]>(this.getBreedsUrl);
  }

  getBreedImages(breed: string): Observable<any> {
    const arr = breed.split(" ");
    breed = arr.length > 1 ? arr[1] : arr[0];
    const getBreedImagesUrl = `https://dog.ceo/api/breed/${breed}/images`;
    console.log(getBreedImagesUrl);
    var returnVal = this.http.get<string[]>(getBreedImagesUrl);
    returnVal.subscribe(
      response => console.log(response)
    );
    return returnVal;
  }

  getBreedList(response: any): string[] {
    const breeds: string[] = [];

    for (const breed in response.message) {
      if (response.message.hasOwnProperty(breed)) {
        if (response.message[breed].length > 0) {
          response.message[breed].forEach((subBreed: string) => {
            if (breed=='australian') {
              //breeds.push(`${breed} ${subBreed}`) Avoiding bad data
            }
            else breeds.push(`${subBreed} ${breed}`)
          });
        } else {
          breeds.push(breed);
        }
      }
    }
    console.log(breeds);
    return breeds;
  }

  getBreedImagesList(response: any, breed: string): string[] {
    const arr = breed.split(" ");
    if (arr.length == 1) {
    console.log(response.message);
      return response.message;
    }
    const breedFilter = arr[0];
    console.log(breedFilter);

    const urls = response.message.filter((url: string) => url.includes(breedFilter))
    console.log(urls);
    return urls;

  }

  getBreedDescription(response: any): string {
    return this.formatDescription(response.candidates[0].content.parts[0].text);
  }
  formatDescription(text: string): string {
     // Convert asterisks to HTML bold tags
     return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Convert **text** to <strong>text</strong>
      .replace(/\*(.*?)\*/g, '<em>$1</em>')             // Convert *text* to <em>text</em>
      .replace(/\*/g, '<br><br>');         
 
  }

  callGemini(breed: string): Observable<any> {
    return this.http.post(this.geminiUrl, this.buildGeminiRequest(breed));
  }

  buildGeminiRequest(breed: string): any {
    return `{
        "contents": [
            {
                "parts": [
                    {
                        "text": "${breed} basic facts"
                    }
                ]
            }
        ]
      }`
  }
  
}
