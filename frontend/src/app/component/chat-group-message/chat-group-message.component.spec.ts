import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatGroupMessageComponent } from './chat-group-message.component';

describe('ChatGroupMessageComponent', () => {
  let component: ChatGroupMessageComponent;
  let fixture: ComponentFixture<ChatGroupMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatGroupMessageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChatGroupMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
