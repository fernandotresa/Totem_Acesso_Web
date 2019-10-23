import { Injectable } from '@angular/core';
import { HttpdProvider } from '../../providers/httpd/httpd';
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import moment from 'moment';

@Injectable()
export class ListaBrancaProvider {

  allTickets: any = []
  listaBranca: any

  constructor(
    public http: HttpdProvider, 
    public dataInfo: DataInfoProvider,
    public events: Events,

    public storage: Storage) {    

      this.allTickets = []
      this.getOptionListaBranca()

      this.events.subscribe('totem:updated', (data) => {              
        this.startInterface()
      });            

      this.events.subscribe('update-lista-branca', (data) => {      
        this.atualizaLista()
      });            
  }

  startInterface(){

    this.getListBrancaStorage()

    .then( data => {      

      this.allTickets = data
      this.events.publish('lista-branca', data)
    })    
  }

  getListBrancaStorage(){

    return new Promise<any>((resolve) => { 

      let tickets = []
      
      this.storage.keys().then(data => {

        this.storage.forEach((value, key, index) => {                  
                          
          if(value && value.id_estoque_utilizavel){
            tickets.push(value)
          } 
  
          if (index === data.length -1){
            resolve(tickets)
          }
        })                    
      })
            
    });
  }


  getOptionListaBranca(){
    this.storage.get('ativaListaBranca')
    .then(data => {
        
        this.dataInfo.ativaListaBranca = data
        this.getOptionAtivaRede()
    })
  }

  getOptionAtivaRede(){
    this.storage.get('ativaRedeOnline')
    .then(data => {        
        this.dataInfo.ativaRedeOnline = data
        this.getOptionAtivaHotSpot()
    })
  }

  getOptionAtivaHotSpot(){
    this.storage.get('ativaHotspot')
    .then(data => {        
        this.dataInfo.ativaHotspot = data
        this.getOptionAtivaSincronizacao()
    })
  }

  getOptionAtivaSincronizacao(){
    this.storage.get('ativaSincronizacaoUsb')
    .then(data => {        
        this.dataInfo.ativaSincronizacaoUsb = data
        this.events.publish('listaBrancaConfig', true)
    })
  }
  
  atualizaLista()
  {
    this.http.getListaBranca()

    .subscribe(data => {

      this.getListaBrancaCallback(data)
    })
  }

  getListaBrancaCallback(data){

    let listaEstoque = []

    data.success.forEach(element => {    
      
      if(listaEstoque.indexOf(element.id_estoque_utilizavel) < 0){

        listaEstoque.push(element.id_estoque_utilizavel)
        this.storage.set(String(element.id_estoque_utilizavel), element)    

      }      
    });
  }
  
  checkTicketExistMemory(ticket){
    
    return new Promise<any>((resolve) => { 

      this.allTickets.forEach(element => {                

        if(Number(ticket) === element.id_estoque_utilizavel){     
          resolve(element)
        }
          
      });
    });
  }


  getTicketInfo(ticket){

    return new Promise<any>((resolve, reject) => { 

      if(this.allTickets && this.allTickets.length > 0){

        this.allTickets.forEach(element => {

          let id_estoque_utilizavel = element.id_estoque_utilizavel          
  
          if(id_estoque_utilizavel === Number(ticket)){
            resolve(element)
          }          
  
        });              
      }
      else       
      resolve("Inexistente")

    });
  }

  buildCallback(data){
    let coitainer = {success: data}        
    this.events.publish('lista-branca-callback', coitainer)
  }


  searchOneTicket(ticket){
    
    console.log('Verificando se temos o ticket na memoria ', ticket)

    this.checkTicketExistMemory(ticket)

    .then(() => {            
      this.searchOneTicketCallback(ticket)       
    })
    
    .catch(() => {

      console.log('Não temos o ticket na memoria')
      this.checkDoorRules(ticket)

    })
  }

  searchOneTicketCallback(ticket){

    this.getTicketInfo(ticket)

    .then(data => {  

      if(data === "Inexistente"){
        console.log("Atenção: Não foi possivel localizar o bilhete na memoria. Favor verificar se o mesmo foi importado")

      }
      else {
        let unica_porta_acesso = data.unica_porta_acesso
        let utilizado = data.utilizado

        if(unica_porta_acesso === 1 && utilizado === 1){
          let callback = [{"callback": 10, "result": ticket}]
          this.buildCallback(callback)
        }
        else {
        
          this.checkDoorRules(ticket)
        }      
      }
      
    })  
  }

  checkDoorRules(ticket){

    this.getTicketInfo(ticket)

    .then(data => {  

      let horas_porta_acesso = data.horas_porta_acesso
      let mesmo_dia_porta_acesso = data.mesmo_dia_porta_acesso
      let unica_porta_acesso = data.unica_porta_acesso
      let numero_liberacoes = data.numero_liberacoes

      console.log('horas_porta_acesso', horas_porta_acesso)
      console.log('mesmo_dia_porta_acesso', mesmo_dia_porta_acesso)
      console.log('unica_porta_acesso', unica_porta_acesso)
      console.log('numero_liberacoes', numero_liberacoes)

      if(horas_porta_acesso > 0){
        this.ticketAccessTimeDoor(data)
      }
      else if(mesmo_dia_porta_acesso > 0){
        this.ticketAccessSameDay(data)
      }
      else if(unica_porta_acesso > 0){
        this.ticketAccessOnlyone(data)
      }
      else if(numero_liberacoes > 0){
        this.ticketAccessCountPass(data)
      }    
      else {      
        console.log('Regra não localizada')
      }
      
    })    
  }

  ticketAccessTimeDoor(data){

    let until =  moment(data.data_log_venda).add(data.horas_porta_acesso, 'hours').format();
    let now = moment().format()        
    
    let isAfter = moment(until).isAfter(now);

    if(isAfter){

      let callback = [{"callback": 12, "result": data}]
      this.buildCallback(callback)    
    }
    else 
      this.useTicket(data)
  }

  

  ticketAccessSameDay(data){

    let ticket = data.id_estoque_utilizavel       

    let until =  moment(ticket.data_log_venda).format();
    let now = moment().format()                  
    let isSame = moment(until).isSame(now, 'day');    

    if(isSame){

      this.useTicket(data)

    } else {

      let callback = [{"callback": 9, "result": data}]
      this.events.publish('lista-branca-callback', callback)

    }
  }

  ticketAccessOnlyone(data){

    this.useTicket(data)
  }

  ticketAccessCountPass(data){

  }



  useTicket(ticket){            

    this.removeTicket(ticket)
    .then(() => {

      this.allTickets.forEach(element => {        

        if(element.id_estoque_utilizavel === ticket.id_estoque_utilizavel){
            element.utilizado = 1
            element.dataHoraUtilizado = moment().format()
  
            console.log('Substituido:', element.id_estoque_utilizavel, element.utilizado)
            this.storage.set(String(ticket.id_estoque_utilizavel), element)
        }
      });        
    })    
  }

  removeTicket(ticket){

    return new Promise<any>((resolve) => { 

      this.storage.get('listaBranca')
      .then(data => {



      })
      resolve()
    });    
  }



}
