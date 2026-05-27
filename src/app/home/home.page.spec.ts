/// <reference types="jasmine" />

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideIonicAngular, ActionSheetController, AlertController } from '@ionic/angular/standalone';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { of } from 'rxjs';

import { HomePage } from './home.page';
import { AuthService } from '../services/auth.service';
import { SocialService } from '../services/social.service';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  const mockAuthService = {
    getUser: () => of(null),
    logout: jasmine.createSpy('logout')
  } as Partial<AuthService>;

  const mockSocialService = {
    addFriend: (name: string, email: string) => Promise.resolve('Convite enviado')
  } as Partial<SocialService>;

  const mockActionSheetCtrl = {
    create: () => Promise.resolve({ present: () => Promise.resolve() })
  } as Partial<ActionSheetController>;

  const mockAlertCtrl = {
    create: (opts: any) => Promise.resolve({ present: () => Promise.resolve() })
  } as Partial<AlertController>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideAnimations(),
        provideIonicAngular(),
        { provide: Auth, useValue: {} },
        { provide: Firestore, useValue: {} },
        { provide: AuthService, useValue: mockAuthService },
        { provide: SocialService, useValue: mockSocialService },
        { provide: ActionSheetController, useValue: mockActionSheetCtrl },
        { provide: AlertController, useValue: mockAlertCtrl }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
