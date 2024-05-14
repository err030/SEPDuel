import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardUploadComponent } from './card-upload.component';

describe('CardUploadComponent', () => {
  let component: CardUploadComponent;
  let fixture: ComponentFixture<CardUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardUploadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CardUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
