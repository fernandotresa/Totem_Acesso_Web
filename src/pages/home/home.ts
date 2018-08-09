import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Events } from 'ionic-angular';
import { HttpdProvider } from '../../providers/httpd/httpd';
import { DatabaseProvider } from '../../providers/database/database';
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils'
import { Observable } from 'rxjs/Observable';
import { Searchbar } from 'ionic-angular';
import { Socket } from 'ng-socket-io';
import moment from 'moment';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'

})
export class HomePage {
  @ViewChild('searchbar') searchbar:Searchbar;

  configs: Observable<any>;
  areaInfo: Observable<any>;
  ticket: Observable<any>;  
  gpios: Observable<any>;
  
  idTypeBackgrond: number = this.dataInfo.backgroundIdNone;
  ticketRead: Boolean = false

  titleTicketOne: string = "Ingresso"
  multipleColor: string = "danger"

  title: string = this.dataInfo.titleGeneral
  message1: string = this.dataInfo.isLoading
  message2: string = this.dataInfo.isLoading
      
  areaId: number = this.dataInfo.areaId
  pontoId: number = this.dataInfo.totemId
  updatedInfo: Boolean = false
  updating: Boolean = false

  counter: string = this.dataInfo.isLoading
  statusTicket: string = this.dataInfo.ticketOk
  statusTicketStart: string = "" 
  statusTicketAccess: string = ""
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
    private socket: Socket,
    public events: Events,
    public http: HttpdProvider) { 
      
      let self = this    

      //this.startGPIOs()

      events.subscribe('totem:updated', (data) => {
        self.loadConfigCallback(data)
      });
  }
  

  ionViewDidLoad() {

    this.updatedInfo = this.navParams.get('updatedInfo')

    this.updating = false

    if(this.updatedInfo == undefined)
        this.updatedInfo = false
      
    if(this.updatedInfo)
        this.updateInfo()
    else   
      this.loadConfig()                
  }

  startTimer(){
    let self = this

    setInterval(function(){ 

      if(! self.updating && self.areaId)

          self.updateInfo(); 
          self.setFocus();
    
    }, 3000);      
  }

  startGPIOs(){
    this.gpios = this.getGpios()

    this.gpios.subscribe(data => {
      this.gpioEvent(data)          
    })
  }

  gpioEvent(data){
    let gpio_ = data.gpio
    let event_ = data.event

    console.log('Evento GPIO recebido:', gpio_, event_)

    if(gpio_ == 2)
        this.setMultiple()

    else if(gpio_ == 3)
      this.goHistory()

    else if(gpio_ == 4)

      this.decrementCounter()

     else 
      console.log('Comando desconhecido do gpio:', gpio_);
  }

  setFocus(){
    this.searchbar.setFocus();          
  }

  backHome(){
    let self = this

    setTimeout(function(){ 
      self.idTypeBackgrond = self.dataInfo.backgroundIdNone
      self.searchTicket = ''
      self.searching = false    
      self.ticketRead = false
      self.dataInfo.ticketRead = self.dataInfo.ticketReadDefault
    }, 3000);      
  }

  goHistory(){
    let self = this

    this.statusTicket = this.dataInfo.already
    this.idTypeBackgrond = this.dataInfo.backgroundIdSearch

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

  showSettings(){
    this.updating = true
    this.navCtrl.push("SettingsPage")
  }  

  decrementCounter(){

    this.updating = true
    this.updatedInfo = false

    this.http.decrementAreaCounter(this.areaId)
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

      console.log('Configurado Totem ID:', this.pontoId)
      console.log('Configurado Area ID:', this.areaId)    

    this.http.getAreaInfo(this.areaId).subscribe(data => {            
      self.loadConfigCallback(data)            
    });

    }    
  }

  loadConfigCallback(data){
    console.log('Configurando totem', data)

    if(data.length == 0)    
    {
      this.title = "IP não localizado"
      this.counter = "0"
    }

    else {

      let self = this
    
      data.success.forEach(element => {            
        console.log('Configuração do totem: ', element)
        self.title = element.nome_area_acesso
        self.counter = element.lotacao_area_acesso       
        self.areaId = element.fk_id_area_acesso    
        self.pontoId = element.fk_id_ponto_acesso
      });                    
  
      self.uiUtils.showToast('Inicializado com sucesso!')
      self.startTimer()
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
    
    console.log('Modificado:', this.searchTicket)

    if(this.searchTicket.length == 8){
      this.searchOneTicket()      
    }    
  } 

  searchOneTicket(){  
    console.log('Procurando um ingresso:', this.searchTicket)

    this.http.checkTicketSold(this.searchTicket).subscribe( data => {
      this.checkSold(data)                    
    })                  
  }
  

  checkSold(ticket){
    console.log('Verificando se foi vendido', ticket)

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

  ticketNotSold(ticket){  
    this.ticketRead = true
    this.statusTicket = this.dataInfo.ticketNotSoldedMsg
    this.idTypeBackgrond = this.dataInfo.backgroundIdRed
    this.message1 = this.dataInfo.ticketNotSolded
    this.message2 = this.dataInfo.ticketNotSoldedMsg
    this.dataInfo.ticketRead = this.dataInfo.ticketRead + this.searchTicket
    this.backHome()
  }

  checkTicket(ticket){       

  if(ticket.success.length > 0){
      this.checkTicketContinue()
    } else {
      this.checkTicketAreaAccessDenied()    
    }
  }    

  checkTicketAreaAccessDenied(){
    this.statusTicket = this.dataInfo.accessDenied
    this.idTypeBackgrond = this.dataInfo.backgroundIdRed
    this.ticketRead = true
    this.dataInfo.ticketRead = this.dataInfo.ticketRead + this.searchTicket   
    this.message1 = this.dataInfo.accessDenied      
    this.message2 = this.dataInfo.ticketNotAllowed
    this.backHome()
  }

  checkTicketContinue(){    
    console.log('Ticket vendido, verificando validade')

    this.http.checkTicketContinue(this.searchTicket).subscribe(data => {            
      this.checkTicketContinueCallback(data)     
    })  
  }

  checkTicketContinueCallback(ticket){    

    if(ticket.success.length == 0){
      this.ticketNotExist(ticket)

    } else {
      this.ticketCheckValidity(ticket)
    }
  } 
      
  ticketNotExist(ticket){

    console.log('Ticket não existe: ', ticket)

    this.message1 = this.dataInfo.ticketNotRegistered      
    this.message2 = this.dataInfo.ticketNotRegisteredMsg
    this.idTypeBackgrond = this.dataInfo.backgroundIdRed
    this.ticketRead = true
    this.dataInfo.ticketRead = this.dataInfo.ticketRead + this.searchTicket
    this.backHome()
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
    console.log('ticketValidityTime')
    
    let tempo_validade = ticket.tempo_validade
    this.statusTicketStart = moment(ticket.data_log_venda).format("L")    

    let until =  moment(ticket.data_log_venda).hours(tempo_validade).format();
    let now = moment().format()    
    
    let isAfter = moment(until).isAfter(now);

    if(isAfter){
      this.checkValidityOk(ticket)

    } else {
      this.ticketValidityTimeNotOk(ticket)      
    }    
  }

  ticketValidityTimeNotOk(ticket){    

    let tempo_validade = ticket.tempo_validade
    this.idTypeBackgrond = this.dataInfo.backgroundIdRed
    this.message1 = this.dataInfo.ticketOld
    this.message2 = moment(ticket.data_log_venda).hours(tempo_validade).format("L");
    this.ticketRead = true
    this.dataInfo.ticketRead = this.dataInfo.ticketRead + this.searchTicket    
    this.backHome()
  }

  ticketValiditySameDay(ticket){

    let now = moment().format()    

    let isSame = moment(ticket.data_log_venda).isSame(now, 'day')
    this.history = this.dataInfo.ticketRead + this.searchTicket
    this.statusTicketStart = moment(ticket.data_log_venda).format("L")    

    if(this.idTypeBackgrond === this.dataInfo.backgroundIdSearch){                      

      if(isSame){

        this.statusTicket = this.dataInfo.ticketOk
        this.idTypeBackgrond = this.dataInfo.backgroundIdSearchOk
        this.ticketRead = true
        
        this.backHome()
  
      } else {          
        this.ticketValidityNotSame(ticket)
      }      

    } else {

      if(isSame)
        this.checkValidityOk(ticket)    
      else
        this.ticketValidityNotSame(ticket)
    }        
  }

  ticketValidityNotSame(ticket){
    this.ticketRead = true
    this.dataInfo.ticketRead = this.dataInfo.ticketRead + this.searchTicket
    this.idTypeBackgrond = this.dataInfo.backgroundIdRed
    this.message1 = this.dataInfo.ticketOld
    this.message2 = moment(ticket.data_log_venda).format("L")    
    this.backHome()
  }

  ticketValidityInfinite(ticket){
    this.history = this.dataInfo.ticketRead + this.searchTicket
    this.statusTicketStart = moment(ticket.data_log_venda).format("L")   
    this.useTicket(ticket)    
  }

  checkValidityOk(ticket){
    console.log('Validação do ticket ok' , ticket)
    this.checkDoorRules(ticket)
  }

  checkDoorRules(ticket){
    console.log('Verificando regras da porta de acesso', ticket)

    let horas_porta_acesso = ticket.horas_porta_acesso
    let mesmo_dia_porta_acesso = ticket.mesmo_dia_porta_acesso
    let unica_porta_acesso = ticket.unica_porta_acesso
    let numero_liberacoes = ticket.numero_liberacoes
    let contagem_porta_acesso = ticket.numero_liberacoes

    console.log('Configuração do ticket:', horas_porta_acesso, mesmo_dia_porta_acesso, unica_porta_acesso, numero_liberacoes, contagem_porta_acesso)

    if(horas_porta_acesso > 0){
      this.ticketAccessTimeDoor(ticket)
    }
    else if(mesmo_dia_porta_acesso > 0){
      this.ticketAlreadUsedFinish(ticket)
    }
    else if(unica_porta_acesso > 0){
      this.ticketAccessOnlyone(ticket)
    }
    else if(numero_liberacoes > 0){
      this.ticketAccessCountPass(ticket)
    }
    
    else {
      console.log('Tipo de ingresso não encontrado:', ticket)
    }
  }

  ticketAccessTimeDoor(ticket){
    console.log('horas_porta_acesso:', ticket)
  }

  ticketAccessOnlyone(ticket){
    console.log('Checando acesso único:', ticket)

    this.http.checkTicketUsed(this.searchTicket).subscribe(data => {
      this.ticketAccessOnlyOneCallback(data)      
    })
  }

  ticketAccessCountPass(ticket){
    console.log('numero_liberacoes:', ticket)   
  }

  ticketAccessOnlyOneCallback(ticket){
    
    if(ticket.success.length > 0){
      this.ticketAlreadUsedFinish(ticket)
    } else {
      this.useTicket(ticket)
    }
  }

  ticketAlreadUsedFinish(ticket){
    this.statusTicket = this.dataInfo.already
    this.idTypeBackgrond = this.dataInfo.backgroundIdSearchNotOk
    this.ticketRead = true
    this.dataInfo.ticketRead = ''
    this.dataInfo.ticketRead = this.searchTicket

    ticket.success.forEach(element => {
      this.statusTicketUsedOn = element.nome_ponto_acesso
      this.statusTicketStart = moment(element.data_log_utilizacao).format("L");      
    });

    this.backHome()
  }

  useTicket(ticket){

    console.log('Utilizando ticket: ', this.searchTicket, ticket)

    this.ticketRead = true
    this.dataInfo.ticketRead = ''
    this.dataInfo.ticketRead = this.dataInfo.ticketRead + this.searchTicket

    let self = this

    this.http.useTicket(this.searchTicket).subscribe( data => {
      self.useTicketContinue()            
    })
  }

  useTicketContinue(){
    let self = this
    
    this.http.checkTicket(this.searchTicket).subscribe(data => {
      self.useTicketEnd(data)
    })    
  }
  
  useTicketEnd(ticket){
    console.log('Ticket utilizado com sucesso', ticket)

    let self = this
    
    ticket.success.forEach(element => {
      console.log('element.nome_subtipo_produto', element.nome_subtipo_produto)
      self.message1 = element.nome_subtipo_produto
    });

    
    self.statusTicket = self.dataInfo.ticketOk
    self.idTypeBackgrond = self.dataInfo.backgroundIdGreen
    
    self.message2 = self.dataInfo.welcomeMsg              
    self.incrementCounter()
    self.backHome()
  }

  setMultiple(){      
      this.navCtrl.push("MultiplePage")        
  }    

  getGpios() {
    let observable = new Observable(observer => {
      this.socket.on('gpio-changed', (data) => {
        observer.next(data);
      });
    })
    return observable;
  }

}
