import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Events } from 'ionic-angular';
import { HttpdProvider } from '../../providers/httpd/httpd';
import { DatabaseProvider } from '../../providers/database/database';
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils'
import { Observable } from 'rxjs/Observable';
import { Searchbar } from 'ionic-angular';
import moment from 'moment';
import { GpiosProvider } from '../../providers/gpios/gpios';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'

})
export class HomePage {
  @ViewChild('searchbar') searchbar:Searchbar;

  configs: Observable<any>;
  areaInfo: Observable<any>;
  ticket: Observable<any>;    
  
  idTypeBackgrond: number = this.dataInfo.backgroundIdNone;
  ticketRead: Boolean = false

  titleTicketOne: string = "Ingresso"
  multipleColor: string = "danger"

  title: string = this.dataInfo.titleGeneral
  message1: string = this.dataInfo.isLoading
  message2: string = this.dataInfo.isLoading
      
  areaId: number = this.dataInfo.areaId
  pontoId: number = this.dataInfo.totemId
  areaName: string;
  updatedInfo: Boolean = false
  updating: Boolean = false
  inputVisible: Boolean = true
  isLoading: Boolean = true

  counter: string = this.dataInfo.isLoading
  statusTicket: string = this.dataInfo.ticketOk
  statusTicketStart: string = ""   
  statusTicketUsedOn: string = ""

  history: string = this.dataInfo.history
  historyText1: string = this.dataInfo.historyUntilDay
  historyText2: string = this.dataInfo.accessPoints
  historyText3: string = this.dataInfo.usedDay

  searchTicket: string = '';  
  searching: any = false;  
  
  constructor(
    public dataInfo: DataInfoProvider,
    public navCtrl: NavController,
    public uiUtils: UiUtilsProvider,     
    public db: DatabaseProvider,
    public navParams: NavParams,   
    public gpios: GpiosProvider,  
    public events: Events,
    public http: HttpdProvider) {             
  }  

  ngOnDestroy() {    
    this.events.unsubscribe('totem:updated');		
    this.events.unsubscribe('socket:pageMultiple');		
    this.events.unsubscribe('socket:decrementCounter');		
    this.events.unsubscribe('socket:pageHistory');		
  }
    
  ionViewDidLoad() {
    this.updatedInfo = this.navParams.get('updatedInfo')
    this.events.unsubscribe('totem:updated');

    this.updating = false

    if(this.updatedInfo == undefined)
        this.updatedInfo = false
      
    if(this.updatedInfo)
        this.updateInfo()
            
    this.subscribeStuff()  
  }

  subscribeStuff(){
    let self = this
    
    this.events.subscribe('socket:pageMultiple', () => {
      this.setMultiple()
    });

    this.events.subscribe('socket:pageHistory', () => {
      this.goHistory()
    });

    this.events.subscribe('socket:decrementCounter', () => {
      this.decrementCounter()
    });

    this.events.subscribe('totem:updated', (data) => {
      self.loadConfigCallback(data)
      self.events.unsubscribe('totem:updated');	
    });
  }

  startTimer(){
    let self = this

    setInterval(function(){ 

      if(! self.updating)

          self.updateInfo();                     

          if(self.inputVisible){
            self.searchTicket = ""
            self.setFocus();
          }            
    
    }, 5000);      
  } 

  setFocus(){
    this.searchbar.setFocus();          
  }

  resetConfig(){
    let self = this
    self.idTypeBackgrond = self.dataInfo.backgroundIdNone
    self.searchTicket = ''
    self.searching = false    
    self.ticketRead = false
    self.title = self.areaName
    self.history = self.dataInfo.historyGeneral
    self.dataInfo.ticketRead = self.dataInfo.ticketReadDefault
    self.totemWorking()  
  }

  backHome(){
        
    if(this.dataInfo.tipoPontoAcesso === 1)
      this.backWithMessage()
    else  
      this.resetConfig()
  }

