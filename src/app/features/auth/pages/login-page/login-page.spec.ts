import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { ApiError } from '../../../../core/http/api-error.model';
import { UserResponse } from '../../../../shared/models/api/auth.models';
import { LoginPage } from './login-page';

const user: UserResponse = {
  id: '10000000-0000-0000-0000-000000000001',
  username: 'admin',
  email: 'admin@example.com',
  role: 'Administrator',
  isActive: true,
  createdAt: '2026-08-17T00:00:00Z',
  updatedAt: '2026-08-17T00:00:00Z',
};

describe('LoginPage', () => {
  let fixture: ComponentFixture<LoginPage>;
  const login = vi.fn();
  const navigateByUrl = vi.fn();

  beforeEach(async () => {
    login.mockReset();
    navigateByUrl.mockReset();
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        { provide: AuthService, useValue: { login } },
        { provide: Router, useValue: { navigateByUrl } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
  });

  it('does not submit an invalid form', () => {
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    expect(login).not.toHaveBeenCalled();
  });

  it('logs in and navigates to the dashboard', () => {
    login.mockReturnValue(of(user));
    setInputValue('login', 'admin');
    setInputValue('password', 'StrongPassword!');
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    expect(login).toHaveBeenCalledWith({ login: 'admin', password: 'StrongPassword!' });
    expect(navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('shows a friendly authentication error', () => {
    login.mockReturnValue(throwError(() => new ApiError('Credenciales incorrectas.', 401)));
    setInputValue('login', 'admin');
    setInputValue('password', 'WrongPassword!');
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Usuario o contraseña incorrectos.');
  });

  function setInputValue(id: string, value: string): void {
    const input = fixture.nativeElement.querySelector(`#${id}`) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }
});
