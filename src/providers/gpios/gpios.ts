import { Injectable } from '@angular/core';
import { Socket } from 'ng-socket-io';
import { Observable } from 'rxjs/Observable';
import { Events } from 'ionic-angular';

@Injectable()
export class GpiosProvider{

  gpio2: Observable<any>;
  gpio3: Observable<any>;
  gpio4: Observable<any>;

  objGpio2: any
  objGpio3: any
  objGpio4: any

  timeOutGpio: Boolean = true;

  constructor(private socket: Socket,    
    public events: Events) {

    console.log('Hello GpiosProvider Provider');

    this.startGPIOs()
  }

  ngOnDestroy(){
    // prevent memory leak when component destroyed
    this.objGpio2.unsubscribe()
    this.objGpio3.unsubscribe()
    this.objGpio4.unsubscribe()
  }

  startGPIOs(){ 
    
    console.log('startGpios')
    
    this.gpio2 = this.getGpio2()
    this.gpio3 = this.getGpio3()
    this.gpio4 = this.getGpio4()

    console.log('Iniciando gpios', new Date())

    this.objGpio2 = this.gpio2.subscribe(data => {
      
      if(this.timeOutGpio){
        console.log("GPIO2 - Evento recebido")
        this.timeOutGpio = false
        this.events.publish('socket:pageMultiple', data);            

        setTimeout(function(){ 
          this.timeOutGpio = true;
         }, 3000);
      }        
    })

    this.objGpio3 =this.gpio3.subscribe(data => {
      if(! this.timeOutGpio){

        console.log("GPIO3 - Evento recebido")
        this.timeOutGpio = false
        this.events.publish('socket:pageHistory', data);   
        
        setTimeout(function(){ 
          this.timeOutGpio = true;
         }, 3000);
      }      
    })

    this.objGpio4 = this.gpio4.subscribe(data => {
      console.log("GPIO4 - Evento recebido")
      this.events.publish('socket:decrementCounter', data);    

      setTimeout(function(){ 
        this.timeOutGpio = true;
       }, 3000);
    })
  }

  getGpio2() {
    let observable = new Observable(observer => {
      this.socket.on('gpio2', (data) => {
        observer.next(data);
      });
    })
    return observable;
  }

  getGpio3() {
    let observable = new Observable(observer => {
      this.socket.on('gpio3', (data) => {
        observer.next(data);
      });
    })
    return observable;
  }

  getGpio4() {
    let observable = new Observable(observer => {
      this.socket.on('gpio4', (data) => {
        observer.next(data);
      });
    })
    return observable;
  }



}
