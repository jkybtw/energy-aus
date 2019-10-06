import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FestivalService {
  // uri = 'http://eacodingtest.digital.energyaustralia.com.au/api/v1/festivals';
  // hosting proxy server to bypass CORS error
  uri = 'https://ea-back-135q34.herokuapp.com/';
  constructor(private httpclient: HttpClient) {

  }

  getFestivals() {
    return this.httpclient.get(this.uri);
  }

  getFestivalsLocal() {
    return this.httpclient.get('../../../assets/response.json');
  }
}
