import { Component, ViewChild } from '@angular/core';
import { Platform, Nav, MenuController } from 'ionic-angular';

import { HomePage } from '../pages/home/home';
import { QrcodePage } from '../pages/qrcode/qrcode';
import { HistoryPage } from '../pages/history/history';
import { SettingsPage } from '../pages/settings/settings';
import { MultiplePage } from '../pages/multiple/multiple';

import { SideMenuSettings } from './../shared/side-menu-content/models/side-menu-settings';
import { SideMenuOption } from './../shared/side-menu-content/models/side-menu-option';
import { SideMenuContentComponent } from './../shared/side-menu-content/side-menu-content.component';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  @ViewChild(Nav) nav: Nav;
  @ViewChild(SideMenuContentComponent) sideMenu: SideMenuContentComponent;

  public options: Array<SideMenuOption>;

	public sideMenuSettings: SideMenuSettings = {
		accordionMode: true,
		showSelectedOption: true,
		selectedOptionClass: 'active-side-menu-option'		
  };

  //rootPage:any = SettingsPage;
  rootPage:any = HomePage;
  


  constructor(platform: Platform, 
    private menuCtrl: MenuController) {

    platform.ready().then(() => {
      
      this.initializeOptions()
    });
  }

  private initializeOptions(): void {    
  
      this.options = new Array<SideMenuOption>();
      
      this.options.push({
        iconName: 'home',
        displayText: 'Início',			
        custom: {
          isHome: true
        }			
      });								
      
      this.options.push({
        iconName: 'md-person-add',
        displayText: 'Múltiplo',			
        component: MultiplePage
      });	
  
      this.options.push({
        iconName: 'search',
        displayText: 'Histórico',
        component: HistoryPage
      });       
    
      this.options.push({
        iconName: 'md-qr-scanner',
        displayText: 'QR Code',
        component: QrcodePage,  
      });	
  
      this.options.push({
        iconName: 'card',
        displayText: 'Configurações',
        component: SettingsPage,					
      });	
    
      this.options.push({
        iconName: 'log-out',
        displayText: 'Sair',
        custom: {
          isLogout: true
        }			
      });
    }
    
    public collapseMenuOptions(): void {
      this.sideMenu.collapseAllOptions();
    }

    public onOptionSelected(option: SideMenuOption): void {
      this.menuCtrl.close().then(() => {
  
        if (option.custom && option.custom.isLogin) {
          console.log('You\'ve clicked the login option!');
  
        } else if (option.custom && option.custom.isLogout) {
            this.nav.setRoot('LoginPage', { autoLogin: false })
  
        } else if (option.custom && option.custom.isHome) {
          this.nav.setRoot(HomePage)					
  
        } 
        else if (option.custom && option.custom.isExternalLink) {
          let url = option.custom.externalUrl;
          window.open(url, '_blank');
  
        } else {
          
          const params = option.custom && option.custom.param;
          this.nav.push(option.component, params);
            
        }
      });
    }
  
  
}

