import { Injectable } from '@angular/core';
import { ConfigurationService } from "ionic-configuration-service";

@Injectable()
export class DataInfoProvider {
  
  areaId: number =  1  
  totemId: number =  1
  addressServer: string = "http://localhost:8085"
  
  backgroundIdGreen: number = 1
  backgroundIdRed: number = 2
  backgroundIdNone: number = 3
  backgroundIdSearch: number = 4
  backgroundIdSearchOk: number = 5
  backgroundIdSearchNotOk: number = 6
  backgroundIdTicketRead: number = 7
    
  history: string = "Histórico do ingresso"
  historyUntilDay: string = "Até dia"
  historyUsedDay: string = "Usado dia"
  accessPoints: string = "Acesso aos pontos"

  already: string = "Já utilizado"
  alreadyMsg: string = "10/05/2018 - 10:35 - Chapelaria"
  ticketOld: string = "Ingresso vencido"
  ticketOldMsg: string = "10/05/2018 - 10:35"
  ticketNotRegistered: string = "Ingresso não cadastrado"
  ticketNotRegisteredMsg: string = "Não existe esse número no estoque"
  ticketNotSolded: string = "Não vendido"
  ticketNotSoldedMsg: string = "Ingresso consta mas não foi vendido"
  ticketOk: string = "Ingresso válido"  
  isLoading: string =  "Carregando"

  ticketNotAllowed: string = "Não permitido nessa área"
  welcomeMsg: string = "Seja bem vindo!"
  pleaseWait: string = "Favor aguarde"
  atention: string = "Atenção"   

  ticketReadDefault: string = "Ingresso lido: "   
  ticketRead: string = "Ingresso lido: "   
   
  usedDay: string = "Utilizado dia"   
    
  sucess: string = "Sucesso"
  erro: string = "Erro"
  noConfiguration: string = "Nenhuma configuraçao disponivel"  
  noResults: string = "Nenhum resultado"
  accessDenied: string = "Acesso negado"
  added: string = "Adicionado"  
  areYouSure: string = "Tem certeza disso?"        

  constructor(private configurationService: ConfigurationService) {

    console.log('ionViewDidLoad DataInfoProvider');   

    this.areaId =  this.configurationService.getValue<number>("idArea");
    this.totemId =  this.configurationService.getValue<number>("idTotem");
    this.addressServer =  this.configurationService.getValue<string>("addressServer");

    console.log('Data Info configurado:', this.areaId, this.totemId, this.addressServer)

  }  

  configureTotem(data){
    console.log(data)
  }


  

}
