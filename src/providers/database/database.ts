import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';

@Injectable()
export class DatabaseProvider {
  
  client: string;
  db: any
  config: AngularFireList<any>;
  totemOnline: AngularFireList<any>;
  
  constructor(afDatabase: AngularFireDatabase) {      
    
    this.db  = afDatabase  
    this.client = 'totemDev'            
    this.config = afDatabase.list('/config/' + this.client + '/');
    this.totemOnline = afDatabase.list('/online/' + this.client + '/');
    
  }  

  addConfigArea(valor){
    return this.config.push({areaInfo: valor});
  }

  getConfigArea(){
    return this.config.valueChanges();
  }

  clearConfigs(){
    return this.config.remove()
  } 

  updateCounterArea(idArea, value_){
    return this.config.update(idArea, {total: value_});
  }


}