import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Navbar } from './navbar';

@Component({ template: '' })
class Stub {}

describe('Navbar', () => {
  let fixture: ComponentFixture<Navbar>;
  let element: HTMLElement;

  const link = (label: string): HTMLAnchorElement => {
    const found = Array.from(element.querySelectorAll('a')).find(
      (a) => a.textContent?.trim() === label,
    );
    if (!found) throw new Error(`No navbar link labelled "${label}"`);
    return found;
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', component: Stub },
          { path: 'favorites', component: Stub },
          { path: 'about', component: Stub },
        ]),
      ],
    });
    fixture = TestBed.createComponent(Navbar);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('links to Home, Favorites and About', () => {
    expect(link('Home').getAttribute('href')).toBe('/');
    expect(link('Favorites').getAttribute('href')).toBe('/favorites');
    expect(link('About').getAttribute('href')).toBe('/about');
  });

  it('is labelled as the main navigation landmark', () => {
    expect(element.querySelector('nav')?.getAttribute('aria-label')).toBe('Main');
  });

  it('marks only the link for the current page as active', async () => {
    await TestBed.inject(Router).navigateByUrl('/favorites');
    await fixture.whenStable();

    expect(link('Favorites').classList).toContain('active');
    expect(link('Favorites').getAttribute('aria-current')).toBe('page');
    expect(link('Home').classList).not.toContain('active');
    expect(link('Home').getAttribute('aria-current')).toBeNull();
  });
});
