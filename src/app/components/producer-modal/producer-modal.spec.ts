import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProducerModal } from './producer-modal';

describe('ProducerModal', () => {
  let component: ProducerModal;
  let fixture: ComponentFixture<ProducerModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProducerModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProducerModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
