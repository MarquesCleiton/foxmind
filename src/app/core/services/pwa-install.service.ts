import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class PwaInstallService {
  private platformId = inject(PLATFORM_ID);
  private deferredPrompt: any = null;

  public canInstall = signal<boolean>(false);
  public isStandalone = signal<boolean>(false);
  public isIOS = signal<boolean>(false);
  public isBannerDismissed = signal<boolean>(false);
  public showIosGuideModal = signal<boolean>(false);

  public showInstallBanner = computed(() => {
    return !this.isStandalone() && !this.isBannerDismissed() && (this.canInstall() || this.isIOS());
  });

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.checkStandaloneMode();
      this.checkIOS();
      this.initInstallPromptListener();
    }
  }

  private checkStandaloneMode(): void {
    const isStandaloneWindow = window.matchMedia('(display-mode: standalone)').matches;
    const isStandaloneNavigator = (window.navigator as any).standalone === true;
    this.isStandalone.set(isStandaloneWindow || isStandaloneNavigator);

    // Também verifica se já foi descartado recentemente
    const dismissed = sessionStorage.getItem('foxmind_pwa_dismissed');
    if (dismissed === 'true') {
      this.isBannerDismissed.set(true);
    }
  }

  private checkIOS(): void {
    const ua = window.navigator.userAgent.toLowerCase();
    const isApple = /iphone|ipad|ipod/.test(ua);
    this.isIOS.set(isApple);
  }

  private initInstallPromptListener(): void {
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      // Impede o mini-infobar automático para usar nosso banner estilizado
      e.preventDefault();
      this.deferredPrompt = e;
      this.canInstall.set(true);
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.canInstall.set(false);
      this.isStandalone.set(true);
    });
  }

  public async installApp(): Promise<void> {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        this.canInstall.set(false);
      }
      this.deferredPrompt = null;
    } else if (this.isIOS()) {
      this.showIosGuideModal.set(true);
    }
  }

  public openIosGuide(): void {
    this.showIosGuideModal.set(true);
  }

  public closeIosGuide(): void {
    this.showIosGuideModal.set(false);
  }

  public dismissBanner(): void {
    this.isBannerDismissed.set(true);
    sessionStorage.setItem('foxmind_pwa_dismissed', 'true');
  }
}
