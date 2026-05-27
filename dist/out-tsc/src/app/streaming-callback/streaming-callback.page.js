import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
let StreamingCallbackPage = class StreamingCallbackPage {
    constructor(streamingAuth, router) {
        this.streamingAuth = streamingAuth;
        this.router = router;
        this.message = 'Finalizando autenticação...';
        this.success = false;
    }
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
};
StreamingCallbackPage = __decorate([
    Component({
        selector: 'app-streaming-callback',
        templateUrl: './streaming-callback.page.html',
        styleUrls: ['./streaming-callback.page.scss'],
        standalone: true,
        imports: [CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, IonButton]
    })
], StreamingCallbackPage);
export { StreamingCallbackPage };
//# sourceMappingURL=streaming-callback.page.js.map