 import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastController, AlertController } from '@ionic/angular';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonButton
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-descanso',
  templateUrl: './descanso.page.html',
  styleUrls: ['./descanso.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonButton
  ]
})
export class DescansoPage {
  descansoManha: string = '09:00';
  descansoTarde: string = '15:00';
  descansoNoite: string = '22:00';

  mensagem: string = '';

  constructor(
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.carregarDescanso();
  }

  async salvarDescanso() {
    localStorage.setItem('descansoManha', this.descansoManha);
    localStorage.setItem('descansoTarde', this.descansoTarde);
    localStorage.setItem('descansoNoite', this.descansoNoite);

    const toast = await this.toastController.create({
      message: 'Horários de descanso salvos com sucesso!',
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });

    await toast.present();
  }

  carregarDescanso() {
    this.descansoManha = localStorage.getItem('descansoManha') || '09:00';
    this.descansoTarde = localStorage.getItem('descansoTarde') || '15:00';
    this.descansoNoite = localStorage.getItem('descansoNoite') || '22:00';
  }

  async resetarDescanso() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: 'Deseja realmente resetar os horários?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Resetar',
          handler: () => {
            this.descansoManha = '09:00';
            this.descansoTarde = '15:00';
            this.descansoNoite = '22:00';

            localStorage.removeItem('descansoManha');
            localStorage.removeItem('descansoTarde');
            localStorage.removeItem('descansoNoite');
          }
        }
      ]
    });

    await alert.present();
  }
}