import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable()
export class HttpdProvider {

  data:any = {};
  
  address : string = 'http://localhost:8085'  
  idTotem: number = 1
  
  constructor(public http: HttpClient) {
    console.log('Hello HttpdProvider Provider');
  }
  
  getAreas(){
    let myData = JSON.stringify({id: this.idTotem});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/getAreas", myData, {headers: headers})
  }  

  getAreaCounter(idArea_){
    let myData = JSON.stringify({id: this.idTotem, idArea: idArea_});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/getAreaCounter", myData, {headers: headers})
  }

  decrementAreaCounter(idArea_){
    
    let myData = JSON.stringify({id: this.idTotem, idArea: idArea_});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/decrementAreaCounter", myData, {headers: headers})
  }

  checkTicket(value_){
    
    let myData = JSON.stringify({id: this.idTotem, ticket: value_});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/checkTicket", myData, {headers: headers})
  }

 
}