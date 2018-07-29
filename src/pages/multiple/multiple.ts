import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpdProvider } from '../../providers/httpd/httpd';
import { DatabaseProvider } from '../../providers/database/database';
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils'
import moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-multiple',
  templateUrl: 'multiple.html',
})
export class MultiplePage {

  areaId: number = this.dataInfo.areaId
  pontoId: number = this.dataInfo.pontoId  

  searchTicket: string = '19270001';
  searchTicketEnd: string = '19270010';
  allTickets: any

  constructor(public dataInfo: DataInfoProvider,
    public navCtrl: NavController,
    public uiUtils: UiUtilsProvider,     
    public db: DatabaseProvider,
    public navParams: NavParams,  
    public http: HttpdProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MultiplePage');
  }

  searchMultipleTickets(){
    let self = this
  
    this.http.checkMultipleTickets(this.searchTicket, this.searchTicketEnd)
      .subscribe( data => {        
        self.searchMultipleCallback(data)
    })       
  }

  searchMultipleCallback(ticket){    

    this.allTickets = ticket

    ticket.success.forEach(element => {
      this.searchOneTicket(element)
    });
  }

  searchOneTicket(ticket){  
    console.log('Procurando um ingresso:', ticket)

      if(ticket.data_log_venda == undefined)
        this.ticketNotSold(ticket)
      else {

        this.http.checkTicket(ticket.id_estoque_utilizavel).subscribe(data => {    
            
          this.checkTicket(data, ticket)
        }) 
    }
  }

  ticketNotSold(ticket){  
    console.log('Ticket não vendido:', ticket)
  }

  checkTicket(ticketCallback, ticketActual){   
    
    if(ticketCallback.success.length > 0){

      this.ticketAlreadyUsed(ticketCallback)
      
    } else {
      this.checkTicketContinue(ticketActual)
    }
  }

  checkTicketContinue(ticketActual){    
    this.http.checkTicketContinue(ticketActual.id_estoque_utilizavel).subscribe(data => {                  
      this.checkTicketContinueCallback(data, ticketActual)     
    })  
  }

  checkTicketContinueCallback(ticket, ticketActual){    

    if(ticket.success.length == 0){
      this.ticketNotExist(ticketActual)
    } else {
      this.ticketCheckValidity(ticket)
    }
  }

  ticketAlreadyUsed(ticket){
    console.log('Ticket já utilizado:', ticket)

    this.allTickets.success.forEach(element => {

      ticket.success.forEach(subelement => {
      
        if(element.id_estoque_utilizavel == subelement.id_estoque_utilizavel){
          element.nome_ponto_acesso  = subelement.nome_ponto_acesso 
        }

      });
      
    });
  }

  ticketNotExist(ticket){
    console.log('Ticket não existe:', ticket)
  }

  ticketCheckValidity(ticket){    
        
    ticket.success.forEach(element => {      
      
      if(element.mesmo_dia_validade == 1){          
        this.ticketValiditySameDay(element)          
      } 
      else if(element.infinito_validade == 1){    
        this.ticketValidityInfinite(element)
      } 
      else {    
        this.ticketValidityTime(element)
      } 
    });           
  }

  ticketValidityTime(ticket){
    
    let tempo_validade = ticket.tempo_validade

    let until =  moment(ticket.data_log_venda).hours(tempo_validade).format();
    let now = moment().format()    
    
    let isAfter = moment(until).isAfter(now);

    if(isAfter){
      this.useTicket(ticket)

    } else {
      this.ticketValidityTimeNotOk(ticket)      
    }    
  }

  ticketValidityTimeNotOk(ticket){
    console.log('Ticket tempo inválido', ticket)
  }

  ticketValiditySameDay(ticket){

    let now = moment().format()    

    let isSame = moment(ticket.data_log_venda).isSame(now, 'day')    

    if(isSame)
      this.useTicket(ticket)        
    else
      this.ticketValidityNotSame(ticket)        
  }

  ticketValidityNotSame(ticket){
    console.log('ticketValidityNotSame', ticket)
  }

  ticketValidityInfinite(ticket){    
    this.useTicket(ticket)    
  }

  useTicket(ticket){

    console.log('Utilizando ticket: ', ticket.id_estoque_utilizavel, this.areaId)
    
    this.dataInfo.ticketRead = this.dataInfo.ticketRead + this.searchTicket

    let self = this

    this.http.useTicket(ticket.id_estoque_utilizavel, this.areaId).subscribe( () => {
      
      console.log('Ticket usado', ticket)      
    })
  }


}
