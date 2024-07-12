import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClanGroupMessageComponent } from './clan-group-message.component';

describe('ClanGroupMessageComponent', () => {
  let component: ClanGroupMessageComponent;
  let fixture: ComponentFixture<ClanGroupMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClanGroupMessageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClanGroupMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
