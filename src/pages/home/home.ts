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
  
  
  idTypeBackgrond: number = this.dataInfo.backgroundIdSearch;

  title: string = this.dataInfo.isLoading
  message1: string = this.dataInfo.isLoading
  message2: string = this.dataInfo.isLoading
      
  areaId: string = '1'
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

  showHistory(){
    this.changeTicketType(this.dataInfo.searchTicket)
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AdminPage');   

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

    this.http.checkTicket(this.searchTerm).subscribe(data => {      
      this.checkTicket(data)
    })      
  }

  checkTicket(ticket){
    console.log(ticket)

    if(ticket.type == 0){
      this.ticketAlreadyUsed(ticket)
    }
  }

  ticketAlreadyUsed(ticket){

    this.statusTicket = this.dataInfo.already
    this.idTypeBackgrond = this.dataInfo.backgroundIdSearchNotOk

    ticket.success.forEach(element => {
      console.log(element)

      this.statusTicketUsedOn = element.nome_ponto_acesso
      this.statusTicketStart = moment(element.data_log_utilizacao).format("L");
      
    });
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

  changeTicketType(idType: string){
    console.log('idType', idType)

    this.idTypeBackgrond = this.dataInfo.backgroundIdGreen

    if(idType === this.dataInfo.exemptedId){
      this.message1 = this.dataInfo.exempted      
      this.message2 = this.dataInfo.welcomeMsg

    } else if(idType === this.dataInfo.halfId){
      this.message1 = this.dataInfo.half      
      this.message2 = this.dataInfo.welcomeMsg
    }
    else if(idType === this.dataInfo.fullId){
      this.message1 = this.dataInfo.full      
      this.message2 = this.dataInfo.welcomeMsg
    }
    else if(idType === this.dataInfo.alreadyId){
      this.message1 = this.dataInfo.already      
      this.message2 = this.dataInfo.alreadyMsg
      this.idTypeBackgrond = this.dataInfo.backgroundIdRed
    }
    else if(idType === this.dataInfo.ticketOldId){
      this.message1 = this.dataInfo.ticketOld      
      this.message2 = this.dataInfo.ticketOldMsg
      this.idTypeBackgrond = this.dataInfo.backgroundIdRed
    }
    else if(idType === this.dataInfo.ticketNotRegisteredId){
      this.message1 = this.dataInfo.ticketNotRegistered      
      this.message2 = this.dataInfo.ticketNotRegisteredMsg
      this.idTypeBackgrond = this.dataInfo.backgroundIdRed
    } 
    else if(idType === this.dataInfo.ticketNotSoleddId){
      this.message1 = this.dataInfo.ticketNotSolded      
      this.message2 = this.dataInfo.ticketNotSoldedMsg 
      this.idTypeBackgrond = this.dataInfo.backgroundIdRed
    } 

    else if(idType === this.dataInfo.searchTicketOkId){      
      this.statusTicket = this.dataInfo.ticketOk
      this.idTypeBackgrond = this.dataInfo.backgroundIdSearchOk
    }        


    else if(idType === this.dataInfo.searchTicketNotOkId){

      this.statusTicket = this.dataInfo.already
      this.idTypeBackgrond = this.dataInfo.backgroundIdSearchNotOk

      console.log(this.statusTicketUsedOn)
    } 
    else if(idType === this.dataInfo.searchTicket){

      this.statusTicket = this.dataInfo.already
      this.idTypeBackgrond = this.dataInfo.backgroundIdSearch

    } 
    
    else {
      this.idTypeBackgrond = this.dataInfo.backgroundIdRed
      console.log('Tipo de ticket desconhecido:', idType)
    }

    let self = this

    /*setTimeout(function(){ 
      self.idTypeBackgrond = self.dataInfo.backgroundIdNone
     }, 3000);*/
  }

}
