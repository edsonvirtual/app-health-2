import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { NoAuthGuard } from './guards/no-auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
    canActivate: [NoAuthGuard],
  },
  {
    path: 'signup',
    loadComponent: () => import('./signup/signup.page').then((m) => m.SignupPage),
    canActivate: [NoAuthGuard],
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    canActivate: [AuthGuard],
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'health',
    loadComponent: () => import('./health/health.page').then( m => m.HealthPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'favorite-music',
    loadComponent: () => import('./favorite-music/favorite-music.page').then( m => m.FavoriteMusicPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'streaming-callback',
    loadComponent: () => import('./streaming-callback/streaming-callback.page').then(m => m.StreamingCallbackPage)
  },
  {
    path: 'heart-rate',
    loadComponent: () => import('./heart-rate/heart-rate.page').then( m => m.HeartRatePage),
    canActivate: [AuthGuard]
  },
  {
    path: 'agenda-corridas',
    loadComponent: () => import('./agenda-corridas/agenda-corridas.page').then( m => m.AgendaCorridasPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'add-friends',
    redirectTo: 'friends',
    pathMatch: 'full'
  },
  {
    path: 'friends',
    loadComponent: () => import('./friends/friends.page').then(m => m.FriendsPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'social-feed',
    loadComponent: () => import('./social-feed/social-feed.page').then(m => m.SocialFeedPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'descanso',
    loadComponent: () => import('./descanso/descanso.page').then( m => m.DescansoPage)
  },
  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
