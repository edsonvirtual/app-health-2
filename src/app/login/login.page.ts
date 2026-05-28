import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil, filter, take, timeout } from 'rxjs';
import { pageFadeAnimation } from '../animations';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonInput, IonItem, IonLabel, IonCard, IonIcon, IonSpinner, IonText, AlertController } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { ToastController } from '@ionic/angular';

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
    ,private toastController: ToastController
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
    let toastEl: HTMLIonToastElement | null = null;
    try {
      toastEl = await this.toastController.create({
        message: 'Abrindo login do Google... se o popup for bloqueado, será usado redirect.',
        duration: 10000,
        position: 'bottom'
      });
      await toastEl.present();

      const res = await this.authService.signInWithGoogle();

      // popup flow returns UserCredential; redirect flow returns void (and navigates on redirect result)
      if (res && (res as any).user) {
        console.debug('[LoginPage] loginWithGoogle: popup result user -> navigating');
        try { await toastEl.dismiss(); } catch(e) {}
        this.router.navigateByUrl('/home');
        return;
      }

      // If we get here, the flow likely used redirect and the page will reload.
      try {
        await this.authService.getUser()
          .pipe(
            filter(u => !!u),
            take(1),
            timeout({ first: 10000 })
          )
          .toPromise();
        try { await toastEl.dismiss(); } catch(e) {}
        this.router.navigateByUrl('/home');
      } catch (err: any) {
        console.warn('[LoginPage] loginWithGoogle: no user after redirect timeout', err);
        try { await toastEl.dismiss(); } catch(e) {}
        await this.showAlert('Erro de Login', 'Não foi possível finalizar o login via Google. Tente novamente.');
      }
    } catch (error: any) {
      try { if (toastEl) await toastEl.dismiss(); } catch(e) {}
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
