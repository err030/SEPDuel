import { TestBed } from '@angular/core/testing';

import { ChatgroupService } from './chatgroup.service';

describe('ChatgroupService', () => {
  let service: ChatgroupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatgroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
