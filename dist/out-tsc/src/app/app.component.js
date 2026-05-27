import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { IonApp, IonRouterOutlet, IonToolbar, IonSplitPane, IonHeader, IonTitle, IonList, IonContent, IonItem, IonIcon, IonLabel, IonMenuToggle, IonMenu, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { home, people, cart, settings, calendar, heart, fitness, musicalNotes } from 'ionicons/icons';
let AppComponent = class AppComponent {
    constructor(router) {
        this.router = router;
        this.appPages = [
            { title: 'Início', url: '/home', icon: 'home' },
            { title: 'Agenda', url: '/agenda-corridas', icon: 'calendar' },
            { title: 'Saúde', url: '/health', icon: 'fitness' },
            { title: 'Amigos', url: '/friends', icon: 'people' },
            { title: 'Feed Social', url: '/social-feed', icon: 'musical-notes' },
        ];
        this.showAppMenu = true;
        this.hiddenRoutes = ['/login', '/signup', '/streaming-callback'];
        addIcons({ home, people, cart, settings, calendar, heart, fitness, musicalNotes });
        this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(event => {
            const url = event.urlAfterRedirects.split('?')[0].split('#')[0];
            this.showAppMenu = !this.hiddenRoutes.includes(url);
        });
    }
    navigateTo(route) {
        this.router.navigateByUrl(route);
    }
};
AppComponent = __decorate([
    Component({
        selector: 'app-root',
        templateUrl: 'app.component.html',
        styleUrls: ['app.component.scss'],
        imports: [CommonModule, RouterModule, IonContent, IonList, IonRouterOutlet, IonApp, IonSplitPane, IonMenu, IonHeader, IonToolbar, IonTitle, IonMenuToggle, IonItem, IonIcon, IonLabel, IonButton],
    })
], AppComponent);
export { AppComponent };
//# sourceMappingURL=app.component.js.map