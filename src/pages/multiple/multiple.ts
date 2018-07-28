import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpdProvider } from '../../providers/httpd/httpd';
import { DatabaseProvider } from '../../providers/database/database';
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils'
import { Observable } from 'rxjs/Observable';

@IonicPage()
@Component({
  selector: 'page-multiple',
  templateUrl: 'multiple.html',
})
export class MultiplePage {

  searchTicket: string = '19270001';
  searchTicketEnd: string = '19270010';
  allTickets: Observable<any>;  

  constructor(public dataInfo: DataInfoProvider,
    public navCtrl: NavController,
    public uiUtils: UiUtilsProvider,     
    public db: DatabaseProvider,
    public navParams: NavParams,  
    public http: HttpdProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MultiplePage');
  }

  searchMultipleTickets(){
    let self = this
  
    this.http.checkMultipleTickets(this.searchTicket, this.searchTicketEnd)
      .subscribe( data => {        
        self.searchMultipleCallback(data)
    })       
  }

  searchMultipleCallback(ticket){    

    this.allTickets = ticket          

    ticket.success.forEach(element => {
      this.searchOneTicket(element)
    });
  }

  searchOneTicket(ticket){  
    console.log('Procurando um ingresso:', ticket)

      if(ticket.data_log_venda == undefined)
        this.ticketNotSold(ticket)
      else {
        this.ticketSoldCheck(ticket)  
    }
  }

  ticketNotSold(ticket){  
    console.log('Ticket não vendido:', ticket)
  }

  ticketSoldCheck(ticket){
    console.log('Ticket vendido', ticket)
  }

}
