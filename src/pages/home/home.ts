import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { HttpdProvider } from '../../providers/httpd/httpd';
import { DatabaseProvider } from '../../providers/database/database';
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils'
import { Observable } from 'rxjs/Observable';
import { FormControl } from '@angular/forms';
import 'rxjs/add/operator/debounceTime';
import moment from 'moment';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'

})
export class HomePage {

  configs: Observable<any>;
  areaInfo: Observable<any>;
  ticket: Observable<any>;  
  
  idTypeBackgrond: number = this.dataInfo.backgroundIdNone;

  title: string = this.dataInfo.isLoading
  message1: string = this.dataInfo.isLoading
  message2: string = this.dataInfo.isLoading
      
  areaId: string = '1'
  pontoId: string = '1'
  updatedInfo: Boolean = false
  updating: Boolean = false

  counter: string = this.dataInfo.isLoading
  statusTicket: string = this.dataInfo.ticketOk
  statusTicketStart: string = this.dataInfo.fakeTime1  
  statusTicketAccess: string = this.dataInfo.fakeAccessPoints

  statusTicketUsedOn: string = this.dataInfo.fakeAccessPointsUsed  

  history: string = this.dataInfo.history
  historyText1: string = this.dataInfo.historyUntilDay
  historyText2: string = this.dataInfo.accessPoints
  historyText3: string = this.dataInfo.usedDay

  searchControl: FormControl;
  searchTerm: string = '';
  searching: any = false;  
  
  constructor(
    public dataInfo: DataInfoProvider,
    public navCtrl: NavController,
    public uiUtils: UiUtilsProvider,     
    public db: DatabaseProvider,
    public navParams: NavParams,  
    public http: HttpdProvider) { 

      this.searchControl = new FormControl();
      
      let self = this

      setInterval(function(){ 

        if(! self.updating && self.areaId)
            self.updateInfo(); 
      
      }, 3000);            
  }

  backHome(){
    let self = this

    setTimeout(function(){ 

      self.idTypeBackgrond = self.dataInfo.backgroundIdNone
      self.searchTerm = ''
      self.searching = false

      console.log(self.idTypeBackgrond)
    
    }, 3000);      
  }

  showHistory(){

    if(this.idTypeBackgrond !== this.dataInfo.backgroundIdSearch){
      this.statusTicket = this.dataInfo.already
      this.idTypeBackgrond = this.dataInfo.backgroundIdSearch

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

  ionViewDidLoad() {

    this.updatedInfo = this.navParams.get('updatedInfo')

    if(this.updatedInfo == undefined)
        this.updatedInfo = false
      
    if(this.updatedInfo)
        this.updateInfo()

    else   
      this.loadConfig()                
  }

  loadConfig(){       
    this.configs = this.db.getConfigArea()
    let self = this

    this.configs.subscribe(data => {            

      data.forEach(element => {

        let el = element.areaInfo    

        self.title = el.nome_area_acesso
        self.counter = el.lotacao_area_acesso   
        self.areaId = el.id_area_acesso  
      });            
      
      if(self.areaId == ''){
        self.uiUtils.showToast(self.dataInfo.noConfiguration)
      }                 
    })
  }

  updateInfo(){

    this.updating = true
    this.updatedInfo = false

    let self = this

    return this.http.getAreaCounter(this.areaId).subscribe(data => {

      Object.keys(data).map(function(personNamedIndex){
        let person = data[personNamedIndex];                
        self.counter = person[0].lotacao_area_acesso
      });                
    })
  }

  setFilteredItems(){

    if(this.searchTerm.length > 0 && parseInt(this.searchTerm)){

      this.http.checkTicket(this.searchTerm).subscribe(data => {      
        this.checkTicket(data)
      })                  
    }    
  }

  checkTicket(ticket){    

    if(ticket.success.length > 0){
      this.ticketAlreadyUsed(ticket)

    } else {
      this.checkTicketContinue()
    }
  }

  checkTicketContinue(){    

    this.http.checkTicketContinue(this.searchTerm).subscribe(data => {            
      this.checkTicketContinueCallback(data)     
    })  
  }

  checkTicketContinueCallback(ticket){    

    if(ticket.success.length == 0){
      this.ticketNotExist()

    } else {
      this.ticketCheckValidity(ticket)
    }

  }

  ticketAlreadyUsed(ticket){

    this.statusTicket = this.dataInfo.already
    this.idTypeBackgrond = this.dataInfo.backgroundIdSearchNotOk

    ticket.success.forEach(element => {

      this.statusTicketUsedOn = element.nome_ponto_acesso
      this.statusTicketStart = moment(element.data_log_utilizacao).format("L");      
    });
  }

  ticketNotExist(){

    this.message1 = this.dataInfo.ticketNotRegistered      
    this.message2 = this.dataInfo.ticketNotRegisteredMsg
    this.idTypeBackgrond = this.dataInfo.backgroundIdRed
  }

  ticketCheckValidity(ticket){    

    console.log(ticket)
        
    ticket.success.forEach(element => {      
      
      if(element.mesmo_dia_validade == 1){          
        this.ticketValiditySameDay(element)          
      } 

    });           
  }

  ticketValiditySameDay(ticket){

    let now = moment().format()    

    let isSame = moment(ticket.data_log_venda).isSame(now, 'day')
    this.history = this.dataInfo.ticketRead + this.searchTerm
    this.statusTicketStart = moment(ticket.data_log_venda).format("L")

    console.log('Mesmo dia?', isSame)

    if(this.idTypeBackgrond === this.dataInfo.backgroundIdSearch){                

      console.log('this.idTypeBackgrond === this.dataInfo.backgroundIdSearch')

      if(isSame){

        this.statusTicket = this.dataInfo.ticketOk
        this.idTypeBackgrond = this.dataInfo.backgroundIdSearchOk
  
      } else {
          
        this.idTypeBackgrond = this.dataInfo.backgroundIdRed
        this.message1 = this.dataInfo.ticketOld
        this.message2 = moment(ticket.data_log_venda).format("L")
      }

    } else {
      this.useTicket(ticket)
    }
    
  }

  useTicket(ticket){

    console.log('Utilizando ticket: ', ticket.id_estoque_utilizavel, this.areaId)
    let self = this

    this.http.useTicket(ticket.id_estoque_utilizavel, this.areaId).subscribe( () => {

      self.statusTicket = self.dataInfo.ticketOk
      self.idTypeBackgrond = self.dataInfo.backgroundIdGreen

      self.message1 = ticket.nome_tipo_produto
      self.message2 = self.dataInfo.welcomeMsg

      self.backHome()
      
    })

  }


  

  

}
