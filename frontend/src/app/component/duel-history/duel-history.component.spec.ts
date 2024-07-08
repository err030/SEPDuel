import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DuelHistoryComponent } from './duel-history.component';

describe('DuelHistoryComponent', () => {
  let component: DuelHistoryComponent;
  let fixture: ComponentFixture<DuelHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DuelHistoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DuelHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
