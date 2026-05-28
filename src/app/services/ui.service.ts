import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UiService {
  private dismissLoader$ = new Subject<void>();

  requestDismissLoader() {
    this.dismissLoader$.next();
  }

  onDismissLoader() {
    return this.dismissLoader$.asObservable();
  }

  // Force-dismiss any ion-loading overlays present in the DOM.
  // Useful as a last-resort fallback when a loader is stuck.
  async forceDismissAll(): Promise<void> {
    try {
      if (typeof document === 'undefined') return;
      const nodes = Array.from(document.querySelectorAll('ion-loading')) as HTMLIonLoadingElement[];
      await Promise.all(nodes.map(async (el) => {
        try {
          // some elements may already be dismissed
          if (el && (el as any).dismiss) {
            await (el as any).dismiss().catch(() => {});
          }
        } catch (_) {
          // ignore
        }
      }));
    } catch (e) {
      // ignore errors from DOM manipulation
    }
  }
}
