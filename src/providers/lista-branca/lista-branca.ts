import { Injectable } from '@angular/core';
import { HttpdProvider } from '../../providers/httpd/httpd';
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import * as moment from 'moment';

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

    console.log(listaEstoque)
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
      //this.checkTicketValidity(ticket)

    })
  }

  searchOneTicketCallback(ticket){

    this.getTicketInfo(ticket)

    .then(data => {  

      if(data === "Inexistente")
        console.log("Atenção: Não foi possivel localizar o bilhete na memoria. Favor verificar se o mesmo foi importado")      
      else 
        this.searchTicketContinue(data)            
      
    })  
  }

  searchTicketContinue(data){
    let ticket = data.id_estoque_utilizavel
    let unica_porta_acesso = data.unica_porta_acesso
    let horas_porta_acesso = data.horas_porta_acesso
    
    let utilizado = data.utilizado
    let unicaPortaUtilizado = unica_porta_acesso === 1 && utilizado === 1
    let horasPortaUtilizado = horas_porta_acesso >= 1 && utilizado === 1

    console.log(unica_porta_acesso, horas_porta_acesso, utilizado)
      
    if(unicaPortaUtilizado || horasPortaUtilizado){

      console.log('Já utilizado:', ticket)

      let callback = [{"callback": 10, "result": ticket}]
      this.buildCallback(callback)
    }
    else {
    
      this.checkTicketValidity(data)
    }
  }

  checkTicketValidity(ticket){

    console.log(ticket)

    let idTotem = this.dataInfo.totemId
    let ticketstr = ticket.id_estoque_utilizavel   
    let mesmo_dia_validade = ticket.mesmo_dia_validade
    let infinito_validade = ticket.infinito_validade        

    console.log('Totem: '+ idTotem + ' - Verificando ticket validade: ' + ticketstr)
    
    if(mesmo_dia_validade == 1)
        this.ticketValiditySameDay(ticket)

    else if(infinito_validade == 1)
      this.ticketValidityInfinite(ticket)
    
    else 
      this.ticketValidityTime(ticket)
}

  ticketValiditySameDay(ticket){

    let idTotem = this.dataInfo.totemId
    let ticketstr = ticket.id_estoque_utilizavel   
    let data_log_venda = ticket.data_log_venda

    let now = moment().format()       

    let isSame = moment(data_log_venda).isSame(now, 'day')    
    console.log('Totem: '+ idTotem + ' - Verificando ticket validade mesmo dia: ' + ticketstr)    

    if(isSame)
        this.checkDoorRules(ticket)    

    else {
        let callback = [{"callback": 5, "result": ticket}]
        this.buildCallback(callback)
    }
}

  ticketValidityInfinite(ticket){
    
    let idTotem = this.dataInfo.totemId
    let ticketstr = ticket.id_estoque_utilizavel   

    console.log('Totem: '+ idTotem + ' - Verificando ticket validade infinita: ' + ticketstr)

    this.checkDoorRules(ticket)
 }

ticketValidityTime(ticket){

    let idTotem = this.dataInfo.totemId      
    let id_estoque_utilizavel = ticket.id_estoque_utilizavel
    let tempo_validade = ticket.tempo_validade
    let statusTicketStart = moment(ticket.data_log_venda).format("L")   

    console.log('Data da venda:', ticket.data_log_venda)

    let until =  moment().hours(tempo_validade).format();

    let now = moment().format()        
    let isAfter = moment(until).isAfter(now);

    console.log('Totem: '+ idTotem + ' - Verificando ticket validade tempo: ' + id_estoque_utilizavel + ' '+ statusTicketStart)

    if(isAfter)
        this.checkDoorRules(ticket)    

    else {
        let callback = [{"callback": 6, "result": ticket}]
        this.buildCallback(callback)
    }
}


  checkDoorRules(ticket){

    let horas_porta_acesso = ticket.horas_porta_acesso
    let mesmo_dia_porta_acesso = ticket.mesmo_dia_porta_acesso
    let unica_porta_acesso = ticket.unica_porta_acesso
    let numero_liberacoes = ticket.numero_liberacoes

    console.log('horas_porta_acesso', horas_porta_acesso)
    console.log('mesmo_dia_porta_acesso', mesmo_dia_porta_acesso)
    console.log('unica_porta_acesso', unica_porta_acesso)
    console.log('numero_liberacoes', numero_liberacoes)

    if(horas_porta_acesso > 0){
      this.ticketAccessTimeDoor(ticket)
    }
    else if(mesmo_dia_porta_acesso > 0){
      this.ticketAccessSameDay(ticket)
    }
    else if(unica_porta_acesso > 0){
      this.ticketAccessOnlyone(ticket)
    }
    else if(numero_liberacoes > 0){
      this.ticketAccessCountPass(ticket)
    }    
    else {      
      console.log('Regra não localizada')
    }  
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

    this.incrementUseTicket(ticket)
    .then(() => {

      
      this.useTicketEnd(ticket)
    })    
  }

  useTicketEnd(ticket){
    let callback = [{"callback": 100, "result": ticket.id_estoque_utilizavel}]
    this.buildCallback(callback)    
  }

  incrementUseTicket(ticket){

    console.log('Incrementando: ', ticket)

    return new Promise<any>((resolve) => { 

      this.allTickets.forEach(element => {        

        if(element.id_estoque_utilizavel === ticket.id_estoque_utilizavel){
            element.utilizado = 1

            if(! element.utilizacoes){
              element.utilizacoes = []
            }
            
            element.utilizacoes.push(moment().format())

            this.storage.set(String(ticket.id_estoque_utilizavel), element)
            resolve()
        }
      });               
    });    
  }

  removeTicket(ticket){

    console.log(ticket)

    return new Promise<any>((resolve) => { 

      this.storage.remove(String(ticket.id_estoque_utilizavel))
      .then(data => {
        resolve()
      })
      
    });    
  }



}
