import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events} from 'ionic-angular';
import { HttpdProvider } from '../../providers/httpd/httpd';
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { ListaBrancaProvider } from '../../providers/lista-branca/lista-branca'
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils'
import moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-memory-list',
  templateUrl: 'memory-list.html',
})
export class MemoryListPage {  

  areaId: number = this.dataInfo.areaId
  pontoId: number = this.dataInfo.totemId  
  inputVisible: Boolean = true
  isLoading: Boolean = true  

  isMemoryList: Boolean = false
  ticketsArray: any = []

  totalChecks: number = 0
  totalChecksOk: number = 0
  totalChecksNotOk: number = 0

  allTickets: any  

  constructor(public dataInfo: DataInfoProvider,
    public navCtrl: NavController,
    public uiUtils: UiUtilsProvider,     
    public navParams: NavParams,      
    public listaBranca: ListaBrancaProvider,
    public events: Events,
    public http: HttpdProvider) {      
            
  }

  ionViewDidLoad() {        

    this.isMemoryList = this.navParams.get('isMemoryList')
    this.allTickets = this.navParams.get('allTickets')

    this.totemWorking()    

    console.log(this.allTickets)

    if(this.isMemoryList)
        this.showMemoryList()      
      else
        this.searchMultipleTicketsNetwork()    
  }    

  showMemoryList(){
    
  
    this.totalChecks = this.allTickets.length

    this.allTickets.forEach(element => {
      
      element.nome_ponto_acesso = this.dataInfo.titleGeneral
      element.MODIFICADO  = true    
      element.message = "Configurado na lista branca"

      element.data_log_venda =  moment(element.data_log_venda).format("DD/MM/YYYY hh:mm:ss");

      console.log(element.id_estoque_utilizavel, element.data_log_venda)
      let ut = []
    
      
      if(element.utilizacoes){

        element.utilizacoes.forEach(data => {
          
          let dataUtilizacao =  moment(data).format("DD/MM/YYYY hh:mm:ss");
          let msg = dataUtilizacao + "\n"
          ut.push(msg)          

        });

        element.utilizacoes = ut

      }
      
    });

    this.setTimeoutTicketsVerify()    
    this.isLoading = false

  }
    
  setTimeoutTicketsVerify(){

    let self = this

    let timeOutTotal = setInterval(function(){ 

      let allOk = true

      self.allTickets.forEach(element => {

        if(! element.MODIFICADO){
          allOk = false          
        }          
      });

      if(allOk){
          self.totemWorking()
          clearInterval(timeOutTotal)
          self.uiUtils.showToast(self.dataInfo.titleProcessFinished)
      }
        
    }, 3000);      
       
  }

  clearChecks(){
    this.totalChecks = 0
    this.totalChecksNotOk = 0
    this.totalChecksOk = 0
  }