  backWithMessage(){
    let self = this

    let time = this.dataInfo.timeMessage

    if(this.idTypeBackgrond === this.dataInfo.backgroundIdSearch)
      time = this.dataInfo.timeMessageHistory

    setTimeout(function(){ 
      self.resetConfig()

    }, time); 
  }

  goHistory(){
    
    this.statusTicket = this.dataInfo.already
    this.idTypeBackgrond = this.dataInfo.backgroundIdSearch

    let self = this
    setTimeout(function(){ 

      self.idTypeBackgrond = self.dataInfo.backgroundIdNone
      self.searchTicket = ''
      self.searching = false    

    }, 6000);
  }

  showHistory(){

    if(this.idTypeBackgrond !== this.dataInfo.backgroundIdSearch){
        this.goHistory()
    } else {
      this.idTypeBackgrond = this.dataInfo.backgroundIdNone
    }   
  }

  decrementCounter(){
    this.updating = true
    this.updatedInfo = false

    this.http.decrementAreaCounter(this.dataInfo.areaId)
    .subscribe( () => {      

      this.updating = false
      this.updatedInfo = true
    })      
  }

  incrementCounter(){
    this.updating = true
    this.updatedInfo = false

    this.http.incrementAreaCounter(this.areaId)
    .subscribe( () => {      

      this.updating = false
      this.updatedInfo = true
    })      
  }  

  loadConfig(){       
    let self = this
    this.areaId = this.dataInfo.areaId   
    
    if(self.areaId == undefined){
      self.uiUtils.showToast(self.dataInfo.noConfiguration)

    } else {     
      this.http.getAreaInfo(this.areaId).subscribe(data => {            
        self.loadConfigCallback(data)            
      });

    }    
  }

  loadConfigCallback(data){
    console.log(this.dataInfo.configuringTotem, data.success[0])

    if(data.length == 0){
      this.title = this.dataInfo.ipNotFound
      this.counter = "0"
    }

    else {

      let self = this
      let element = data.success[0]
    
      self.title = element.nome_area_acesso
      self.counter = element.lotacao_area_acesso       
      self.areaId = element.fk_id_area_acesso    
      self.pontoId = element.fk_id_ponto_acesso
      self.areaName = self.title
      self.dataInfo.tipoPontoAcesso = element.tipo_ponto_acesso
        
      self.startTimer()
      self.totemWorking()
      self.uiUtils.showToast(this.dataInfo.inicializedSuccessfully)
    }    
  }
  
  updateInfo(){

    this.updating = true
    this.updatedInfo = false

    let self = this
         
    return this.http.getAreaCounter(this.areaId).subscribe(data => {

      Object.keys(data).map(function(personNamedIndex){
        let person = data[personNamedIndex];     

        if(person[0].lotacao_area_acesso == undefined){
          self.uiUtils.showToast(this.dataInfo.configureYourSystem)

        } else {
          self.counter = person[0].lotacao_area_acesso
        }        
      }); 
      
      self.updating = false
    })
  }

  setFilteredItems(){            
    if(this.searchTicket.length == 8 && this.inputVisible)
      this.searchOneTicket() 
  } 

  totemWorking(){
    this.inputVisible = true    
    this.isLoading = false
    this.updating = false
  }

  totemNotWorking(){
    this.inputVisible = false
    this.isLoading = true
    this.updating = true
  }

  showGpioError(){
    this.http.activeGpioError().subscribe(data => {
      console.log(data)
    })
  }

  showGpioSuccess(){
    this.http.activeGpioSuccess().subscribe(data => {
      console.log(data)
    })
  }

  searchOneTicket(){      

    if(this.searchTicket !== ""){

      let str = this.searchTicket.substring(0,8)
      console.log(this.dataInfo.searchingTicket, str, this.dataInfo.ticketSize, str.length)

      this.totemNotWorking()      

      this.http.checkTicketExist(str).subscribe( data => {
        this.checkTicketExist(data, str)
        this.totemWorking()
      }) 
    }                     
  }  

  checkTicketExist(ticket, ticketTmp){
    console.log(this.dataInfo.checkingTicketExist, ticketTmp)

    if(ticket.success.length == 0)
      this.ticketNotExist(ticketTmp)

    else {
      this.http.checkTicketSold(ticketTmp).subscribe( data => {
        this.checkSold(data, ticketTmp)                    
      })                  
    }    
  }

