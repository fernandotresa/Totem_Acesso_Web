import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ListaBrancaProvider } from '../../providers/lista-branca/lista-branca'
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils'
import { Storage } from '@ionic/storage';
import { MemoryListPage } from '../../pages/memory-list/memory-list';
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { Events } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {ticket    

  ativaListaBranca: Boolean = false
  ativaRedeOnline: Boolean = false
  ativaHotspot: Boolean = false
  ativaSincronizacaoUsb: Boolean = false

  constructor(public navCtrl: NavController, 
    public listaBranca: ListaBrancaProvider,
    public uiUtils: UiUtilsProvider,     
    public dataInfo: DataInfoProvider,
    public storage: Storage,
    public events: Events,
    public navParams: NavParams) {
  }

  ionViewDidLoad() {
    
    this.events.subscribe('listaBrancaConfig', () => {
      this.listaBrancaConfigIsOk()
    });
  }

  listaBrancaConfigIsOk(){
    this.ativaListaBranca = this.dataInfo.ativaListaBranca
    this.ativaRedeOnline = this.dataInfo.ativaRedeOnline
    this.ativaHotspot = this.dataInfo.ativaHotspot
    this.ativaSincronizacaoUsb = this.dataInfo.ativaSincronizacaoUsb
  }

  saveConfiguration(){
      this.storage.set('ativaListaBranca', this.ativaListaBranca)
      this.storage.set('ativaRedeOnline', this.ativaRedeOnline)
      this.storage.set('ativaHotspot', this.ativaHotspot)
      this.storage.set('ativaSincronizacaoUsb', this.ativaSincronizacaoUsb)

      this.dataInfo.ativaListaBranca = this.ativaListaBranca
      this.dataInfo.ativaRedeOnline = this.ativaRedeOnline
      this.dataInfo.ativaHotspot = this.ativaHotspot
      this.dataInfo.ativaSincronizacaoUsb = this.ativaSincronizacaoUsb

      this.uiUtils.showAlert('Sucesso', 'Configurações gravadas com sucesso')
      .present()
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
    this.navCtrl.push(MemoryListPage)
    
  }

}
