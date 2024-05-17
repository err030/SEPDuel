import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllfriendlistComponent } from './allfriendlist.component';

describe('AllfriendlistComponent', () => {
  let component: AllfriendlistComponent;
  let fixture: ComponentFixture<AllfriendlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllfriendlistComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AllfriendlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
