import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonDatetime, IonHeader, IonIcon, IonItem, IonLabel, IonTextarea, IonTitle, IonToolbar } from '@ionic/angular/standalone';
let AgendaCorridasPage = class AgendaCorridasPage {
    constructor() {
        this.note = '';
        this.savedMessage = '';
        this.appointments = [];
    }
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
};
AgendaCorridasPage = __decorate([
    Component({
        selector: 'app-agenda-corridas',
        templateUrl: './agenda-corridas.page.html',
        styleUrls: ['./agenda-corridas.page.scss'],
        standalone: true,
        imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, IonLabel, IonDatetime, IonTextarea, IonIcon, CommonModule, FormsModule]
    })
], AgendaCorridasPage);
export { AgendaCorridasPage };
//# sourceMappingURL=agenda-corridas.page.js.map