  searchMultipleTicketsNetwork(){
    
    let self = this  
    this.clearChecks()  

    this.checkInputs().then(result => {
      
      if(result){

        self.uiUtils.showToast(this.dataInfo.startVerification)
        self.isLoading = true

        self.searchMultipleCallback()                       
    }
            
    }).catch(error => {
      console.error(error)
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

  checkInputs(){
    return new Promise<boolean>((resolve, reject) => {       
      resolve(true);       
    });    
  }

  searchMultipleCallback(){    

    this.totalChecks = this.allTickets.length

    if(this.allTickets.length == 0)
      this.searchCallbackNone()    

    else 
      this.searchCallbackContinue() 
  }


  searchCallbackNone(){
      this.uiUtils.showToast(this.dataInfo.noResults)
      this.isLoading = false
  }

  searchCallbackContinue(){
    let self = this    
   
    this.allTickets.forEach(element => {
      self.searchOneTicket(element)      
    });        

    this.setTimeoutTicketsVerify()
  }

  searchOneTicket(ticket){  
    console.log(this.dataInfo.searchingTicket, ticket.id_estoque_utilizavel)        

    if(ticket.data_log_venda == undefined)
      this.ticketNotSold(ticket.id_estoque_utilizavel)
    else {     
      
      this.http.checkTicketSold(ticket.id_estoque_utilizavel).subscribe( data => {

        this.checkSold(data)                    
      })                  
    }
  }

  ticketNotSold(ticket){  
    let self = this
    self.totalChecksNotOk++

    this.allTickets.forEach(element => {

      if(element.id_estoque_utilizavel == ticket){            
        element.data_log_venda = ''
        element.alerta  = self.dataInfo.ticketNotSoldedMsg
        element.MODIFICADO  = true        
      }
    });
  }  

  checkTicketExist(ticket, ticketActual){
    console.log(this.dataInfo.checkingTicketExist, ticketActual.id_estoque_utilizavel)

    if(ticket.length == 0)
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
    self.totalChecksNotOk++

    this.allTickets.forEach(element => {

      if(element.id_estoque_utilizavel == ticket){         
        element.data_log_venda = self.dataInfo.titleDateSaleNotExist
        element.alerta  = self.dataInfo.ticketNotSoldedMsg
        element.MODIFICADO  = true        
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
    
    if(ticket.length > 0)
      this.checkTicketContinue(ticketActual)
   else 
      this.checkTicketAreaAccessDenied(ticketActual.id_estoque_utilizavel)     
  }

  checkTicketAreaAccessDenied(ticket){
    console.log('checkTicketAreaAccessDenied: ', ticket)

    let self = this
    self.totalChecksNotOk++

    this.allTickets.forEach(element => {

      if(element.id_estoque_utilizavel == ticket){          
        let dateSell = moment(element.data_log_venda).format("L");      
        element.data_log_venda = dateSell     

        element.alerta  = self.dataInfo.accessDenied + ' - ' + self.dataInfo.ticketNotAllowed
        element.MODIFICADO  = true        
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

    if(ticket.length == 0)
      this.ticketNotExist(ticketActual.id_estoque_utilizavel)

   else 
      this.ticketCheckValidity(ticket, ticketActual)
  }  

  ticketCheckValidity(ticket, ticketActual){    

    console.log('ticketCheckValidity', ticketActual.id_estoque_utilizavel)
        
    ticket.forEach(element => {      
      
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
      this.ticketValidityTimeNotOk(ticketActual.id_estoque_utilizavel)           
  }

  ticketValidityTimeNotOk(ticket){    
    let self = this
    self.totalChecksNotOk++
    let tempo_validade = ticket.tempo_validade    
    let message = this.dataInfo.titleTicketInvalid + moment(ticket.data_log_venda).hours(tempo_validade).format("L");        
    
    this.allTickets.forEach(element => {

      if(element.id_estoque_utilizavel == ticket){    
        
        let dateSell = moment(element.data_log_venda).format("L");      
        element.data_log_venda = dateSell            
        element.alerta  = message
        element.MODIFICADO  = true        
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
    self.totalChecksNotOk++
    let message = this.dataInfo.titleTicketInvalid + moment(ticket.data_log_venda).format("L")    

    this.allTickets.forEach(element => {

      if(element.id_estoque_utilizavel == ticket.id_estoque_utilizavel){  
        

        let dateSell = moment(element.data_log_venda).format("L");      
        element.data_log_venda = dateSell
        element.alerta  = message
        element.MODIFICADO  = true        
      }
    });
  }

  ticketValidityInfinite(ticket){   
    console.log('ticketValidityInfinite', ticket.id_estoque_utilizavel)
    this.checkValidityOk(ticket, ticket.id_estoque_utilizavel)  
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
      this.ticketAccessSameDay(ticket, ticketActual)
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

      this.http.checkTicketUsedSimple(ticketActual.id_estoque_utilizavel).subscribe(data => {           
        this.ticketAccessTimeDoorContinue(data, ticketActual)      
      })      

    } else {

      this.ticketAccessTimeDoorNotOk(ticket)      
    }
  }

  ticketAccessTimeDoorContinue(ticket, ticketActual){

    console.log('ticketAccessTimeDoorContinue', ticketActual.id_estoque_utilizavel) 

    if(ticket.length == 0)
      this.useTicket(ticketActual.id_estoque_utilizavel)

    else {
        this.ticketAccessTimeDoorNotOkUsed(ticket[0])      

    }
  }

  ticketAccessTimeDoorNotOk(ticket){    
    console.log('ticketAccessTimeDoorNotOk')

    let self = this
    self.totalChecksNotOk++
    let message = this.dataInfo.titleTicketInvalid + ' - ' + moment(ticket.data_log_venda).add(ticket.horas_porta_acesso, 'hours').format("LLL");
    
    this.allTickets.forEach(element => {

      if(element.id_estoque_utilizavel == ticket.id_estoque_utilizavel){    

        let dateSell = moment(element.data_log_venda).format("L");      
        element.data_log_venda = dateSell            
        element.alerta  = message
        element.MODIFICADO  = true        
      }
    });
  }

  ticketAccessTimeDoorNotOkUsed(ticket){    
    console.log('ticketAccessTimeDoorNotOkUsed')

    let self = this
    self.totalChecksNotOk++
    let message = this.dataInfo.ticketAlreadyUsed + ' - ' + moment(ticket.data_log_venda).add(ticket.horas_porta_acesso, 'hours').format("L");
    
    this.allTickets.forEach(element => {

      if(element.id_estoque_utilizavel == ticket.fk_id_estoque_utilizavel){    

        let dateSell = moment(element.data_log_venda).format("L");      
        element.data_log_venda = dateSell            
        element.alerta  = message
        element.MODIFICADO  = true        
      }
    });
  }


  ticketAccessSameDay(ticket, ticketActual){
    console.log('ticketAccessSameDay', ticketActual.id_estoque_utilizavel) 

    let until =  moment(ticket.data_log_venda).format();
    let now = moment().format()                  
    let isSame = moment(until).isSame(now, 'day');    
    
    if(isSame)
      this.useTicket(ticketActual.id_estoque_utilizavel)
      
    else 
      this.ticketAccessSameDayNotOk(ticket)
  
  }

  ticketAccessSameDayNotOk(ticket){
    let self = this
    self.totalChecksNotOk++
    let message = this.dataInfo.titleTicketInvalid + moment(ticket.data_log_venda).format("LT");
    
    this.allTickets.forEach(element => {

      if(element.id_estoque_utilizavel == ticket.id_estoque_utilizavel){            

        let dateSell = moment(element.data_log_venda).format("L");      
        element.data_log_venda = dateSell            
        element.alerta  = message
        element.MODIFICADO  = true        
      }
    });
  }

  ticketAccessOnlyone(ticket, ticketActual){
    console.log('ticketAccessOnlyone', ticketActual) 

    this.http.checkTicketUsed(ticketActual.id_estoque_utilizavel).subscribe(data => {
      this.ticketAccessOnlyOneCallback(data, ticketActual.id_estoque_utilizavel)      
    })
  }

  ticketAccessCountPass(ticket, ticketActual){

    console.log('ticketAccessCountPass', ticketActual) 

    this.http.checkTicketUsedTotal(ticketActual.id_estoque_utilizavel).subscribe(data => {
      this.ticketAccessCountPassCallback(data, ticketActual)      
    })
  }

  ticketAccessCountPassCallback(ticket, ticketActual){    

    console.log('ticketAccessCountPassCallback', ticketActual.id_estoque_utilizavel) 

    if(ticket.length == 0)
      this.useTicket(ticketActual.id_estoque_utilizavel)
    else 
      this.ticketAccessCountPassContinue(ticket, ticketActual)        
  }

  ticketAccessCountPassContinue(ticket, ticketActual){   
    console.log('ticketAccessCountPassContinue', ticketActual.id_estoque_utilizavel)  
    
    ticket.forEach(element => {

       let numero_liberacoes = element.numero_liberacoes        
       let total = element.TOTAL       

       if(total < numero_liberacoes)
          this.useTicket(ticketActual.id_estoque_utilizavel)
          
        else          
          this.ticketAccessCountPassNotOk(ticketActual.id_estoque_utilizavel)
    });
  }


  ticketAccessCountPassNotOk(ticket){    

    console.log('ticketAccessCountPassNotOk', ticket) 

   let self = this
   self.totalChecksNotOk++
   
   this.allTickets.forEach(element => {

    if(element.id_estoque_utilizavel == ticket){    
      
      let dateSell = moment(element.data_log_venda).format("L");      
      element.data_log_venda = dateSell
      element.alerta  = this.dataInfo.accessCountLimitPassed
      element.MODIFICADO  = true      
     }
    });
  }

  ticketAccessOnlyOneCallback(ticket, ticketActual){  
    console.log('ticketAccessOnlyOneCallback', ticketActual)  

    if(ticket.length > 0){
      this.ticketAlreadUsedFinish(ticket, ticketActual)

    } else {
      this.useTicket(ticketActual)
    }
  }

  ticketAlreadUsedFinish(ticket, ticketActual){   
    console.log('ticketAlreadUsedFinish', ticketActual)

    let self = this
    self.totalChecksNotOk++
    let ponto = ""

    ticket.forEach(element => {
        ponto = element.nome_ponto_acesso
    });
    
    this.allTickets.forEach(element => {

      if(element.id_estoque_utilizavel == ticketActual){

          let statusTicketStart = moment(element.data_log_utilizacao).format("L");           
          let dateSell = moment(element.data_log_venda).format("L");            
        
          element.data_log_venda = dateSell
          element.alerta  =  "Utilizado em: " + ponto + " - " + statusTicketStart
          element.MODIFICADO  = true               
        }        
    });                  
  }

  useTicket(ticket){

    console.log('Utilizando ticket: ', ticket, this.areaId)  
    this.dataInfo.ticketRead = this.dataInfo.ticketRead + ticket    
  }

}
