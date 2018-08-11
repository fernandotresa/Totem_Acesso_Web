import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule, APP_INITIALIZER } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { MultiplePageModule } from '../pages/multiple/multiple.module';
import { HttpdProvider } from '../providers/httpd/httpd';
import { DataInfoProvider } from '../providers/data-info/data-info';
import { DatabaseProvider } from '../providers/database/database';
import { SmartAudioProvider } from '../providers/smart-audio/smart-audio';
import { NativeStorage } from '@ionic-native/native-storage';
import { UiUtilsProvider } from '../providers/ui-utils/ui-utils';
import { HttpClientModule } from '@angular/common/http';

import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { ConfigurationService } from "ionic-configuration-service";
import { SocketIoModule, SocketIoConfig } from 'ng-socket-io';
import { MultiplePage } from '../pages/multiple/multiple';

export function loadConfiguration(configurationService: ConfigurationService): () => Promise<void> {
  return () => configurationService.load("assets/configs/document.json");
}

const config: SocketIoConfig = { url: 'http://raspberrypi:8085', options: {} };

export const firebaseConfig = {
  apiKey: "AIzaSyDhZ2TQlXhn6x-E3qWBUQqd-GQ8D2uw69o",
  authDomain: "totem-de-acesso.firebaseapp.com",
  databaseURL: "https://totem-de-acesso.firebaseio.com",
  projectId: "totem-de-acesso",
  storageBucket: "totem-de-acesso.appspot.com",
  messagingSenderId: "315325572094"
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
    IonicModule.forRoot(MyApp, {}, {
      links: [
        { component: HomePage, name: 'Home'},
        { component: MultiplePage, name: 'Multiple'}        
      ]}),

    SocketIoModule.forRoot(config)
  ],
  exports: [
    MultiplePageModule
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
    AngularFireModule,
    ConfigurationService,
    {
      provide: APP_INITIALIZER,
      useFactory: loadConfiguration,
      deps: [ConfigurationService],
      multi: true
    }
  ]
})
export class AppModule {}
