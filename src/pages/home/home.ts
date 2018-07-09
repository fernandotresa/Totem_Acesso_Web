import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { HttpdProvider } from '../../providers/httpd/httpd';
import { DatabaseProvider } from '../../providers/database/database';
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils'
import { Observable } from 'rxjs/Observable';
import { FormControl } from '@angular/forms';
import 'rxjs/add/operator/debounceTime';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  configs: Observable<any>;
  areaInfo: Observable<any>;
  ticket: Observable<any>;

  title: string = 'Carregando'
  subtitle: string = 'Carregando'
  counter: string = 'Carregando'
  areaId: string = '1'
  updatedInfo: Boolean = false
  updating: Boolean = false

  searchControl: FormControl;
  searchTerm: string = '';
  searching: any = false;
  
  constructor(public navCtrl: NavController,
    public uiUtils: UiUtilsProvider, 
    public dataInfo: DataInfoProvider,
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

  ionViewDidLoad() {
    console.log('ionViewDidLoad AdminPage');   

    this.updatedInfo = this.navParams.get('updatedInfo')

    if(this.updatedInfo == undefined)
        this.updatedInfo = false

      console.log('atualizaçao ? ', this.updatedInfo)
      
    if(this.updatedInfo)
        this.updateInfo()

    else   
      this.loadConfig()        

  }

  loadConfig(){   
    console.log('Carregando configuraçoes')     
    
    this.configs = this.db.getConfigArea()
    let self = this

    this.configs.subscribe(data => {            

      data.forEach(element => {
        console.log(element)
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

      var resultArray = Object.keys(data).map(function(personNamedIndex){
        let person = data[personNamedIndex];
        // do something with person
        console.log(person[0])
        
        self.counter = person[0].lotacao_area_acesso
    });
    
   
         
    })
  }

  setFilteredItems(){

    console.log(this.searchTerm)       

    if(this.searchTerm.length == 8){

      this.http.checkTicket(this.searchTerm).subscribe(data => {
        console.log(data)
      })

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
    .subscribe(data => {

      console.log(data)

      this.updating = false
      this.updatedInfo = true

    })      

  }

}
