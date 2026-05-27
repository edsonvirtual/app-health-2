import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export type StreamingProvider = 'spotify' | 'deezer' | 'youtube';

export interface StreamingAuthSession {
  provider: StreamingProvider;
  accessToken: string;
  expiresAt?: number;
  displayName: string;
  scope: string;
  connectedAt: string;
}

export interface StreamingAuthResult {
  success: boolean;
  provider?: StreamingProvider;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StreamingAuthService {
  private storageKey = 'musicStreamingSession';
  private redirectUri = `${window.location.origin}/streaming-callback`;

  getSession(): StreamingAuthSession | null {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored) as StreamingAuthSession;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }

  logoutSession(): void {
    localStorage.removeItem(this.storageKey);
  }

  connectSpotify(): void {
    const clientId = environment.spotifyClientId;
    if (!clientId) {
      throw new Error('Spotify Client ID não configurado. Adicione environment.spotifyClientId.');
    }

    const scopes = [
      'user-read-email',
      'playlist-read-private',
      'playlist-read-collaborative'
    ];

    const url = `https://accounts.spotify.com/authorize?response_type=token&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=${encodeURIComponent(scopes.join(' '))}&state=spotify&show_dialog=true`;
    this.openAuthUrl(url);
  }

  connectDeezer(): void {
    const appId = environment.deezerAppId;
    if (!appId) {
      throw new Error('Deezer App ID não configurado. Adicione environment.deezerAppId.');
    }

    const perms = [
      'basic_access',
      'email',
      'manage_library',
      'listening_history'
    ];

    const url = `https://connect.deezer.com/oauth/auth.php?app_id=${encodeURIComponent(appId)}&redirect_uri=${encodeURIComponent(this.redirectUri)}&perms=${encodeURIComponent(perms.join(','))}&response_type=token&state=deezer`;
    this.openAuthUrl(url);
  }

  connectYouTubeMusic(): void {
    const clientId = environment.youtubeClientId;
    if (!clientId) {
      throw new Error('YouTube Client ID não configurado. Adicione environment.youtubeClientId.');
    }

    const scopes = [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=token&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=${encodeURIComponent(scopes.join(' '))}&include_granted_scopes=true&prompt=consent&state=youtube`;
    this.openAuthUrl(url);
  }

  handleCallback(hash: string, query: string = ''): StreamingAuthResult {
    const parsed = this.parseParams(hash || query);
    const error = parsed['error'] || parsed['error_description'];
    if (error) {
      return { success: false, error };
    }

    const accessToken = parsed['access_token'];
    const state = parsed['state'] as StreamingProvider | undefined;
    const scope = parsed['scope'] || '';

    if (!accessToken || !state) {
      return {
        success: false,
        error: 'Não foi possível concluir a autenticação. Verifique se o serviço retornou um token válido.'
      };
    }

    const displayName = this.getDisplayNameForProvider(state);
    const expiresAt = parsed['expires_in'] ? Date.now() + Number(parsed['expires_in']) * 1000 : undefined;

    const session: StreamingAuthSession = {
      provider: state,
      accessToken,
      expiresAt,
      displayName,
      scope,
      connectedAt: new Date().toISOString(),
    };

    localStorage.setItem(this.storageKey, JSON.stringify(session));
    return { success: true, provider: state };
  }

  private openAuthUrl(url: string): void {
    window.location.href = url;
  }

  private parseParams(value: string): Record<string, string> {
    const cleaned = value.replace(/^#/, '').replace(/^\?/, '');
    return cleaned.split('&').filter(Boolean).reduce((params, part) => {
      const [key, rawValue] = part.split('=');
      if (!key) {
        return params;
      }

      params[key] = rawValue ? decodeURIComponent(rawValue.replace(/\+/g, ' ')) : '';
      return params;
    }, {} as Record<string, string>);
  }

  private getDisplayNameForProvider(provider: StreamingProvider): string {
    switch (provider) {
      case 'spotify':
        return 'Spotify User';
      case 'deezer':
        return 'Deezer User';
      case 'youtube':
        return 'YouTube Music User';
      default:
        return 'Streaming User';
    }
  }
}
