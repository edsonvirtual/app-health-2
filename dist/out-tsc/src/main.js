import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { addIcons } from 'ionicons';
import { home, people, cart, settings, personCircle, grid, list, heart, fitness, walk, medical, pulse, musicalNotes, personAdd, alertCircle, chevronForward, logoGoogle, share, water, speedometer, logOut, cloud, sunny, rainy, partlySunny, mail } from 'ionicons/icons';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
// Register all icons globally
addIcons({
    home, people, cart, settings, personCircle, grid, list, heart, fitness, walk,
    medical, pulse, musicalNotes, personAdd, alertCircle, chevronForward, logoGoogle,
    share, water, speedometer, logOut, cloud, sunny, rainy, partlySunny, mail
});
bootstrapApplication(AppComponent, {
    providers: [
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        provideIonicAngular(),
        provideRouter(routes, withPreloading(PreloadAllModules)),
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        provideAuth(() => {
            const auth = getAuth();
            // Configure auth persistence - this ensures session persists across page refreshes
            if (!environment.production) {
                // In development, you might want to use session persistence for easier testing
                // auth.setPersistence('session'); // Uncomment if you want session-only persistence in dev
            }
            return auth;
        }),
        provideFirestore(() => getFirestore()),
        provideStorage(() => getStorage()),
    ],
});
//# sourceMappingURL=main.js.map