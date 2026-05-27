import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DescansoPage } from './descanso.page';

describe('DescansoPage', () => {
  let component: DescansoPage;
  let fixture: ComponentFixture<DescansoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DescansoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
