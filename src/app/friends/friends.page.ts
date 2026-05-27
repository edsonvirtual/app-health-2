import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { listStagger, pageFadeAnimation } from '../animations';
import { IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonTitle, IonToolbar, IonText } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personAdd, shareSocial, trash } from 'ionicons/icons';
import { Friend, FriendRequest, SocialService } from '../services/social.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.page.html',
  styleUrls: ['./friends.page.scss'],
  standalone: true,
  animations: [pageFadeAnimation, listStagger],
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, IonLabel, IonInput, IonButton, IonList, IonIcon, IonText]
})
export class FriendsPage implements OnInit {
  friendName = '';
  friendEmail = '';
  friends$!: Observable<Friend[]>;
  receivedRequests$!: Observable<FriendRequest[]>;
  sentRequests$!: Observable<FriendRequest[]>;
  message = '';
  messageType: 'success' | 'error' = 'success';
  

  constructor(private socialService: SocialService) {
    addIcons({ personAdd, shareSocial, trash });
  }

  ngOnInit() {
    this.friends$ = this.socialService.getFriends();
    this.receivedRequests$ = this.socialService.getFriendRequestsReceived();
    this.sentRequests$ = this.socialService.getFriendRequestsSent();
  }

  async addFriend() {
    if (!this.friendName.trim() || !this.friendEmail.trim()) {
      this.setMessage('Preencha nome e e-mail do amigo.', 'error');
      return;
    }
    try {
      const resultMessage = await this.socialService.addFriend(this.friendName, this.friendEmail);
      this.friendName = '';
      this.friendEmail = '';
      this.setMessage(resultMessage, 'success');
    } catch (error: any) {
      console.error(error);
      this.setMessage(error?.message || 'Não foi possível enviar a solicitação de amizade.', 'error');
    }
  }

  async acceptFriendRequest(request: FriendRequest) {
    try {
      const resultMessage = await this.socialService.acceptFriendRequest(request.id);
      this.setMessage(resultMessage, 'success');
    } catch (error: any) {
      console.error(error);
      this.setMessage(error?.message || 'Não foi possível aceitar a solicitação.', 'error');
    }
  }

  async rejectFriendRequest(request: FriendRequest) {
    try {
      const resultMessage = await this.socialService.rejectFriendRequest(request.id);
      this.setMessage(resultMessage, 'success');
    } catch (error: any) {
      console.error(error);
      this.setMessage(error?.message || 'Não foi possível recusar a solicitação.', 'error');
    }
  }

  async cancelFriendRequest(request: FriendRequest) {
    try {
      const resultMessage = await this.socialService.cancelFriendRequest(request.id);
      this.setMessage(resultMessage, 'success');
    } catch (error: any) {
      console.error(error);
      this.setMessage(error?.message || 'Não foi possível cancelar a solicitação.', 'error');
    }
  }

  async removeFriend(id: string) {
    try {
      await this.socialService.removeFriend(id);
      this.setMessage('Amigo removido.', 'success');
    } catch (error: any) {
      console.error(error);
      this.setMessage(error?.message || 'Não foi possível remover o amigo.', 'error');
    }
  }

  private setMessage(message: string, type: 'success' | 'error' = 'success') {
    this.message = message;
    this.messageType = type;
  }

  async shareInvite() {
    const text = 'Junte-se ao meu App Health para compartilhar desafios e corridas!';
    const url = 'https://meu-app-health.com/convite';

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Convite App Health', text, url });
        this.message = 'Convite compartilhado com sucesso!';
      } catch (err) {
        console.error(err);
        this.message = 'Não foi possível compartilhar agora.';
      }
    } else {
      await navigator.clipboard.writeText(`${text} ${url}`);
      this.message = 'Link copiado para a área de transferência!';
    }
  }
}
