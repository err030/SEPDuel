import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DuelBoardComponent } from './duel-board.component';

describe('DuelBoardComponent', () => {
  let component: DuelBoardComponent;
  let fixture: ComponentFixture<DuelBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DuelBoardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DuelBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
