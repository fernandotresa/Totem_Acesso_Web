import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ListaBrancaProvider } from '../../providers/lista-branca/lista-branca'
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils'
import { Storage } from '@ionic/storage';


@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  ativaListaBranca: Boolean = false
  ativaRedeOnline: Boolean = false
  ativaHotspot: Boolean = false
  ativaSincronizacaoUsb: Boolean = false

  constructor(public navCtrl: NavController, 
    public listaBranca: ListaBrancaProvider,
    public uiUtils: UiUtilsProvider,     
    public storage: Storage,
    public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
  }

  saveConfiguration(){
      this.storage.set('ativaListaBranca', this.ativaListaBranca)
      this.storage.set('ativaRedeOnline', this.ativaRedeOnline)
      this.storage.set('ativaHotspot', this.ativaHotspot)
      this.storage.set('ativaSincronizacaoUsb', this.ativaSincronizacaoUsb)

      this.uiUtils.showAlert('Sucesso', 'Configurações gravadas com sucesso')
  }

  unselectAll(mode: string){

    if(mode === 'ativaListaBranca'){      

      this.ativaRedeOnline = false
      this.ativaHotspot = false
      this.ativaSincronizacaoUsb = false  
    }

    else if(mode === 'ativaRedeOnline'){      

      this.ativaListaBranca = false
      this.ativaHotspot = false
      this.ativaSincronizacaoUsb = false  
    }

    else if(mode === 'ativaHotspot'){      

      this.ativaListaBranca = false
      this.ativaRedeOnline = false
      this.ativaSincronizacaoUsb = false  
    }

    else {
      this.ativaListaBranca = false
      this.ativaRedeOnline = false
      this.ativaHotspot = false      
    }
    
    
  }

  startMemoryList(){
    this.listaBranca.startInterface()
    this.uiUtils.showToast('Atualizado com sucesso')
  }


  getMemoryList(){
    this.listaBranca.getListBrancaStorage()
    .then( data => {

      console.log(data)
    })
    
  }

}
