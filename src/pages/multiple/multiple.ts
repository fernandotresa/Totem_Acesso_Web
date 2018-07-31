import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, } from 'ionic-angular';
import { HttpdProvider } from '../../providers/httpd/httpd';
import { DatabaseProvider } from '../../providers/database/database';
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils'
import moment from 'moment';
import { Searchbar } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-multiple',
  templateUrl: 'multiple.html',
})
export class MultiplePage {
  @ViewChild('searchbar') searchbar:Searchbar;
  @ViewChild('searchbarEnd') searchbarEnd:Searchbar;

  areaId: number = this.dataInfo.areaId
  pontoId: number = this.dataInfo.totemId  
  isLoading: Boolean = false;

  searchTicket: string = '';
  searchTicketEnd: string = '';
  allTickets: any

  constructor(public dataInfo: DataInfoProvider,
    public navCtrl: NavController,
    public uiUtils: UiUtilsProvider,     
    public db: DatabaseProvider,
    public navParams: NavParams,  
    public http: HttpdProvider) {      

      this.setIntervalFocus()
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MultiplePage');

    let self = this
    setTimeout(function(){ 

      if(self.searchTicket.length == 0)
        self.navCtrl.pop()
      
    }, 6000); 

    this.setFocus()
  }

  setIntervalFocus(){
    let self = this

      setInterval(function(){ 

        if(self.searchTicket.length < 8)
            self.setFocus();
         else 
          self.setFocusEnd();
      
      }, 3000);      
  }

  setTimeoutBack(){
    let self = this

      setTimeout(function(){ 

        if(self.searchTicket.length == 0 && self.searchTicketEnd.length == 0)            
          self.navCtrl.popToRoot()
          
      }, 3000);      
  }

  searchMultipleTickets(){
    let self = this    

    if(this.checkInputs){

      this.uiUtils.showToast('Iniciando verificação')
      this.isLoading = true

      this.http.checkMultipleTickets(this.searchTicket, this.searchTicketEnd)
      .subscribe( data => {            
        self.searchMultipleCallback(data)                
      })       
    }         
  }

  checkTicketStart(){
    if(this.searchTicket.length == 8){
      this.setFocusEnd()
    } else {
      this.searchTicket = ""
      this.setFocus()
    }
  }

  checkTicketEnd(){
    if(this.searchTicketEnd.length == 8){
      console.log('Check ok')

    } else {
      this.searchTicketEnd = ""
      this.setFocusEnd()
    }
  }

  setFocus(){
    this.searchbar.setFocus();          
  }

  setFocusEnd(){
    this.searchbarEnd.setFocus();          
  }



  checkInputs(){
    new Promise<boolean>((resolve, reject) => { 

      if(this.searchTicket > this.searchTicketEnd){
        this.uiUtils.showToast('Inicio maior que o final')  
        resolve(false); 

      } else if( (parseInt(this.searchTicketEnd) - parseInt(this.searchTicket)) > 100) {
        this.uiUtils.showToast('Ultrapassou o limite de ingressos')
        resolve(false); 
  
      } else if(this.searchTicket.length < 8) {
        this.uiUtils.showToast('Inicio deve possuir 8 dígitos')
        resolve(false); 
  
      } else if(this.searchTicketEnd.length < 8) {
        this.uiUtils.showToast('Fim deve possuir 8 dígitos')
        resolve(false); 
      }

      resolve(true); 
      
    });
    
  }

  searchMultipleCallback(ticket){    

    console.log(ticket)    

    this.allTickets = ticket    

    if(this.allTickets.success.length == 0)
      this.searchCallbackNone()    
    else 
      this.searchCallbackContinue(ticket)          
  }


  searchCallbackNone(){
      this.uiUtils.showToast(this.dataInfo.noResults)
      this.isLoading = false
  }

  searchCallbackContinue(ticket){
    ticket.success.forEach(element => {
      this.searchOneTicket(element)      
    });    

    let self = this
    setTimeout(function(){ 
      self.uiUtils.showToast('Finalizando verificação')
      self.isLoading = false       

    }, 5000);
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

  checkTicketAreaCallback(ticket){

    if(ticket.success.length > 0){
      this.checkTicketContinue(ticket)
    } else {
      this.checkTicketAreaAccessDenied(ticket)
    }    
  }

  checkTicketAreaAccessDenied(ticket){
    console.log('checkTicketAreaAccessDenied')

    let self = this

    this.allTickets.success.forEach(element => {

      if(element.id_estoque_utilizavel == ticket.id_estoque_utilizavel){        
        element.alerta  = self.dataInfo.accessDenied
      }
    });
  } 

  ticketNotSold(ticket){  
    let self = this

    this.allTickets.success.forEach(element => {

      if(element.id_estoque_utilizavel == ticket.id_estoque_utilizavel){        
        element.alerta  = self.dataInfo.ticketNotSoldedMsg
      }
    });
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

    let self = this

    this.allTickets.success.forEach(element => {

      ticket.success.forEach(subelement => {
      
        if(element.id_estoque_utilizavel == subelement.id_estoque_utilizavel){
          element.data_log_venda = moment(element.data_log_utilizacao).format("L");      
          element.nome_ponto_acesso  = subelement.nome_ponto_acesso 
          element.alerta  = self.dataInfo.already
        }
      });    
    });
  }

  ticketNotExist(ticket){
    console.log('Ticket não existe:', ticket)

    let self = this

    this.allTickets.success.forEach(element => {

      ticket.success.forEach(subelement => {
      
        if(element.id_estoque_utilizavel == subelement.id_estoque_utilizavel){          
          element.alerta  = self.dataInfo.ticketNotSoldedMsg
        }
      });    
    });
  }

  ticketCheckValidity(ticket){    
        
    ticket.success.forEach(element => {      
      
      if(element.mesmo_dia_validade == 1){          
        this.ticketValiditySameDay(element, ticket)          
      } 
      else if(element.infinito_validade == 1){    
        this.ticketValidityInfinite(element)
      } 
      else {    
        this.ticketValidityTime(element, ticket)
      } 
    });           
  }

  ticketValidityTime(ticket, ticketActual){
    
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

    let self = this

    this.allTickets.success.forEach(element => {

      if(element.id_estoque_utilizavel == ticket.id_estoque_utilizavel){
        element.data_log_venda = moment(element.data_log_utilizacao).format("L");      
        element.nome_ponto_acesso  = ticket.nome_ponto_acesso 
        element.alerta  = self.dataInfo.ticketOld
      }
    });
  }

  ticketValiditySameDay(ticket, ticketActual){

    let now = moment().format()    

    let isSame = moment(ticket.data_log_venda).isSame(now, 'day')    

    if(isSame)
      this.useTicket(ticket)        
    else
      this.ticketValidityNotSame(ticketActual)        
  }

  ticketValidityNotSame(ticket){
    console.log('ticketValidityNotSame', ticket.success)
    console.log(this.allTickets)

    let self = this

    this.allTickets.success.forEach(element => {

      ticket.success.forEach(subelement => {
      
        if(element.id_estoque_utilizavel == subelement.id_estoque_utilizavel){
          element.data_log_venda = moment(element.data_log_utilizacao).format("L");      
          element.nome_ponto_acesso  = subelement.nome_ponto_acesso 
          element.alerta  = self.dataInfo.ticketOld
        }
      });    
    });
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

      this.allTickets.success.forEach(element => {

        if(element.id_estoque_utilizavel == ticket.id_estoque_utilizavel){                    
          element.alerta  = self.dataInfo.ticketOld
        }
      });
    })
  }

}
