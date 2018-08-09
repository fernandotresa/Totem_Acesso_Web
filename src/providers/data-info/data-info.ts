import { Injectable } from '@angular/core';
import { ConfigurationService } from "ionic-configuration-service";
import { Events } from 'ionic-angular';

@Injectable()
export class DataInfoProvider {
  
  areaId: number =  0  
  portaId: number =  0  
  totemId: number =  0
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

  titleGeneral: string = "Carregando"

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
  timeAccessOver: string = "Tempo de acesso vencido"
  accessCountLimitPassed: string = "Qtd. de acessos máximo utilizados"
  added: string = "Adicionado"  
  areYouSure: string = "Tem certeza disso?"        

  constructor(private configurationService: ConfigurationService, public events: Events) {        
    this.addressServer =  this.configurationService.getValue<string>("addressServer");

    console.log('Endereço do servidor:', this.addressServer)
  }  

  configureTotem(data){    

    let self = this

      data.success.forEach(element => {
        self.titleGeneral = element.nome_ponto_acesso
        self.totemId = element.fk_id_ponto_acesso
        self.areaId = element.fk_id_area_acesso
        self.portaId = element.id_porta_acesso        
      });          

    this.events.publish('totem:updated', data);    
      
  }


  

}
