import { Injectable } from '@angular/core';
import { HttpdProvider } from '../../providers/httpd/httpd';
import { Storage } from '@ionic/storage';

@Injectable()
export class ListaBrancaProvider {

  constructor(
    public http: HttpdProvider, 
    public storage: Storage) {    

  }

  startInterface(){

    console.log('Iniciando lista branca')

    this.http.getListaBranca()
    .subscribe(data => {

      this.getListaBrancaCallback(data)
    })
  }

  getListaBrancaCallback(data){

    let lista = []
    let listaEstoque = []

    data.success.forEach(element => {    
      
      if(listaEstoque.indexOf(element.id_estoque_utilizavel) < 0){

        console.log('Incluindo bilhete', element)

        listaEstoque.push(element.id_estoque_utilizavel)
        lista.push(element)      

      }
    });

    console.log('Nova lista: ', lista)
    this.storage.set('listabranca', lista)    
  }

  getListBrancaStorage(){

    return new Promise<any>((resolve) => { 

      this.storage.get('listabranca')
      .then(data => {
                  
        resolve(data)
      })
    });
    
    
  }

}
