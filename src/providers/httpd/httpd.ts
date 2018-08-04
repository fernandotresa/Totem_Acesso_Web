import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DataInfoProvider } from '../../providers/data-info/data-info'

@Injectable()
export class HttpdProvider {

  data:any = {};
  
  address : string = 'http://localhost:8085'    
  
  constructor(public http: HttpClient, public dataInfo: DataInfoProvider) {
    console.log('Hello HttpdProvider Provider');

    this.address = this.dataInfo.addressServer
    
    this.getTotemInfo().subscribe(data => {              
      this.dataInfo.configureTotem(data)
    })
  }  
  
  getTotemInfo(){
    let myData = JSON.stringify({id: this.dataInfo.totemId});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/getTotemInfo", myData, {headers: headers})
  }

  getAreas(){
    let myData = JSON.stringify({id: this.dataInfo.totemId});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/getAreas", myData, {headers: headers})
  }  

  getAreaInfo(idArea_){
    let myData = JSON.stringify({id: this.dataInfo.totemId, idArea: idArea_});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/getAreaInfo", myData, {headers: headers})
  }

  getAreaCounter(idArea_){
    let myData = JSON.stringify({id: this.dataInfo.totemId, idArea: idArea_});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/getAreaCounter", myData, {headers: headers})
  }

  decrementAreaCounter(idArea_){    
    let myData = JSON.stringify({id: this.dataInfo.totemId, idArea: idArea_});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/decrementAreaCounter", myData, {headers: headers})
  }

  incrementAreaCounter(idArea_){    
    let myData = JSON.stringify({id: this.dataInfo.totemId, idArea: idArea_});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/incrementAreaCounter", myData, {headers: headers})
  }

  checkTicketSold(value_){    
    let myData = JSON.stringify({id: this.dataInfo.totemId, ticket: value_});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/checkTicketIsSold", myData, {headers: headers})
  }

  checkTicket(value_){    
    let myData = JSON.stringify({id: this.dataInfo.totemId, ticket: value_});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/checkTicket", myData, {headers: headers})
  }

  checkTicketContinue(value_){    
    let myData = JSON.stringify({id: this.dataInfo.totemId, ticket: value_});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/checkTicketContinue", myData, {headers: headers})
  }

  useTicket(value_, idArea_){
    let myData = JSON.stringify({id: this.dataInfo.totemId, idAreaAcesso: idArea_, ticket: value_});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/useTicket", myData, {headers: headers})
  }

  checkMultipleTickets(start_, end_){    
    let myData = JSON.stringify({id: this.dataInfo.totemId, ticketStart: start_, ticketEnd: end_});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/checkMultipleTickets", myData, {headers: headers})
  }

  checkTicketAreaAccess(idArea_, value_){    
    let myData = JSON.stringify({id: this.dataInfo.totemId, idArea: idArea_, ticket: value_});
    const headers = new HttpHeaders({'Content-Type':'application/json'});
    return this.http.post(this.address  + "/checkTicketAreaAccess", myData, {headers: headers})
  }

 
}