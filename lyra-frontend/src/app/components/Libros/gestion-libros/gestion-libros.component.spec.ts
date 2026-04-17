import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionLibrosComponent } from './gestion-libros.component';

describe('GestionLibrosComponent', () => {
  let component: GestionLibrosComponent;
  let fixture: ComponentFixture<GestionLibrosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestionLibrosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionLibrosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
