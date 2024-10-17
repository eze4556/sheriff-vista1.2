import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BitlyService {
  private apiUrl = 'https://api-ssl.bitly.com/v4/shorten';
  private accessToken = '240a3a26194de9c1916d6f88e5ed7ce6f320ba7a'; // Asegúrate de manejar este token de forma segura

  constructor(private http: HttpClient) {}

  shortenUrl(longUrl: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    });

    const body = {
      long_url: longUrl
    };

    return this.http.post(this.apiUrl, body, { headers });
  }
}
