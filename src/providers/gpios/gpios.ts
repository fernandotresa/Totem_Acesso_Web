import { Injectable } from '@angular/core';
import { Socket } from 'ng-socket-io';
import { Observable } from 'rxjs/Observable';
import { Events } from 'ionic-angular';
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils'

@Injectable()
export class GpiosProvider{

  gpioPageMultiple: Observable<any>;
  gpioPageHistory: Observable<any>;
  gpioDecrementCounter: Observable<any>;

  objPageMultiple: any
  objPageHistory: any
  objGpioDecrementCounter: any

  timeOutGpio: Boolean = true;
  timeOut: number = 1000

  constructor(private socket: Socket, 
    public uiUtils: UiUtilsProvider,   
    public events: Events) {    

    this.startGPIOs()
  }

  ngOnDestroy(){
    this.objPageMultiple.unsubscribe()
    this.objPageMultiple.unsubscribe()
    this.objGpioDecrementCounter.unsubscribe()
  }

  showAlertTimeout(){
    this.uiUtils.showToast("Favor aguarde o tempo de espera")
  }

  startGPIOs(){ 
    console.log('Iniciando gpios', new Date())    
    
    this.gpioPageMultiple = this.getGpioPageMultiple()
    this.gpioPageHistory = this.getGpioPageHistory()
    this.gpioDecrementCounter = this.getGpioDecrementCounter()    

    this.startGpioPageMultiple()
    this.startGpioPageHistory()
    this.startGpioDecrementCounter()    
  }

  startGpioPageMultiple(){
    let self = this
    this.objPageMultiple = this.gpioPageMultiple.subscribe(data => {
      
      if(this.timeOutGpio){

        console.log("GPIO4 - Evento recebido", new Date())

        this.timeOutGpio = false
        this.events.publish('socket:pageMultiple', data);            

        setTimeout(function(){ 

          console.log("Resetando timeout", new Date())

          self.timeOutGpio = true;
         }, self.timeOut);

      } else {
          this.showAlertTimeout()
      }        
    })
  }

  startGpioPageHistory(){
    let self = this
    this.objPageMultiple = this.gpioPageHistory.subscribe(data => {
      console.log(data)

      if(this.timeOutGpio){

        console.log("GPIO5 - Evento recebido", new Date())

        this.timeOutGpio = false
        this.events.publish('socket:pageHistory', data);   
        
        setTimeout(function(){ 
          console.log("Resetando timeout", new Date())
          self.timeOutGpio = true;
         }, self.timeOut);

      } else {
          this.showAlertTimeout()
      }     
    })
  }

  startGpioDecrementCounter(){
    let self = this
    this.objGpioDecrementCounter = this.gpioDecrementCounter.subscribe(data => {

      if(this.timeOutGpio){
        console.log("GPIO6 - Evento recebido", new Date())

        this.events.publish('socket:decrementCounter', data);    
  
        setTimeout(function(){ 
          console.log("Resetando timeout", new Date())
          self.timeOutGpio = true;
         }, self.timeOut);

      } else {
          this.showAlertTimeout()
      }     
    })
  }

  getGpioPageMultiple() {
    let observable = new Observable(observer => {
      this.socket.on('gpioPageMultiple', (data) => {
        observer.next(data);
      });
    })
    return observable;
  }

  getGpioPageHistory() {
    let observable = new Observable(observer => {
      this.socket.on('gpioPageHistory', (data) => {
        observer.next(data);
      });
    })
    return observable;
  }

  getGpioDecrementCounter() {
    let observable = new Observable(observer => {
      this.socket.on('gpioDecrementCounter', (data) => {
        observer.next(data);
      });
    })
    return observable;
  }



}
