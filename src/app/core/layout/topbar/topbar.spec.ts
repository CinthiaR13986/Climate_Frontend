import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthStore } from '../../auth/auth.store';
import { AuthService } from '../../auth/auth.service';
import { Topbar } from './topbar';

describe('Topbar', () => {
  let fixture: ComponentFixture<Topbar>;
  let events: Subject<NavigationEnd>;
  let routerState: { snapshot: { root: RouteNode } };

  beforeEach(async () => {
    events = new Subject<NavigationEnd>();
    routerState = { snapshot: { root: routeTree('Monitoreo') } };

    await TestBed.configureTestingModule({
      imports: [Topbar],
      providers: [
        {
          provide: Router,
          useValue: { events, routerState },
        },
        {
          provide: AuthStore,
          useValue: {
            currentUser: signal(null),
            role: signal(null),
          },
        },
        {
          provide: AuthService,
          useValue: { logout: vi.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Topbar);
    fixture.detectChanges();
  });

  it('reads the initial title from the router state snapshot', () => {
    expect(fixture.nativeElement.textContent).toContain('Monitoreo');
  });

  it('updates the title after navigation completes', () => {
    routerState.snapshot.root = routeTree('Sensores');
    events.next(new NavigationEnd(1, '/sensors', '/sensors'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Sensores');
  });
});

interface RouteNode {
  data: Record<string, unknown>;
  firstChild: RouteNode | null;
}

function routeTree(pageTitle: string): RouteNode {
  return {
    data: {},
    firstChild: {
      data: { pageTitle },
      firstChild: null,
    },
  };
}