  ticketNotExist(ticket){    
    this.showError(this.dataInfo.accessDenied, this.dataInfo.ticketNotRegisteredMsg, ticket)    
  }

  checkSold(ticket, ticketTmp){
    console.log(this.dataInfo.checkingTicketSold, ticketTmp)
    
    if(ticket.success.length == 0){
      this.ticketNotSold(ticket)

    } else {

      ticket.success.forEach(element => {

        if(element.data_log_venda == undefined)
          this.ticketNotSold(ticketTmp)
        else {
          this.http.checkTicket(ticketTmp).subscribe(data => {      
            this.checkTicket(data, ticketTmp)
          }) 
        }      
      });   
    }    
  }

  showError(str1, str2, ticket){  

    this.isLoading = false
    this.ticketRead = true            
    this.history = this.dataInfo.ticketRead + ticket
    
    if(this.idTypeBackgrond === this.dataInfo.backgroundIdSearch){                      
      this.idTypeBackgrond = this.dataInfo.backgroundIdSearchNotOk                   
      this.historyText1 = this.dataInfo.ticketNotOk    
      this.historyText2 = str2

    } else {                  
      this.idTypeBackgrond = this.dataInfo.backgroundIdRed      
      this.message1 = str1
      this.message2 = str2
    }

    this.showGpioError()
    this.backHome()    
  }  

  ticketNotSold(ticket){          
    this.showError(this.dataInfo.accessDenied, this.dataInfo.ticketNotSoldedMsg, ticket)
  }

  checkTicket(ticket, ticketTmp){       
    console.log(this.dataInfo.checkingTicketAccess, ticketTmp)

  if(ticket.success.length > 0)
      this.checkTicketContinue(ticketTmp)
  else 
      this.checkTicketAreaAccessDenied(ticketTmp)      
  }    

  checkTicketAreaAccessDenied(ticket){
    this.showError(this.dataInfo.accessDenied, this.dataInfo.ticketNotAllowed, ticket)
  }

  checkTicketContinue(ticketTmp){    
    this.http.checkTicketContinue(ticketTmp).subscribe(data => {            
      this.checkTicketContinueCallback(data, ticketTmp)     
    })  
  }

  checkTicketContinueCallback(ticket, ticketTmp){   
    
    console.log(this.dataInfo.checkingValidity, ticketTmp) 

    if(ticket.success.length == 0){
      this.checkTicketAreaAccessDenied(ticketTmp)
    }
      
    else 
      this.ticketCheckValidity(ticket, ticketTmp)    
  }         

  ticketCheckValidity(ticket, ticketTmp){
        
    ticket.success.forEach(element => {      
      
      if(element.mesmo_dia_validade == 1)
        this.ticketValiditySameDay(element, ticketTmp)
    
      else if(element.infinito_validade == 1)
        this.ticketValidityInfinite(element, ticketTmp)
    
      else 
        this.ticketValidityTime(element, ticketTmp)      
    });           
  }  

  ticketValiditySameDay(ticket, ticketTmp){

    console.log(this.dataInfo.checkingValiditySameDay, ticketTmp)

    let now = moment().format()        
    let isSame = moment(ticket.data_log_venda).isSame(now, 'day')

    this.history = this.dataInfo.ticketRead + ticketTmp
    this.statusTicketStart = moment(ticket.data_log_venda).format("L")    
    this.history = this.dataInfo.ticketRead + ticketTmp

    if(isSame)
        this.checkValidityOk(ticket, ticketTmp)    
      else
        this.ticketValidityNotSame(ticketTmp)        
  }

  ticketValidityNotSame(ticket){    
    let message = this.dataInfo.ticketExpired + moment(ticket.data_log_venda).format("L")    
    this.showError(this.dataInfo.accessDenied, message, ticket)            
  }

