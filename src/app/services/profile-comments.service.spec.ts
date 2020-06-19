import { TestBed } from '@angular/core/testing';

import { ProfileCommentsService } from './profile-comments.service';

describe('ProfileCommentsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ProfileCommentsService = TestBed.get(ProfileCommentsService);
    expect(service).toBeTruthy();
  });
});
