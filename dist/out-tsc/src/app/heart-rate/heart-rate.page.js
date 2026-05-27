import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';
let HeartRatePage = class HeartRatePage {
    constructor() {
        this.heartRate = null;
        this.lastSync = 'Nunca sincronizado';
        this.syncing = false;
        this.smartwatchConnected = false;
    }
    ngOnInit() {
        this.heartRate = null;
    }
    connectSmartwatch() {
        this.smartwatchConnected = true;
        this.lastSync = 'Pronto para sincronizar';
    }
    syncHeartRate() {
        if (!this.smartwatchConnected) {
            return;
        }
        this.syncing = true;
        setTimeout(() => {
            this.heartRate = Math.floor(Math.random() * 40) + 60;
            this.lastSync = new Date().toLocaleString();
            this.syncing = false;
        }, 1200);
    }
};
HeartRatePage = __decorate([
    Component({
        selector: 'app-heart-rate',
        templateUrl: './heart-rate.page.html',
        styleUrls: ['./heart-rate.page.scss'],
        standalone: true,
        imports: [CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent]
    })
], HeartRatePage);
export { HeartRatePage };
//# sourceMappingURL=heart-rate.page.js.map