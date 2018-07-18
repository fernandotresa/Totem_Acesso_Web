import { Injectable } from '@angular/core';


@Injectable()
export class DataInfoProvider {
  
  areaId: number =  1
  backgroundIdGreen: number = 1
  backgroundIdRed: number = 2
  backgroundIdNone: number = 3
  backgroundIdSearch: number = 4
  
  exemptedId: string =  "0"
  halfId: string =  "1"
  fullId: string =  "2"
  alreadyId: string =  "3"
  ticketOldId: string =  "4"
  ticketNotRegisteredId: string =  "5"
  ticketNotSoleddId: string =  "6"

  searchTicketOkId: string =  "7"

  searchTicketNotOkId: string =  "8"

  exempted: string = "ISENTO"
  half: string = "MEIA"
  full: string = "INTEIRA"
  already: string = "Já utilizado"
  alreadyMsg: string = "10/05/2018 - 10:35 - Chapelaria"
  ticketOld: string = "Ingresso vencido"
  ticketOldMsg: string = "10/05/2018 - 10:35"
  ticketNotRegistered: string = "Ingresso não cadastrado"
  ticketNotRegisteredMsg: string = "Não existe esse número no estoque"
  ticketNotSolded: string = "Não vendido"
  ticketNotSoldedMsg: string = "Ingresso consta no estoque mas não foi vendido"


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
