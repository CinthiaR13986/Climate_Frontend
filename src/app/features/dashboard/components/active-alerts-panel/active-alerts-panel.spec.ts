import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AlertResponse } from '../../../alerts/models/alert.models';
import { ActiveAlertsPanel } from './active-alerts-panel';

describe('ActiveAlertsPanel', () => {
  let fixture: ComponentFixture<ActiveAlertsPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveAlertsPanel],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ActiveAlertsPanel);
  });

  it('preserves the warning colors for alerts loaded from the API', () => {
    fixture.componentRef.setInput('alerts', [createAlert('Orange')]);
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector('article') as HTMLElement;
    expect(card.classList.contains('border-orange-200')).toBe(true);
    expect(card.classList.contains('bg-orange-50')).toBe(true);
    expect(card.classList.contains('text-orange-900')).toBe(true);
  });
});

function createAlert(level: AlertResponse['level']): AlertResponse {
  return {
    id: 'alert-1',
    sensorId: 'sensor-1',
    communityId: 'community-1',
    alertType: 'Storm',
    level,
    title: 'Viento peligroso',
    description: 'Descripción',
    sensorValue: 50,
    thresholdValue: 40,
    generatedAt: '2026-08-18T00:00:00Z',
    isActive: true,
    resolvedAt: null,
  };
}
