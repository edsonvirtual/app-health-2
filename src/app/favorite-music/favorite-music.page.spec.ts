import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { FavoriteMusicPage } from './favorite-music.page';

describe('FavoriteMusicPage', () => {
  let component: FavoriteMusicPage;
  let fixture: ComponentFixture<FavoriteMusicPage>;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideAnimations()] });
    fixture = TestBed.createComponent(FavoriteMusicPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
