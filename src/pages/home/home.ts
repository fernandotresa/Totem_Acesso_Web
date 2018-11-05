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
    console.log("Recarregando página")

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
    
    this.events.subscribe('socket:pageMultiple', (data) => {
      this.setMultiple()
    });

    this.events.subscribe('socket:pageHistory', (data) => {
      this.goHistory()
    });

    this.events.subscribe('socket:decrementCounter', (data) => {
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

    setTimeout(function(){ 
      self.resetConfig()
    }, 3000); 
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

    //console.log(this.dataInfo.areaId, this.areaId)

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
      console.log(new Date())
      self.loadConfigCallback(data)            
    });

    }    
  }

  
  loadConfigCallback(data){
    console.log('Configurando totem', data.success[0])

    if(data.length == 0)    
    {
      this.title = "IP não localizado"
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
  
      self.uiUtils.showToast('Inicializado com sucesso!')
      self.startTimer()
      self.totemWorking()
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
          self.uiUtils.showToast('Favor configurar sistema')
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
    //console.log('Procurando um ingresso:', this.searchTicket)

    this.totemNotWorking()

    this.http.checkTicketExist(this.searchTicket).subscribe( data => {
      this.checkTicketExist(data)                    
    })                  
  }  

  checkTicketExist(ticket){
    //console.log('Verificando se existe:', this.searchTicket)

    if(ticket.success.length == 0)
      this.ticketNotExist(ticket)

    else {
      this.http.checkTicketSold(this.searchTicket).subscribe( data => {
        this.checkSold(data)                    
      })                  
    }    
  }

  ticketNotExist(ticket){    
    this.showError(this.dataInfo.accessDenied, this.dataInfo.ticketNotRegisteredMsg)    
  }

  checkSold(ticket){
    //console.log('Verificando se foi vendido:', this.searchTicket)
    
    if(ticket.success.length == 0){
      this.ticketNotSold(ticket)

    } else {

      ticket.success.forEach(element => {

        if(element.data_log_venda == undefined)
          this.ticketNotSold(ticket)
        else {
          this.http.checkTicket(this.searchTicket).subscribe(data => {      
            this.checkTicket(data)
          }) 
        }      
      });   
    }    
  }

  showError(str1, str2){  

    this.isLoading = false
    this.ticketRead = true            
    this.history = this.dataInfo.ticketRead + this.searchTicket
    
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
    this.showError(this.dataInfo.accessDenied, this.dataInfo.ticketNotSoldedMsg)
  }

  checkTicket(ticket){       
    console.log('Verificando se possui acesso:', this.searchTicket)

  if(ticket.success.length > 0)
      this.checkTicketContinue()
  else 
      this.checkTicketAreaAccessDenied()      
  }    

  checkTicketAreaAccessDenied(){
    this.showError(this.dataInfo.accessDenied, this.dataInfo.ticketNotAllowed)
  }

  checkTicketContinue(){    
    this.http.checkTicketContinue(this.searchTicket).subscribe(data => {            
      this.checkTicketContinueCallback(data)     
    })  
  }

  checkTicketContinueCallback(ticket){   
    
    console.log('Verificando validades:', this.searchTicket) 

    if(ticket.success.length == 0){
      this.checkTicketAreaAccessDenied()
    }
      
    else 
      this.ticketCheckValidity(ticket)    
  }         

  ticketCheckValidity(ticket){
        
    ticket.success.forEach(element => {      
      
      if(element.mesmo_dia_validade == 1)
        this.ticketValiditySameDay(element)          
    
      else if(element.infinito_validade == 1)
        this.ticketValidityInfinite(element)
    
      else 
        this.ticketValidityTime(element)
      
    });           
  }  

  ticketValiditySameDay(ticket){

    console.log('Verificando validade do mesmo dia', this.searchTicket)

    let now = moment().format()        
    let isSame = moment(ticket.data_log_venda).isSame(now, 'day')

    this.history = this.dataInfo.ticketRead + this.searchTicket
    this.statusTicketStart = moment(ticket.data_log_venda).format("L")    
    this.history = this.dataInfo.ticketRead + this.searchTicket

    if(isSame)
        this.checkValidityOk(ticket)    
      else
        this.ticketValidityNotSame(ticket)        
  }

  ticketValidityNotSame(ticket){    
    let message = 'Ingresso vencido: ' + moment(ticket.data_log_venda).format("L")    
    this.showError(this.dataInfo.accessDenied, message)            
  }

  ticketValidityInfinite(ticket){
    this.history = this.dataInfo.ticketRead + this.searchTicket
    this.statusTicketStart = moment(ticket.data_log_venda).format("L")   
    this.useTicket(ticket)    
  }

  ticketValidityTime(ticket){
    let tempo_validade = ticket.tempo_validade
    this.statusTicketStart = moment(ticket.data_log_venda).format("L")    
    let until =  moment(ticket.data_log_venda).hours(tempo_validade).format();
    let now = moment().format()        
    let isAfter = moment(until).isAfter(now);

    if(isAfter)
      this.checkValidityOk(ticket)
     else 
      this.ticketValidityTimeNotOk(ticket)           
  }

  ticketValidityTimeNotOk(ticket){    
    let tempo_validade = ticket.tempo_validade    
    let message = 'Limite: ' + moment(ticket.data_log_venda).hours(tempo_validade).format("L");        
    this.showError(this.dataInfo.accessDenied, message)        
  }

  checkValidityOk(ticket){    
    this.checkDoorRules(ticket)
  }

  checkDoorRules(ticket){

    console.log('Verificando regras das portas', this.searchTicket)

    let horas_porta_acesso = ticket.horas_porta_acesso
    let mesmo_dia_porta_acesso = ticket.mesmo_dia_porta_acesso
    let unica_porta_acesso = ticket.unica_porta_acesso
    let numero_liberacoes = ticket.numero_liberacoes

    console.log('Horas porta acesso ligado:', horas_porta_acesso)
    console.log('Mesmo dia acesso ligado:', mesmo_dia_porta_acesso)
    console.log('Unico acesso porta ligado:', unica_porta_acesso)
    console.log('Números de liberações ligado:', numero_liberacoes)

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
      this.isLoading = false
      this.uiUtils.showToast('Tipo de verificação inválida')
    }
  }

  ticketAccessTimeDoor(ticket){

    console.log('Verificando tempo de acesso', this.searchTicket)

    let until =  moment(ticket.data_log_venda).add(ticket.horas_porta_acesso, 'hours').format();
    let now = moment().format()        
    
    let isAfter = moment(until).isAfter(now);

    if(isAfter){
      this.useTicket(ticket)
    } else {
      this.ticketAccessTimeDoorNotOk(ticket)      
    }
  }

  ticketAccessTimeDoorNotOk(ticket){    
    let message = 'Limite: ' + moment(ticket.data_log_venda).add(ticket.horas_porta_acesso, 'hours').format("LT");
    this.showError(this.dataInfo.accessDenied, message)    
  }

  ticketAccessSameDay(ticket){
    console.log('Verificando acesso porta mesmo dia', this.searchTicket)

    let until =  moment(ticket.data_log_venda).format();
    let now = moment().format()                  
    let isSame = moment(until).isSame(now, 'day');    

    if(isSame){
      this.useTicket(ticket)
    } else {
      this.ticketAccessSameDayNotOk(ticket)      
    }
  }

  ticketAccessSameDayNotOk(ticket){    
    let message = 'Limite: ' + moment(ticket.data_log_venda).format("L");
    this.showError(this.dataInfo.accessDenied, message)    
  }

  ticketAccessOnlyone(ticket){
    this.http.checkTicketUsed(this.searchTicket).subscribe(data => {
      this.ticketAccessOnlyOneCallback(data)      
    })
  }

  ticketAccessCountPass(ticket){
    //console.log(ticket)    

    this.http.checkTicketUsedTotal(this.searchTicket).subscribe(data => {
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
    this.showError(this.dataInfo.accessDenied, this.dataInfo.accessCountLimitPassed)    
  }

  ticketAccessOnlyOneCallback(ticket){  
    if(ticket.success.length > 0){
      this.ticketAlreadUsedFinish(ticket)
    } else {
      this.useTicket(ticket)
    }
  }

  ticketAlreadUsedFinish(ticket){    
    console.log(ticket)

    ticket.success.forEach(element => {
      this.statusTicketUsedOn = element.nome_ponto_acesso
      this.statusTicketStart = moment(element.data_log_utilizacao).format("L");      
    });

    let message = 'Já utilizado em ' + this.statusTicketUsedOn + ' - ' + this.statusTicketStart
    this.showError(this.dataInfo.accessDenied, message)    
  }

  useTicket(ticket){        
    
    if(this.idTypeBackgrond === this.dataInfo.backgroundIdSearch){    
      this.searchOkContinue()    

    } else {                  

      console.log('Utilizando ticket:', this.searchTicket)

      let self = this

      this.http.useTicket(this.searchTicket).subscribe( data => {
        self.useTicketContinue()            
      })
    }    
  }

  searchOkContinue(){

    this.http.checkTicketQuick(this.searchTicket).subscribe(data =>{
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

  useTicketContinue(){
    let self = this
    
    this.http.checkTicket(this.searchTicket).subscribe(data => {

      console.log('Ticket utilizado com sucesso!', this.searchTicket)

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