  ticketValidityInfinite(ticket, ticketTmp){
    this.history = this.dataInfo.ticketRead + ticketTmp
    this.statusTicketStart = moment(ticket.data_log_venda).format("L")   
    this.useTicket(ticket)    
  }

  ticketValidityTime(ticket, ticketTmp){
    let tempo_validade = ticket.tempo_validade
    this.statusTicketStart = moment(ticket.data_log_venda).format("L")    
    let until =  moment(ticket.data_log_venda).hours(tempo_validade).format();
    let now = moment().format()        
    let isAfter = moment(until).isAfter(now);

    if(isAfter)
      this.checkValidityOk(ticket, ticketTmp)
     else 
      this.ticketValidityTimeNotOk(ticketTmp)           
  }

  ticketValidityTimeNotOk(ticket){    
    let tempo_validade = ticket.tempo_validade    
    let message = 'Limite: ' + moment(ticket.data_log_venda).hours(tempo_validade).format("L");        
    this.showError(this.dataInfo.accessDenied, message, ticket)        
  }

  checkValidityOk(ticket, ticketTmp){    
    this.checkDoorRules(ticket, ticketTmp)
  }

  checkDoorRules(ticket, ticketTmp){

    console.log(this.dataInfo.checkingRulesDoores, ticketTmp)

    let horas_porta_acesso = ticket.horas_porta_acesso
    let mesmo_dia_porta_acesso = ticket.mesmo_dia_porta_acesso
    let unica_porta_acesso = ticket.unica_porta_acesso
    let numero_liberacoes = ticket.numero_liberacoes

    console.log(this.dataInfo.ruleDoorUsed, horas_porta_acesso)
    console.log(this.dataInfo.sameDayDoorRule, mesmo_dia_porta_acesso)
    console.log(this.dataInfo.accessOlnyRule, unica_porta_acesso)
    console.log(this.dataInfo.numberAccessRule, numero_liberacoes)

    if(horas_porta_acesso > 0){
      this.ticketAccessTimeDoor(ticket, ticketTmp)
    }
    else if(mesmo_dia_porta_acesso > 0){
      this.ticketAccessSameDay(ticket, ticketTmp)
    }
    else if(unica_porta_acesso > 0){
      this.ticketAccessOnlyone(ticket, ticketTmp)
    }
    else if(numero_liberacoes > 0){
      this.ticketAccessCountPass(ticket, ticketTmp)
    }    
    else {      
      this.isLoading = false
      this.uiUtils.showToast(this.dataInfo.checkInvalid)
    }
  }

  ticketAccessTimeDoor(ticket, ticketTmp){

    console.log(this.dataInfo.checkingTimeAccess, ticketTmp)

    let until =  moment(ticket.data_log_venda).add(ticket.horas_porta_acesso, 'hours').format();
    let now = moment().format()        
    
    let isAfter = moment(until).isAfter(now);

    if(isAfter){
      this.useTicket(ticket)
    } else {
      this.ticketAccessTimeDoorNotOk(ticketTmp)      
    }
  }

  ticketAccessTimeDoorNotOk(ticket){    
    let message = 'Limite: ' + moment(ticket.data_log_venda).add(ticket.horas_porta_acesso, 'hours').format("LT");
    this.showError(this.dataInfo.accessDenied, message, ticket)    
  }

  ticketAccessSameDay(ticket, ticketTmp){
    console.log(this.dataInfo.checkingSameDayRule, ticketTmp)

    let until =  moment(ticket.data_log_venda).format();
    let now = moment().format()                  
    let isSame = moment(until).isSame(now, 'day');    

    if(isSame){
      this.useTicket(ticket)
    } else {
      this.ticketAccessSameDayNotOk(ticketTmp)      
    }
  }

  ticketAccessSameDayNotOk(ticket){    
    let message = 'Limite: ' + moment(ticket.data_log_venda).format("L");
    this.showError(this.dataInfo.accessDenied, message, ticket)    
  }

  ticketAccessOnlyone(ticket, ticketTmp){
    this.http.checkTicketUsed(ticketTmp).subscribe(data => {
      this.ticketAccessOnlyOneCallback(data, ticketTmp)      
    })
  }

