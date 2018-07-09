import { Injectable } from '@angular/core';


@Injectable()
export class DataInfoProvider {
  
  areaId: number =  1
  welcomeMsg: string = "Seja bem vindo!"
  pleaseWait: string = "Favor aguarde"
  atention: string = "Atenção"    
  sucess: string = "Sucesso"
  erro: string = "Erro"
  noConfiguration: string = "Nenhuma configuraçao disponivel"
  notAvailable: string = "Não acessível do browser"
  accessDenied: string = "Acesso negado"
  added: string = "Adicionado"
  
  areYouSure: string = "Tem certeza disso?"  
  slideLeft: string = "Arraste para esquerda para modificar"  

  notSupported: string = "Não suportado nesta plataforma"
  syncConfigurations: string = "Sincronizando configuraçoes"
  syncDatabase: string = "Sincronizando banco de dados"

  constructor() {
        
  }

  getAreaId(){
    return this.areaId
  }
  

}
