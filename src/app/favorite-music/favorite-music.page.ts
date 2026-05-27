import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { pageFadeAnimation, listStagger } from '../animations';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon } from '@ionic/angular/standalone';
import { StreamingAuthService } from '../services/streaming-auth.service';


interface ModelOption {
  id: string;
  label: string;
  description: string;
}

@Component({
  selector: 'app-favorite-music',
  templateUrl: './favorite-music.page.html',
  styleUrls: ['./favorite-music.page.scss'],
  standalone: true,
  animations: [pageFadeAnimation, listStagger],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonItem, IonLabel, IonInput, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon]
})
export class FavoriteMusicPage implements OnInit {

  spotifyUrl: string = '';
  youtubeUrl: string = '';
  deezerUrl: string = '';
  embedUrl: string = '';

  connectedService: 'spotify' | 'deezer' | 'youtube' | null = null;
  serviceUserName: string = '';
  authMessage: string = '';
  selectedModel: string = 'premium';

  modelOptions: ModelOption[] = [
    {
      id: 'classic',
      label: 'Clássico Elegante',
      description: 'Visual limpo com foco em playlists e cores suaves.',
    },
    {
      id: 'dark',
      label: 'Escuro Premium',
      description: 'Tema moderno com contraste alto e janelas elegantes.',
    },
    {
      id: 'premium',
      label: 'Premium Luxo',
      description: 'Estilo inspirado em aplicativos premium de música.',
    }
  ];

  constructor(private streamingAuth: StreamingAuthService) { }

  ngOnInit() {
    this.loadSavedStreamingAccount();
  }

  loadSavedStreamingAccount() {
    const session = this.streamingAuth.getSession();
    if (session) {
      this.connectedService = session.provider;
      this.serviceUserName = session.displayName;
      this.authMessage = `Sessão restaurada: conectado com ${this.getProviderLabel()}.`;
    }
  }

  connectStreamingAccount(provider: 'spotify' | 'deezer' | 'youtube') {
    switch (provider) {
      case 'spotify':
        this.streamingAuth.connectSpotify();
        break;
      case 'deezer':
        this.streamingAuth.connectDeezer();
        break;
      case 'youtube':
        this.streamingAuth.connectYouTubeMusic();
        break;
    }
  }

  logoutStreamingAccount() {
    this.streamingAuth.logoutSession();
    this.connectedService = null;
    this.serviceUserName = '';
    this.authMessage = 'Você saiu da conta de streaming. Faça login novamente quando quiser.';
  }

  getProviderLabel(): string {
    switch (this.connectedService) {
      case 'spotify': return 'Spotify';
      case 'deezer': return 'Deezer';
      case 'youtube': return 'YouTube Music';
      default: return 'serviço de música';
    }
  }

  selectModel(modelId: string) {
    this.selectedModel = modelId;
  }

  openSpotify() {
    window.open('https://open.spotify.com', '_blank');
  }

  openYouTubeMusic() {
    window.open('https://music.youtube.com', '_blank');
  }

  openDeezer() {
    window.open('https://www.deezer.com', '_blank');
  }

  loadSpotify() {
    const match = this.spotifyUrl.match(/playlist\/([a-zA-Z0-9]+)/);
    if (match) {
      this.embedUrl = `https://open.spotify.com/embed/playlist/${match[1]}?utm_source=generator`;
    }
  }

  loadYouTube() {
    const match = this.youtubeUrl.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    if (match) {
      this.embedUrl = `https://www.youtube.com/embed/videoseries?list=${match[1]}`;
    }
  }

  loadDeezer() {
    const match = this.deezerUrl.match(/playlist\/(\d+)/);
    if (match) {
      this.embedUrl = `https://widget.deezer.com/widget/dark/playlist/${match[1]}`;
    }
  }

}
