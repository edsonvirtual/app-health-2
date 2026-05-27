import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonInput, IonItem, IonLabel, IonCard, IonIcon, IonSpinner, IonText } from '@ionic/angular/standalone';
let LoginPage = class LoginPage {
    constructor(formBuilder, authService, router, alertController) {
        this.formBuilder = formBuilder;
        this.authService = authService;
        this.router = router;
        this.alertController = alertController;
        this.isLoading = false;
        this.destroy$ = new Subject();
    }
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
            await this.authService.signIn(email, password);
            this.router.navigateByUrl('/home');
        }
        catch (error) {
            await this.showAlert('Erro de Login', error.message || 'Falha ao fazer login.');
        }
    }
    async loginWithGoogle() {
        try {
            await this.authService.signInWithGoogle();
            this.router.navigateByUrl('/home');
        }
        catch (error) {
            await this.showAlert('Erro de Login', error.message || 'Falha ao fazer login com Google.');
        }
    }
    async showAlert(header, message) {
        const alert = await this.alertController.create({
            header,
            message,
            buttons: ['OK'],
        });
        await alert.present();
    }
};
LoginPage = __decorate([
    Component({
        selector: 'app-login',
        standalone: true,
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
], LoginPage);
export { LoginPage };
//# sourceMappingURL=login.page.js.map