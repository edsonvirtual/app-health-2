import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { addIcons } from 'ionicons';
import { logOut, heart, fitness, walk, medical, pulse, musicalNotes, personAdd, alertCircle, water, cloud, sunny, rainy, partlySunny, personCircle, speedometer, grid, list, chevronForward, logoGoogle, mail, share, home, people, cart, settings, calendar, ellipsisVertical } from 'ionicons/icons';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonItem, IonCard, IonImg, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonFab, IonFabButton } from '@ionic/angular/standalone';
let HomePage = class HomePage {
    constructor(authService, socialService, router, actionSheetCtrl, alertCtrl) {
        this.authService = authService;
        this.socialService = socialService;
        this.router = router;
        this.actionSheetCtrl = actionSheetCtrl;
        this.alertCtrl = alertCtrl;
        this.viewMode = 'cards';
        this.viewOptionsOpen = false;
        this.friendName = '';
        this.friendEmail = '';
        this.friendMessage = '';
        addIcons({ personCircle, logoGoogle, logOut, ellipsisVertical, heart, fitness, calendar, medical, pulse, musicalNotes, personAdd, alertCircle, chevronForward, walk, share, water, speedometer, grid, list, cloud, sunny, rainy, partlySunny, mail, home, people, cart, settings });
    }
    ngOnInit() {
        this.user$ = this.authService.getUser();
        this.loadWeather();
    }
    loadWeather() {
        // Simular dados de previsão do tempo
        // Em uma aplicação real, você chamaria um serviço de API de clima
        const mockWeather = {
            temp: 24,
            condition: 'Parcialmente Nublado',
            humidity: 65,
            windSpeed: 12
        };
        this.weather$ = of(mockWeather);
    }
    getWeatherIcon(condition) {
        const conditionLower = condition.toLowerCase();
        if (conditionLower.includes('nublado'))
            return 'cloud';
        if (conditionLower.includes('ensolarado') || conditionLower.includes('claro'))
            return 'sunny';
        if (conditionLower.includes('chuva'))
            return 'rainy';
        if (conditionLower.includes('parcialmente'))
            return 'partly-sunny';
        return 'sunny';
    }
    navigateTo(route) {
        switch (route) {
            case 'heart-rate':
            case 'heart-rate-2':
                this.router.navigate(['/heart-rate']);
                break;
            case 'my-health':
            case 'health-2':
                this.router.navigate(['/health']);
                break;
            case 'schedule-runs':
                this.router.navigate(['/agenda-corridas']);
                break;
            case 'favorite-music':
                this.router.navigate(['/favorite-music']);
                break;
            case 'add-friends':
            case 'friends':
                this.router.navigate(['/friends']);
                break;
            case 'social-feed':
                this.router.navigate(['/social-feed']);
                break;
            case 'emergency':
                this.showEmergencyAlert();
                break;
        }
    }
    showEmergencyAlert() {
        alert('🚨 BOTÃO DE EMERGÊNCIA ATIVADO!\n\nContate os serviços de emergência: 192');
    }
    async openItemActions(route, title) {
        const actionSheet = await this.actionSheetCtrl.create({
            header: title,
            buttons: [
                {
                    text: 'Abrir',
                    icon: 'open-outline',
                    handler: () => this.navigateTo(route),
                },
                {
                    text: 'Compartilhar',
                    icon: 'share-outline',
                    handler: () => this.shareView(title),
                },
                {
                    text: 'Favoritar',
                    icon: 'heart-outline',
                    handler: () => this.markFavorite(title),
                },
                {
                    text: 'Cancelar',
                    role: 'cancel',
                    icon: 'close-outline',
                },
            ],
        });
        await actionSheet.present();
    }
    async shareView(title) {
        const message = `Confira ${title} no App Health!`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'App Health',
                    text: message,
                });
                alert('Compartilhamento concluído!');
            }
            catch (error) {
                console.warn(error);
                await navigator.clipboard.writeText(message);
                alert('Compartilhamento não disponível. Texto copiado.');
            }
        }
        else {
            await navigator.clipboard.writeText(message);
            alert('Compartilhamento não disponível. Texto copiado.');
        }
    }
    async addFriend(name, email) {
        try {
            const resultMessage = await this.socialService.addFriend(name, email);
            this.friendMessage = resultMessage;
            const successAlert = await this.alertCtrl.create({
                header: 'Sucesso',
                message: resultMessage,
                buttons: ['OK']
            });
            await successAlert.present();
            this.friendName = '';
            this.friendEmail = '';
        }
        catch (error) {
            console.error(error);
            this.friendMessage = error?.message || 'Não foi possível enviar o convite. Verifique os dados e tente novamente.';
            const errorAlert = await this.alertCtrl.create({
                header: 'Erro',
                message: this.friendMessage,
                buttons: ['OK']
            });
            await errorAlert.present();
        }
    }
    async openAddFriendModal() {
        const alert = await this.alertCtrl.create({
            header: 'Adicionar Amigo',
            message: 'Convide um amigo para acompanhar seu progresso',
            inputs: [
                {
                    name: 'name',
                    type: 'text',
                    placeholder: 'Nome completo'
                },
                {
                    name: 'email',
                    type: 'email',
                    placeholder: 'email@exemplo.com'
                }
            ],
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel'
                },
                {
                    text: 'Enviar',
                    handler: (data) => {
                        if (!data.name?.trim() || !data.email?.trim()) {
                            return false;
                        }
                        this.addFriend(data.name, data.email);
                        return true;
                    }
                }
            ]
        });
        await alert.present();
    }
    markFavorite(title) {
        alert(`${title} adicionado aos favoritos!`);
    }
    async openViewModeMenu() {
        const actionSheet = await this.actionSheetCtrl.create({
            header: 'Modo de Visualização',
            buttons: [
                {
                    text: 'Cards',
                    icon: 'grid',
                    handler: () => {
                        this.viewMode = 'cards';
                    },
                },
                {
                    text: 'Lista',
                    icon: 'list',
                    handler: () => {
                        this.viewMode = 'list';
                    },
                },
                {
                    text: 'Cancelar',
                    role: 'cancel',
                    icon: 'close',
                },
            ],
        });
        await actionSheet.present();
    }
    toggleViewMode() {
        this.viewMode = this.viewMode === 'cards' ? 'list' : 'cards';
    }
    toggleViewOptions() {
        this.viewOptionsOpen = !this.viewOptionsOpen;
    }
    setViewMode(mode) {
        this.viewMode = mode;
        this.viewOptionsOpen = false;
    }
    getDisplayName(user) {
        if (!user)
            return 'Usuário Google';
        let displayName = user.displayName;
        if (!displayName && user.providerData && user.providerData.length > 0) {
            displayName = user.providerData[0].displayName;
        }
        if (!displayName && user.email) {
            displayName = user.email.split('@')[0];
        }
        if (!displayName) {
            return 'Usuário Google';
        }
        const words = displayName.trim().split(' ');
        if (words.length > 1) {
            const firstTwo = words.slice(0, 2).join(' ');
            if (firstTwo.length <= 18) {
                return firstTwo;
            }
        }
        if (displayName.length > 18) {
            return `${displayName.slice(0, 15).trim()}...`;
        }
        return displayName;
    }
    getProviderLabel(user) {
        if (!user || !user.providerData || user.providerData.length === 0) {
            return 'Google';
        }
        const providerId = user.providerData[0].providerId || '';
        if (providerId.includes('google.com')) {
            return 'Google';
        }
        if (providerId.includes('facebook.com')) {
            return 'Facebook';
        }
        return providerId.replace('.com', '') || 'Google';
    }
    getPhotoURL(user) {
        if (!user)
            return null;
        let photoURL = user.photoURL;
        if (!photoURL && user.providerData && user.providerData.length > 0) {
            photoURL = user.providerData[0].photoURL;
        }
        return photoURL;
    }
    async logout() {
        await this.authService.logout();
        this.router.navigate(['/login']);
    }
};
HomePage = __decorate([
    Component({
        selector: 'app-home',
        templateUrl: 'home.page.html',
        styleUrls: ['home.page.scss'],
        standalone: true, // Certifique-se de que o standalone está como true
        imports: [
            CommonModule,
            FormsModule,
            RouterModule,
            IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
            IonIcon, IonItem, IonCard, IonImg,
            IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
            IonFab, IonFabButton
        ],
    })
], HomePage);
export { HomePage };
//# sourceMappingURL=home.page.js.map