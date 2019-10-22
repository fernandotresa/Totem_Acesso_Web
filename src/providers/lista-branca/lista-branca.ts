import { Injectable } from '@angular/core';
import { HttpdProvider } from '../../providers/httpd/httpd';
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import moment from 'moment';

@Injectable()
export class ListaBrancaProvider {

  allTickets: any = []

  constructor(
    public http: HttpdProvider, 
    public dataInfo: DataInfoProvider,
    public events: Events,

    public storage: Storage) {    

      this.getOptionListaBranca()
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

  startInterface(){

    this.http.getListaBranca()
    .subscribe(data => {

      this.getListaBrancaCallback(data)
    })
  }

  getListaBrancaCallback(data){

    let lista = []
    let listaEstoque = []

    data.success.forEach(element => {    
      
      if(listaEstoque.indexOf(element.id_estoque_utilizavel) < 0){

        listaEstoque.push(element.id_estoque_utilizavel)
        lista.push(element)      

      }
    });

    this.storage.set('listabranca', lista)    
  }

  getListBrancaStorage(){

    return new Promise<any>((resolve) => { 

      this.storage.get('listabranca')
      .then(data => {

        resolve(data)
      })
    });
  }

  checkTicketExistMemory(ticket){

    return new Promise<any>((resolve, reject) => { 

      this.storage.get(ticket)
      .then(data => {

        data? resolve() : reject()

      })
      .catch(() => {        
        reject(ticket)
      })
    });
  }


  getTicketInfo(ticket){

    return new Promise<any>((resolve, reject) => { 

      this.allTickets.forEach(element => {

        let id_estoque_utilizavel = element.id_estoque_utilizavel

        if(id_estoque_utilizavel === Number(ticket)){
          resolve(element)
        }          

      });
      
      reject()

    });
  }

  searchOneTicket(ticket){

    console.log('Procurando pela lista branca: ', ticket)

    this.getListBrancaStorage()
    .then( data => {
      
      this.allTickets = data
      this.searchOneTicketContinue(ticket)            
    })
  }

  searchOneTicketContinue(ticket){
    
    console.log(this.allTickets)
    console.log('Verificando se temos o ticket na memoria ', ticket)


    this.checkTicketExistMemory(ticket)
    .then(() => {

      console.log('Temos o ticket na memoria')
    })
    .catch(() => {

      console.log('Não temos o ticket na memoria')
      this.checkDoorRules(ticket)

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
      this.events.publish('acesso-negado', callback)
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
      this.events.publish('acesso-negado', callback)
      
    }
  }

  ticketAccessOnlyone(data){

    this.checkTicketExistMemory(data.id_estoque_utilizavel)
    .then(() => {

      let callback = [{"callback": 10, "result": data}]
      this.events.publish('acesso-negado', callback)

    })
    .catch(() => {

      this.useTicket(data)

    })    
  }

  ticketAccessCountPass(data){

  }



  useTicket(ticket){

  }

}
