import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { pageFadeAnimation, listStagger } from '../animations';
import { IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonDatetime, IonHeader, IonIcon, IonItem, IonLabel, IonTextarea, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-agenda-corridas',
  templateUrl: './agenda-corridas.page.html',
  styleUrls: ['./agenda-corridas.page.scss'],
  standalone: true,
  animations: [pageFadeAnimation, listStagger],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, IonLabel, IonDatetime, IonTextarea, IonIcon, CommonModule, FormsModule]
})
export class AgendaCorridasPage implements OnInit {
  selectedDate?: string;
  note = '';
  savedMessage = '';
  appointments: Array<{ date: string; note: string }> = [];

  constructor() { }

  ngOnInit() {
    const stored = localStorage.getItem('agendaCorrida');
    if (stored) {
      this.appointments = JSON.parse(stored) || [];
      if (this.appointments.length) {
        this.selectedDate = this.appointments[0].date;
        this.note = this.appointments[0].note || '';
      }
    }
  }

  saveRun() {
    if (!this.selectedDate) {
      this.savedMessage = 'Escolha uma data antes de salvar.';
      return;
    }

    const appointment = {
      date: this.selectedDate,
      note: this.note || ''
    };

    this.appointments = [appointment, ...this.appointments];
    localStorage.setItem('agendaCorrida', JSON.stringify(this.appointments));
    this.savedMessage = 'Agendamento salvo com sucesso!';
    this.note = '';
  }
}
