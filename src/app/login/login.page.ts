import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { pageFadeAnimation } from '../animations';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonInput, IonItem, IonLabel, IonCard, IonIcon, IonSpinner, IonText, AlertController } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  animations: [pageFadeAnimation],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonCard,
    IonSpinner,
    IonText
],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.authService.getLoading()
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.isLoading = loading;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async login() {
    if (this.loginForm.invalid) {
      await this.showAlert('Erro', 'Por favor, preencha todos os campos corretamente.');
      return;
    }

    const { email, password } = this.loginForm.value;

    try {
      const result = await this.authService.signIn(email, password);
      // aguardar até que o usuário exista no auth state
      if (result?.user) {
        this.router.navigateByUrl('/home');
      } else {
        // fallback: espere brevemente pela atualização do estado
        setTimeout(() => this.router.navigateByUrl('/home'), 500);
      }
    } catch (error: any) {
      await this.showAlert('Erro de Login', error.message || 'Falha ao fazer login.');
    }
  }

  async loginWithGoogle() {
    try {
      const res = await this.authService.signInWithGoogle();
      if (res?.user) {
        this.router.navigateByUrl('/home');
      }
    } catch (error: any) {
      await this.showAlert('Erro de Login', error.message || 'Falha ao fazer login com Google.');
    }
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
