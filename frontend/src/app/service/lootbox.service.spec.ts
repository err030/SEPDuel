import { TestBed } from '@angular/core/testing';

import { LootboxService } from './lootbox.service';

describe('LootboxService', () => {
  let service: LootboxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LootboxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
