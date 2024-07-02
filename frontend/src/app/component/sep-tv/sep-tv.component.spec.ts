import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SepTvComponent } from './sep-tv.component';

describe('SepTvComponent', () => {
  let component: SepTvComponent;
  let fixture: ComponentFixture<SepTvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SepTvComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SepTvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
