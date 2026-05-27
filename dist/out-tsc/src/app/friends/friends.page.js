import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personAdd, shareSocial, trash } from 'ionicons/icons';
let FriendsPage = class FriendsPage {
    constructor(socialService) {
        this.socialService = socialService;
        this.friendName = '';
        this.friendEmail = '';
        this.message = '';
        this.messageType = 'success';
        this.isLoading = false;
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
        this.isLoading = true;
        try {
            const resultMessage = await this.socialService.addFriend(this.friendName, this.friendEmail);
            this.friendName = '';
            this.friendEmail = '';
            this.setMessage(resultMessage, 'success');
        }
        catch (error) {
            console.error(error);
            this.setMessage(error?.message || 'Não foi possível enviar a solicitação de amizade.', 'error');
        }
        finally {
            this.isLoading = false;
        }
    }
    async acceptFriendRequest(request) {
        this.isLoading = true;
        try {
            const resultMessage = await this.socialService.acceptFriendRequest(request.id);
            this.setMessage(resultMessage, 'success');
        }
        catch (error) {
            console.error(error);
            this.setMessage(error?.message || 'Não foi possível aceitar a solicitação.', 'error');
        }
        finally {
            this.isLoading = false;
        }
    }
    async rejectFriendRequest(request) {
        this.isLoading = true;
        try {
            const resultMessage = await this.socialService.rejectFriendRequest(request.id);
            this.setMessage(resultMessage, 'success');
        }
        catch (error) {
            console.error(error);
            this.setMessage(error?.message || 'Não foi possível recusar a solicitação.', 'error');
        }
        finally {
            this.isLoading = false;
        }
    }
    async cancelFriendRequest(request) {
        this.isLoading = true;
        try {
            const resultMessage = await this.socialService.cancelFriendRequest(request.id);
            this.setMessage(resultMessage, 'success');
        }
        catch (error) {
            console.error(error);
            this.setMessage(error?.message || 'Não foi possível cancelar a solicitação.', 'error');
        }
        finally {
            this.isLoading = false;
        }
    }
    async removeFriend(id) {
        this.isLoading = true;
        try {
            await this.socialService.removeFriend(id);
            this.setMessage('Amigo removido.', 'success');
        }
        catch (error) {
            console.error(error);
            this.setMessage(error?.message || 'Não foi possível remover o amigo.', 'error');
        }
        finally {
            this.isLoading = false;
        }
    }
    setMessage(message, type = 'success') {
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
            }
            catch (err) {
                console.error(err);
                this.message = 'Não foi possível compartilhar agora.';
            }
        }
        else {
            await navigator.clipboard.writeText(`${text} ${url}`);
            this.message = 'Link copiado para a área de transferência!';
        }
    }
};
FriendsPage = __decorate([
    Component({
        selector: 'app-friends',
        templateUrl: './friends.page.html',
        styleUrls: ['./friends.page.scss'],
        standalone: true,
        imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, IonLabel, IonInput, IonButton, IonList, IonIcon]
    })
], FriendsPage);
export { FriendsPage };
//# sourceMappingURL=friends.page.js.map