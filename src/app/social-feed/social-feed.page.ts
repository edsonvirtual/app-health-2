import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { pageFadeAnimation, listStagger } from '../animations';
import { IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader, IonIcon, IonImg, IonItem, IonLabel, IonList, IonTextarea, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { camera, image, shareSocial } from 'ionicons/icons';
import { FeedPost, SocialService } from '../services/social.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-social-feed',
  templateUrl: './social-feed.page.html',
  styleUrls: ['./social-feed.page.scss'],
  standalone: true,
  animations: [pageFadeAnimation, listStagger],
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, IonLabel, IonTextarea, IonButton, IonList, IonImg, IonIcon]
})
export class SocialFeedPage implements OnInit {
  caption = '';
  imagePreview = '';
  posts$!: Observable<FeedPost[]>;
  message = '';
  

  constructor(private socialService: SocialService) {
    addIcons({ camera, image, shareSocial });
  }

  ngOnInit() {
    this.posts$ = this.socialService.getPosts();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  async addPost() {
    if (!this.imagePreview) {
      this.message = 'Selecione uma foto para publicar.';
      return;
    }
    try {
      const resultMessage = await this.socialService.addPost(this.caption, this.imagePreview);
      this.caption = '';
      this.imagePreview = '';
      this.message = resultMessage;
    } catch (error: any) {
      console.error(error);
      this.message = error?.message || 'Não foi possível publicar o post.';
    }
  }
}
