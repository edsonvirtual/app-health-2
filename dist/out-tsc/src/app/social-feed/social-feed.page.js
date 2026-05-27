import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader, IonIcon, IonImg, IonItem, IonLabel, IonList, IonTextarea, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { camera, image, shareSocial } from 'ionicons/icons';
let SocialFeedPage = class SocialFeedPage {
    constructor(socialService) {
        this.socialService = socialService;
        this.caption = '';
        this.imagePreview = '';
        this.message = '';
        this.isLoading = false;
        addIcons({ camera, image, shareSocial });
    }
    ngOnInit() {
        this.posts$ = this.socialService.getPosts();
    }
    onFileSelected(event) {
        const input = event.target;
        if (!input.files || input.files.length === 0) {
            return;
        }
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            this.imagePreview = reader.result;
        };
        reader.readAsDataURL(file);
    }
    async addPost() {
        if (!this.imagePreview) {
            this.message = 'Selecione uma foto para publicar.';
            return;
        }
        this.isLoading = true;
        try {
            const resultMessage = await this.socialService.addPost(this.caption, this.imagePreview);
            this.caption = '';
            this.imagePreview = '';
            this.message = resultMessage;
        }
        catch (error) {
            console.error(error);
            this.message = error?.message || 'Não foi possível publicar o post.';
        }
        finally {
            this.isLoading = false;
        }
    }
};
SocialFeedPage = __decorate([
    Component({
        selector: 'app-social-feed',
        templateUrl: './social-feed.page.html',
        styleUrls: ['./social-feed.page.scss'],
        standalone: true,
        imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, IonLabel, IonTextarea, IonButton, IonList, IonImg, IonIcon]
    })
], SocialFeedPage);
export { SocialFeedPage };
//# sourceMappingURL=social-feed.page.js.map