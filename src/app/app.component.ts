import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd, NavigationStart, NavigationCancel, NavigationError } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { UiService } from './services/ui.service';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';
import { routeAnimation } from './animations';
import { IonApp, IonRouterOutlet, IonToolbar, IonSplitPane, IonHeader, IonTitle, IonList, IonContent, IonItem, IonIcon, IonLabel, IonMenuToggle, IonMenu, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { home, people, cart, settings, calendar, heart, fitness, musicalNotes, moon } from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  animations: [routeAnimation],
  imports: [CommonModule, RouterModule, IonContent, IonList, IonRouterOutlet, IonApp, IonSplitPane, IonMenu, IonHeader, IonToolbar, IonTitle, IonMenuToggle, IonItem, IonIcon, IonLabel, IonButton],
})
export class AppComponent {
  public appPages = [
    { title: 'Início', url: '/home', icon: 'home' },
    { title: 'Agenda', url: '/agenda-corridas', icon: 'calendar' },
    { title: 'Saúde', url: '/health', icon: 'fitness' },
    { title: 'Amigos', url: '/friends', icon: 'people' },
    { title: 'Feed Social', url: '/social-feed', icon: 'musical-notes' },
  ];

  public showAppMenu = true;
  private hiddenRoutes = ['/login', '/signup', '/streaming-callback'];

  private loadingEl: HTMLIonLoadingElement | null = null;

  constructor(private router: Router, private loadingCtrl: LoadingController, private authService: AuthService, private uiService: UiService) {
    addIcons({ home, people, cart, settings, calendar, heart, fitness, musicalNotes, moon });

    this.router.events.subscribe(async (event) => {
      if (event instanceof NavigationStart) {
        // show loading only when navigating to login (avoid blocking other pages)
        try {
          const targetUrl = (event.url || '').split('?')[0].split('#')[0];
          if ((targetUrl === '/login' || targetUrl.startsWith('/login')) && !this.loadingEl) {
            console.debug('[AppComponent] presenting global loader for', targetUrl);
            this.loadingEl = await this.loadingCtrl.create({
              spinner: 'crescent',
              translucent: true,
              cssClass: 'app-global-loader'
            });
            try {
              await this.loadingEl.present();
              console.debug('[AppComponent] loader presented');
            } catch (e) {
              console.warn('[AppComponent] failed to present loader', e);
            }
          }
        } catch (e) {
          // ignore
        }
      }

      if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
        // hide loading
        try {
          if (this.loadingEl) {
            // dismiss safely
            try {
              console.debug('[AppComponent] dismissing global loader');
              await this.loadingEl.dismiss();
              console.debug('[AppComponent] loader dismissed');
            } catch (dismissErr) {
              console.warn('[AppComponent] error dismissing loader', dismissErr);
            }
            this.loadingEl = null;
          }
        } catch (e) {
          console.warn('[AppComponent] error while clearing loader', e);
          this.loadingEl = null;
        }

        if (event instanceof NavigationEnd) {
          const url = event.urlAfterRedirects.split('?')[0].split('#')[0];
          // Defer change to avoid ExpressionChangedAfterItHasBeenCheckedError
          setTimeout(() => {
            this.showAppMenu = !this.hiddenRoutes.includes(url);
          });
        }
      }
    });
  }

  async ngOnInit() {
    try {
      await this.authService.handleRedirectResult();
      // Initialize auth-related subscriptions that must run inside Angular injection context
      try { this.authService.init(); } catch (e) { console.warn('AuthService.init() failed', e); }
    } catch (e) {
      // ignore
    }
    // listen for requests to dismiss the global loader (e.g., logout fallback)
    this.uiService.onDismissLoader().subscribe(() => {
      (async () => {
        try {
          if (this.loadingEl) {
            try {
              console.debug('[AppComponent] uiService request - dismissing global loader');
              await this.loadingEl.dismiss();
              console.debug('[AppComponent] loader dismissed by uiService');
            } catch (dismissErr) {
              console.warn('[AppComponent] uiService error dismissing loader', dismissErr);
            }
            this.loadingEl = null;
          }
        } catch (e) {
          // ignore
        }
      })();
    });
  }

  navigateTo(route: string) {
    this.router.navigateByUrl(route);
  }
}
