import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';


import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';

import { HttpdProvider } from '../providers/httpd/httpd';
import { DataInfoProvider } from '../providers/data-info/data-info';
import { DatabaseProvider } from '../providers/database/database';
import { SmartAudioProvider } from '../providers/smart-audio/smart-audio';
import { NativeStorage } from '@ionic-native/native-storage';
import { UiUtilsProvider } from '../providers/ui-utils/ui-utils';
import { HttpClientModule } from '@angular/common/http';

import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';

export const firebaseConfig = {
  apiKey: "AIzaSyDNfr1IficMBxfoc9WSixDYz2b15ow8_fY",
  authDomain: "totem-beba5.firebaseapp.com",
  databaseURL: "https://totem-beba5.firebaseio.com",
  projectId: "totem-beba5",
  storageBucket: "totem-beba5.appspot.com",
  messagingSenderId: "13160513083"

};

@NgModule({
  declarations: [
    MyApp,
    HomePage        
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage
    
  ],
  providers: [        
    NativeStorage,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    HttpdProvider,
    DataInfoProvider,
    DatabaseProvider,
    SmartAudioProvider,
    UiUtilsProvider,
    AngularFireModule
  ]
})
export class AppModule {}
