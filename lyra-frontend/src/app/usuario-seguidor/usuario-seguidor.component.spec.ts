import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuarioSeguidorComponent } from './usuario-seguidor.component';

describe('UsuarioSeguidorComponent', () => {
  let component: UsuarioSeguidorComponent;
  let fixture: ComponentFixture<UsuarioSeguidorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UsuarioSeguidorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsuarioSeguidorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