  ticketAccessCountPass(ticket, ticketTmp){
    console.log(this.dataInfo.checkingAccessCountRule, ticketTmp)    

    this.http.checkTicketUsedTotal(ticketTmp).subscribe(data => {
      this.ticketAccessCountPassCallback(data, ticket)      
    })
  }

  ticketAccessCountPassCallback(ticket, ticketInfo){    

    if(ticket.success.length == 0)
      this.useTicket(ticket)
    else 
      this.ticketAccessCountPassContinue(ticket, ticketInfo)        
  }

  ticketAccessCountPassContinue(ticket, ticketInfo){    

    let numero_liberacoes = ticketInfo.numero_liberacoes    

    ticket.success.forEach(element => {
       let total = element.TOTAL       

       if(total < numero_liberacoes)
          this.useTicket(ticket)
        else          
          this.ticketAccessCountPassNotOk(ticketInfo)
    });
  }


  ticketAccessCountPassNotOk(ticket){
    this.showError(this.dataInfo.accessDenied, this.dataInfo.accessCountLimitPassed, ticket)    
  }

  ticketAccessOnlyOneCallback(ticket, ticketTmp){  
    if(ticket.success.length > 0){
      this.ticketAlreadUsedFinish(ticket, ticketTmp)
    } else {
      this.useTicket(ticket)
    }
  }

  ticketAlreadUsedFinish(ticket, ticketTmp){    
    console.log(this.dataInfo.ticketAlreadyUsed, ticketTmp)

    ticket.success.forEach(element => {
      this.statusTicketUsedOn = element.nome_ponto_acesso
      this.statusTicketStart = moment(element.data_log_utilizacao).format("L");      
    });

    let message = this.dataInfo.ticketAlreadyUsed + this.statusTicketUsedOn + ' - ' + this.statusTicketStart
    this.showError(this.dataInfo.accessDenied, message, ticketTmp)    
  }

  useTicket(ticket){        
    
    if(this.idTypeBackgrond === this.dataInfo.backgroundIdSearch){    
      this.searchOkContinue(ticket.data.ticket)    

    } else {                  

      console.log(this.dataInfo.usingTicket, ticket)

      let self = this

      this.http.useTicket(ticket).subscribe( data => {
        self.useTicketContinue(ticket.data.ticket)            
      })
    }    
  }

  searchOkContinue(ticket){

    this.http.checkTicketQuick(ticket).subscribe(data =>{
        this.searchOkCallback(data)
    })      
  }

  searchOkCallback(ticket){
    
    this.ticketRead = true
    this.idTypeBackgrond = this.dataInfo.backgroundIdSearchOk                   
    this.historyText1 = this.dataInfo.ticketOk
    this.historyText2 = ""
    this.historyText3 = ""
    let pontos = "";

    ticket.success.forEach(element => {

      let validity = element.fk_id_validade

      if(validity <= 2)
        this.historyText2 = moment(element.data_log_venda).format("L")    
       
      pontos += " - " + element.nome_ponto_acesso 

    });

    this.historyText3 = pontos    
    this.backHome()   
  }

  useTicketContinue(ticket){
    let self = this
    
    this.http.checkTicket(ticket).subscribe(data => {

      console.log(this.dataInfo.ticketUsedSuccessFully, ticket)

      self.useTicketEnd(data)
    })    
  }
  
  useTicketEnd(ticket){    

    let self = this
    let productType = ''
    let productSubType = ''
    this.ticketRead = true

    ticket.success.forEach(element => {
      productType = element.nome_produto_peq
      productSubType = element.nome_subtipo_produto
    });
    
    let msg = productType + " - " + productSubType

    self.statusTicket = self.dataInfo.ticketOk
    self.idTypeBackgrond = self.dataInfo.backgroundIdGreen    
    self.message1 = self.dataInfo.welcomeMsg              
    self.message2 = msg
    self.incrementCounter()
    self.showGpioSuccess()
    self.backHome()
  }

  setMultiple(){      
      this.navCtrl.push('Multiple')        
  }      

}
