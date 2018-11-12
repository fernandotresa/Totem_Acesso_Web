import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, } from 'ionic-angular';
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
  @ViewChild('searchbar') searchbar;
  @ViewChild('inputEnd') inputEnd;

  areaId: number = this.dataInfo.areaId
  pontoId: number = this.dataInfo.totemId  
  inputVisible: Boolean = true
  isLoading: Boolean = true  

  totalChecks: number = 0

  totalChecksOk: number = 0
  totalChecksNotOk: number = 0

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
    
    this.goBack()
    this.setFocus()

    this.totemWorking()
  }

  goBack(){
    let self = this

    setTimeout(function(){ 

      if(self.searchTicket.length == 0)
        self.navCtrl.popToRoot()

      else {

        if(this.total > 2){
          self.navCtrl.popToRoot()
          this.total = 0

        } else {
          this.total++
        }                
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

  setTimeoutTicketsVerify(){

    let self = this

    let timeOutTotal = setInterval(function(){ 

      let allOk = true

      self.allTickets.success.forEach(element => {

        if(! element.MODIFICADO){
          allOk = false          
        }          
      });

      if(allOk){
          self.totemWorking()
          clearInterval(timeOutTotal)
          self.uiUtils.showToast('Processo finalizado')

      }
        
    }, 5000);      
       
  }

  clearChecks(){
    this.totalChecks = 0
    this.totalChecksNotOk = 0
    this.totalChecksOk = 0
  }

  searchMultipleTickets(){
    
    let self = this  
    this.clearChecks()  

    this.checkInputs().then(result => {
      
      if(result){

        self.uiUtils.showToast(this.dataInfo.startVerification)
        self.isLoading = true

        self.http.checkMultipleTickets(self.searchTicket, self.searchTicketEnd)
        .subscribe( data => {            

        self.searchMultipleCallback(data)                
      })       
    }
            
    }).catch(error => {
      console.log(error)
      self.uiUtils.showToast(this.dataInfo.checkInputs)
    })
      
  }

  totemWorking(){
    this.inputVisible = true    
    this.isLoading = false
  }

  totemNotWorking(){
    this.inputVisible = false
    this.isLoading = true
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
    if(this.searchbar)
      this.searchbar.setFocus();          
  }

  setFocusEnd(){   
    if(this.inputEnd)
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

    this.allTickets = ticket    
    this.totalChecks = ticket.success.length

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

    this.setTimeoutTicketsVerify()
  }

  searchOneTicket(ticket){  
    console.log(this.dataInfo.searchingTicket, ticket.id_estoque_utilizavel)        

    if(ticket.data_log_venda == undefined)
      this.ticketNotSold(ticket.id_estoque_utilizavel)
    else {

      this.http.checkTicketExistMultiple(ticket.id_estoque_utilizavel).subscribe(data => {                
        this.checkTicketExist(data, ticket)    
      }) 
    }
  }

  ticketNotSold(ticket){  
    let self = this

    this.allTickets.success.forEach(element => {

      if(element.id_estoque_utilizavel == ticket){        
        element.data_log_venda = ''
        element.alerta  = self.dataInfo.ticketNotSoldedMsg
        element.MODIFICADO  = true
        self.totalChecksNotOk++
      }
    });
  }  

  checkTicketExist(ticket, ticketActual){
    console.log(this.dataInfo.checkingTicketExist, ticketActual.id_estoque_utilizavel)

    if(ticket.success.length == 0)
      this.ticketNotExist(ticketActual.id_estoque_utilizavel)

    else {
      this.http.checkTicketSold(ticketActual.id_estoque_utilizavel).subscribe( data => {
        this.checkSold(data)                    
      })                  
    }    
  }  

  ticketNotExist(ticket){
    console.log(this.dataInfo.accessDenied, ticket)

    let self = this

    this.allTickets.success.forEach(element => {

      if(element.id_estoque_utilizavel == ticket){              
        element.data_log_venda = 'Ticket inexistente'
        element.alerta  = self.dataInfo.ticketNotSoldedMsg
        element.MODIFICADO  = true
        self.totalChecksNotOk++
      }  
    });
  }

  checkSold(ticket){    
    
    ticket.success.forEach(element => {

      if(element.data_log_venda == undefined)
        this.ticketNotSold(element.id_estoque_utilizavel)

      else {
        this.http.checkTicketMultiple(element.id_estoque_utilizavel).subscribe(data => {      
          this.checkTicket(data, element)
        }) 
      }      
    });      
  }

  checkTicket(ticket, ticketActual){   

    console.log(this.dataInfo.checkingTicketAccess, ticketActual.id_estoque_utilizavel)
    
    if(ticket.success.length > 0)
      this.checkTicketContinue(ticketActual)
   else 
      this.checkTicketAreaAccessDenied(ticketActual.id_estoque_utilizavel)     
  }

  checkTicketAreaAccessDenied(ticket){
    console.log('checkTicketAreaAccessDenied: ', ticket)

    let self = this

    this.allTickets.success.forEach(element => {

      if(element.id_estoque_utilizavel == ticket){   
        let dateSell = moment(element.data_log_venda).format("L");      
        element.data_log_venda = dateSell            
        element.alerta  = self.dataInfo.accessDenied
        element.MODIFICADO  = true
        self.totalChecksNotOk++
      }
    });
  } 

  checkTicketContinue(ticketActual){    
    console.log('checkTicketContinue', ticketActual.id_estoque_utilizavel)

    this.http.checkTicketContinueMultiple(ticketActual.id_estoque_utilizavel).subscribe(data => {                  
      this.checkTicketContinueCallback(data, ticketActual)     
    })  
  }

  checkTicketContinueCallback(ticket, ticketActual){    
    console.log('checkTicketContinueCallback', ticketActual.id_estoque_utilizavel)

    if(ticket.success.length == 0){
      this.ticketNotExist(ticketActual.id_estoque_utilizavel)
    } else {
      this.ticketCheckValidity(ticket, ticketActual)
    }
  }  

  ticketCheckValidity(ticket, ticketActual){    

    console.log('ticketCheckValidity', ticketActual.id_estoque_utilizavel)
        
    ticket.success.forEach(element => {      
      
      if(element.mesmo_dia_validade == 1){          
        this.ticketValiditySameDay(element, ticketActual)          
      } 
      else if(element.infinito_validade == 1){    
        this.ticketValidityInfinite(element)
      } 
      else {    
        this.ticketValidityTime(element, ticketActual)
      } 
    });           
  }
  
  ticketValidityTime(ticket, ticketActual){
    console.log('ticketValidityTime', ticketActual.id_estoque_utilizavel)

    let tempo_validade = ticket.tempo_validade
    let until =  moment(ticket.data_log_venda).hours(tempo_validade).format();
    let now = moment().format()        
    let isAfter = moment(until).isAfter(now);

    if(isAfter)
      this.checkValidityOk(ticket, ticketActual)
     else 
      this.ticketValidityTimeNotOk(ticketActual)           
  }

  ticketValidityTimeNotOk(ticket){    
    let self = this
    let tempo_validade = ticket.tempo_validade    
    let message = 'Limite: ' + moment(ticket.data_log_venda).hours(tempo_validade).format("L");        
    
    this.allTickets.success.forEach(element => {

      if(element.id_estoque_utilizavel == ticket.id_estoque_utilizavel){    
        let dateSell = moment(element.data_log_venda).format("L");      
        element.data_log_venda = dateSell            
        element.alerta  = message
        element.MODIFICADO  = true
        self.totalChecksNotOk++
      }
    });
  }

  ticketValiditySameDay(ticket, ticketActual){
    console.log('ticketValiditySameDay', ticketActual.id_estoque_utilizavel)

    let now = moment().format()    
    let isSame = moment(ticket.data_log_venda).isSame(now, 'day')
 
    if(isSame)
        this.checkValidityOk(ticket, ticketActual)    
      else
        this.ticketValidityNotSame(ticketActual)        
  }

  ticketValidityNotSame(ticket){    
    let self = this
    let message = 'Limite: ' + moment(ticket.data_log_venda).format("L")    

    this.allTickets.success.forEach(element => {

      if(element.id_estoque_utilizavel == ticket.id_estoque_utilizavel){  
        let dateSell = moment(element.data_log_venda).format("L");      
        element.data_log_venda = dateSell
        element.alerta  = message
        element.MODIFICADO  = true
        self.totalChecksNotOk++
      }
    });
  }

  ticketValidityInfinite(ticket){   
    console.log('ticketValidityInfinite', ticket.id_estoque_utilizavel)
    this.useTicket(ticket)    
  }

  checkValidityOk(ticket, ticketActual){   
    console.log('checkValidityOk', ticketActual.id_estoque_utilizavel) 
    this.checkDoorRules(ticket, ticketActual)
  }

  checkDoorRules(ticket, ticketActual){
    console.log('checkDoorRules', ticketActual.id_estoque_utilizavel) 

    let horas_porta_acesso = ticket.horas_porta_acesso
    let mesmo_dia_porta_acesso = ticket.mesmo_dia_porta_acesso
    let unica_porta_acesso = ticket.unica_porta_acesso
    let numero_liberacoes = ticket.numero_liberacoes

    if(horas_porta_acesso > 0){
      this.ticketAccessTimeDoor(ticket, ticketActual)
    }
    else if(mesmo_dia_porta_acesso > 0){
      this.ticketAlreadUsedFinish(ticket, ticketActual)
    }
    else if(unica_porta_acesso > 0){
      this.ticketAccessOnlyone(ticket, ticketActual)
    }
    else if(numero_liberacoes > 0){
      this.ticketAccessCountPass(ticket, ticketActual)
    }    
    else {
      console.log('Tipo de ingresso não encontrado:', ticket)
      this.isLoading = false
    }
  }

  ticketAccessTimeDoor(ticket, ticketActual){
    console.log('ticketAccessTimeDoor', ticketActual.id_estoque_utilizavel) 

    let until =  moment(ticket.data_log_venda).add(ticket.horas_porta_acesso, 'hours').format();
    let now = moment().format()        
    
    let isAfter = moment(until).isAfter(now);

    if(isAfter){
      this.useTicket(ticketActual)
    } else {
      this.ticketAccessTimeDoorNotOk(ticketActual)      
    }
  }

  ticketAccessTimeDoorNotOk(ticket){    
    let self = this
    let message = 'Limite: ' + moment(ticket.data_log_venda).add(ticket.horas_porta_acesso, 'hours').format("LT");
    
    this.allTickets.success.forEach(element => {

      if(element.id_estoque_utilizavel == ticket.id_estoque_utilizavel){    
        
        let dateSell = moment(element.data_log_venda).format("L");      
        element.data_log_venda = dateSell            
        element.alerta  = message
        element.MODIFICADO  = true
        self.totalChecksNotOk++
      }
    });
  }

  ticketAccessOnlyone(ticket, ticketActual){
    console.log('ticketAccessOnlyone', ticketActual.id_estoque_utilizavel) 

    this.http.checkTicketUsed(ticketActual.id_estoque_utilizavel).subscribe(data => {
      this.ticketAccessOnlyOneCallback(data, ticketActual)      
    })
  }

  ticketAccessCountPass(ticket, ticketActual){
    console.log('ticketAccessCountPass', ticketActual.id_estoque_utilizavel) 

    this.http.checkTicketUsedTotal(ticketActual.id_estoque_utilizavel).subscribe(data => {
      this.ticketAccessCountPassCallback(data, ticketActual)      
    })
  }

  ticketAccessCountPassCallback(ticket, ticketActual){    

    console.log('ticketAccessCountPassCallback', ticketActual.id_estoque_utilizavel) 

    if(ticket.success.length == 0)
      this.useTicket(ticketActual)
    else 
      this.ticketAccessCountPassContinue(ticket, ticketActual.id_estoque_utilizavel)        
  }

  ticketAccessCountPassContinue(ticket, ticketActual){   
    console.log('ticketAccessCountPassContinue', ticketActual.id_estoque_utilizavel)  

    let numero_liberacoes = ticketActual.numero_liberacoes    

    ticket.success.forEach(element => {
       let total = element.TOTAL       

       if(total < numero_liberacoes)
          this.useTicket(ticketActual)
        else          
          this.ticketAccessCountPassNotOk(ticketActual)
    });
  }


  ticketAccessCountPassNotOk(ticket){    

   let self = this
   
   this.allTickets.success.forEach(element => {

    if(element.id_estoque_utilizavel == ticket.id_estoque_utilizavel){    
      let dateSell = moment(element.data_log_venda).format("L");      
      element.data_log_venda = dateSell
      element.alerta  = this.dataInfo.accessCountLimitPassed
      element.MODIFICADO  = true
      self.totalChecksNotOk++
     }
    });
  }

  ticketAccessOnlyOneCallback(ticket, ticketActual){  
    console.log('ticketAccessOnlyOneCallback', ticketActual.id_estoque_utilizavel)  

    if(ticket.success.length > 0){
      this.ticketAlreadUsedFinish(ticket, ticketActual)
    } else {
      this.useTicket(ticketActual)
    }
  }

  ticketAlreadUsedFinish(ticket, ticketActual){   
    console.log('ticketAlreadUsedFinish', ticketActual.id_estoque_utilizavel)
    let self = this
    
    this.allTickets.success.forEach(element => {

      if(element.id_estoque_utilizavel == ticketActual.id_estoque_utilizavel){     

        let statusTicketStart = moment(element.data_log_utilizacao).format("L");   

        let dateSell = moment(element.data_log_venda).format("L");      
        element.data_log_venda = dateSell
        element.alerta  =  "Utilizado em: " + element.nome_ponto_acesso + " - " + statusTicketStart
        element.MODIFICADO  = true
        self.totalChecksNotOk++
       }
      });   
  }

  useTicket(ticket){

    console.log('Utilizando ticket: ', ticket.id_estoque_utilizavel, this.areaId)
    
    this.dataInfo.ticketRead = this.dataInfo.ticketRead + this.searchTicket

    let self = this

    this.http.useTicketMultiple(ticket.id_estoque_utilizavel).subscribe( () => {
      
      console.log('Ticket usado', ticket)      

      this.allTickets.success.forEach(element => {

        if(element.id_estoque_utilizavel == ticket.id_estoque_utilizavel){   
          let dateSell = moment(element.data_log_venda).format("L");      
          element.data_log_venda = dateSell
          element.message  = self.dataInfo.alreadyOk
          element.MODIFICADO  = true

          self.totalChecksOk++
        }
      });
    })
  }

}
