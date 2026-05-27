import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { StreamingAuthService } from '../services/streaming-auth.service';

@Component({
  selector: 'app-streaming-callback',
  templateUrl: './streaming-callback.page.html',
  styleUrls: ['./streaming-callback.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, IonButton]
})
export class StreamingCallbackPage implements OnInit {
  message = 'Finalizando autenticação...';
  success = false;

  constructor(
    private streamingAuth: StreamingAuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const result = this.streamingAuth.handleCallback(window.location.hash || window.location.search);

    if (!result.success) {
      this.message = result.error || 'Falha ao autenticar a conta de streaming.';
      return;
    }

    this.success = true;
    this.message = `Conectado com sucesso ao ${result.provider}. Redirecionando...`;

    setTimeout(() => {
      this.router.navigate(['/favorite-music'], { replaceUrl: true });
    }, 1600);
  }

  goBack() {
    this.router.navigate(['/favorite-music'], { replaceUrl: true });
  }
}
