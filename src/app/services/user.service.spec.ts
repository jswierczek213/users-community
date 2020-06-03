import { TestBed } from '@angular/core/testing';

import { UserService } from './user.service';

const service: UserService = TestBed.get(UserService);

describe('UserService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
