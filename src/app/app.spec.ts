import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    host = fixture.nativeElement;
  });

  it('renders the navbar above the main content', () => {
    const children = Array.from(host.children).map((el) => el.tagName.toLowerCase());
    expect(children).toEqual(['app-navbar', 'main']);
  });

  it('hosts the routed views in a router outlet inside <main>', () => {
    expect(host.querySelector('main > router-outlet')).not.toBeNull();
  });
});
