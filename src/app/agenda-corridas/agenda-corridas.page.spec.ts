import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AgendaCorridasPage } from './agenda-corridas.page';

describe('AgendaCorridasPage', () => {
  let component: AgendaCorridasPage;
  let fixture: ComponentFixture<AgendaCorridasPage>;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideAnimations()] });
    fixture = TestBed.createComponent(AgendaCorridasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
