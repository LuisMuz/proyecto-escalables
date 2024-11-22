import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GalleryService {
  private API_URL = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  getPublicImages(token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', token);
    return this.http.get(`${this.API_URL}/images/gallery`, { headers });
  }
  
}
