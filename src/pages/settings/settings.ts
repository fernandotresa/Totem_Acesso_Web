import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpdProvider } from '../../providers/httpd/httpd';
import { Observable } from 'rxjs/Observable';
import { FormControl } from '@angular/forms';
import 'rxjs/add/operator/debounceTime';
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils'
import { DatabaseProvider } from '../../providers/database/database';
import { HomePage } from '../../pages/home/home';

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  allAreas: Observable<any>;
  title: string;
  searchTerm: string = '';
  searching: any = false;
  searchControl: FormControl;

  constructor(public navCtrl: NavController, 
    public uiUtils: UiUtilsProvider, 
    public db: DatabaseProvider, 
    public navParams: NavParams,
    public http: HttpdProvider) {

      this.searchControl = new FormControl();
      this.showSettings()
  }

  showSettings(){
    this.allAreas = this.http.getAreas()

    this.allAreas.subscribe( data => {
      console.log(data)
    })
  }

  selectArea(area: any){
    let self = this
    console.log('Area selecionada:',area.id_area_acesso)
    
    this.db.clearConfigs().then(function(){

      self.db.addConfigArea(area).then(function(){

        self.uiUtils.showToast('Sucesso')
        self.navCtrl.push(HomePage)

      })
    })
  }

  
}
