import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { HttpdProvider } from '../../providers/httpd/httpd';
import { DatabaseProvider } from '../../providers/database/database';
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils'
import moment from 'moment';
import 'moment/locale/pt-br';

@IonicPage()
@Component({
  selector: 'page-qrcode',
  templateUrl: 'qrcode.html',
})
export class QrcodePage {

  constructor(public navCtrl: NavController, 
    private barcodeScanner: BarcodeScanner,
    public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad QrcodePage');

    this.startInterface()
  }

  startInterface(){
   // this.scan()
  }

  scan() {
    //this.selectedProduct = {};
    
    this.barcodeScanner.scan().then((barcodeData) => {
      console.log(barcodeData)
    }, (err) => {
      console.log(err)
    });
  }

}
