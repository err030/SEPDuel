import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllCardsComponent } from './all-cards.component';

describe('AllCardsComponent', () => {
  let component: AllCardsComponent;
  let fixture: ComponentFixture<AllCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllCardsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AllCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
