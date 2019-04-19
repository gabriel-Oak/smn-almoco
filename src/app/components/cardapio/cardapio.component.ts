import { Component, OnInit } from '@angular/core';
import { CardapioService } from '../../services/cardapio.service';
import { AuthServiceService } from './../../services/auth-service.service';
import { TrocaService } from './../../services/troca.service';
import { MatSnackBar } from '@angular/material';
import { ProgressService } from './../../services/progress.service';

@Component({
  selector: 'app-cardapio',
  templateUrl: './cardapio.component.html',
  styleUrls: ['./cardapio.component.css']
})
export class CardapioComponent implements OnInit {

  constructor(
  	private cardServ: CardapioService,
  	private authServ: AuthServiceService,
  	private trocaServ: TrocaService,
  	private snack: MatSnackBar,
    private progress: ProgressService
  	) { }

  public cardapios: any = {};
  private dias: any = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sabado"];
  private usuario: any = this.authServ.getUser();

  ngOnInit() {
    this.progress.onProgress();
  	this.listar();
  }

  listar(){
  	let retorno: any;
  	retorno = this.cardServ.listar();
  	retorno.subscribe( res => {
  			this.cardapios = res;
        console.log(this.cardapios[0].data);
  			this.cardapios = this.cardapios.map(cardapio => ({
  				...cardapio,
  				nome_dia_da_semana: this.dias[new Date(cardapio.data).getDay()],
  				dia_da_semana: new Date(cardapio.data).getDay(),
  				data: new Date(cardapio.data).toLocaleDateString(),
  				escolha: cardapio.pratoPrincipal,
  				check: false
  			})).sort((a, b) => {
		  				if(a.dia_da_semana > b.dia_da_semana) {
		  					return 1;
		  				}
		  				if(a.dia_da_semana < b.dia_da_semana) {
		  					return -1;
		  				}
		  				return 0;
  			});
        console.log(this.cardapios[0].data);
        this.progress.offProgress();
  		},
  		erro => {
  			this.snack.open('Erro encontrado ' + erro, 'Fechar', { duration: 3000 });
        this.progress.offProgress();
		 });
  }

  confirma(cardapio){
    this.progress.onProgress();

    let user:any = {
      user: this.usuario._id
    };
  	let retorno: any;
    let retornoTrocas:any = this.trocaServ.listar(user);
    console.log('chamada da função')
    
    retornoTrocas.subscribe(res => {
      console.log('res '+ res);

      if(cardapio.check == true){

        let troca: any = {
          user: this.usuario._id,
          cardapio: cardapio._id,
          pratoPrincipal: "desistiu"
        };

        retorno = this.trocaServ.trocar(troca, res);


      } else if( cardapio.escolha != cardapio.pratoPrincipal){
        
        let troca: any = {
          user: this.usuario._id,
          cardapio: cardapio._id,
          pratoPrincipal: cardapio.escolha
        }; 

        retorno = this.trocaServ.trocar(troca, res);

      } else { 
        let troca: any = {
          user: this.usuario._id,
          cardapio: cardapio._id,
          pratoPrincipal: cardapio.pratoPrincipal
        }; 

        retorno = this.trocaServ.trocar(troca, res);          
      }

      retorno.subscribe(res => {
        console.log(cardapio.nome_dia_da_semana + ' atualisado');
        this.snack.open('Sucesso ao atualizar ' + cardapio.nome_dia_da_semana, 'Fechar', { duration: 3000 });
        this.progress.offProgress();
      },
      erro => {
        console.log(erro);
        if(erro.status == 201){
          this.snack.open('Sucesso ao atualizar ' + cardapio.nome_dia_da_semana, 'Fechar', { duration: 3000 });
          this.progress.offProgress();   
        } else {
          this.snack.open('Erro ao atualizar ' + cardapio.nome_dia_da_semana, 'Fechar', { duration: 3000 });
          this.progress.offProgress();
        }    
      });
    }, erro => {
        console.log('erro no get trocas ' + erro);
        this.progress.offProgress();
    });     

  	console.log(this.cardapios);
  	
  }
}
