import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, } from 'ionic-angular';
import { HttpdProvider } from '../../providers/httpd/httpd';
import { DatabaseProvider } from '../../providers/database/database';
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils'
import { HomePage } from '../../pages/home/home';
import moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-multiple',
  templateUrl: 'multiple.html',
})
export class MultiplePage {
  @ViewChild('searchbar') searchbar;
  @ViewChild('inputEnd') inputEnd;

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
    this.goBack()
    this.setFocus()
  }

  goBack(){
    let self = this
    let total = 0

    setTimeout(function(){ 

      if(self.searchTicket.length == 0)
        self.navCtrl.setRoot(HomePage)
      else {

        if(total > 2)
          self.navCtrl.setRoot(HomePage)

        total++
      }      
      
    }, 5000); 
  }

  setIntervalFocus(){
    let self = this

      setInterval(function(){ 

        if(self.searchTicket.length < 8)
            self.setFocus();        
      
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
    console.log('searchMultipleTickets')

    this.checkInputs().then(result => {
      
      if(result){

        self.uiUtils.showToast('Iniciando verificação')
        self.isLoading = true

        self.http.checkMultipleTickets(self.searchTicket, self.searchTicketEnd)
        .subscribe( data => {            
        self.searchMultipleCallback(data)                
      })       
    }
            
    }).catch(error => {
      console.log(error)
      self.uiUtils.showToast('Verificar os inputs')
    })
      
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
      this.searchMultipleTickets()

    } else {
      this.searchTicketEnd = ""
      this.setFocusEnd()
    }
  }

  setFocus(){
    this.searchbar.setFocus();          
  }

  setFocusEnd(){
    console.log('setFocusEnd()')
    this.inputEnd.setFocus();          
  }

  checkInputs(){
    return new Promise<boolean>((resolve, reject) => { 

      if(this.searchTicket >= this.searchTicketEnd)     
        reject("this.searchTicket >= this.searchTicketEnd"); 
      
      else if(this.searchTicket.length < 8)       
        reject("this.searchTicket.length < 8");  
  
      else if(this.searchTicketEnd.length < 8)
        reject("this.searchTicket.length < 8"); 

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
    let self = this

    ticket.success.forEach(element => {
      self.searchOneTicket(element)      
    });    

    
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

    this.http.useTicket(ticket.id_estoque_utilizavel).subscribe( () => {
      
      console.log('Ticket usado', ticket)      

      this.allTickets.success.forEach(element => {

        if(element.id_estoque_utilizavel == ticket.id_estoque_utilizavel){                    
          element.alerta  = self.dataInfo.ticketOld
        }
      });
    })
  }

}
