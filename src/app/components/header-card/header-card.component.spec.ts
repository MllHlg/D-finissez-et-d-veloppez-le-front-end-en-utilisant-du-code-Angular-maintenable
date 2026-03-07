import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderCardComponent } from './header-card.component';

describe('HeaderCard', () => {
  let component: HeaderCardComponent;
  let fixture: ComponentFixture<HeaderCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
