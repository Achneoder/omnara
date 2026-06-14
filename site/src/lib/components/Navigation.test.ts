import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readable } from 'svelte/store';
import Navigation from './Navigation.svelte';

vi.mock('$app/stores', () => ({
  page: readable({ url: { pathname: '/' } }),
}));

describe('Navigation', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('renders the brand name', () => {
    render(Navigation);
    expect(screen.getByText('Softeis Kai')).toBeInTheDocument();
  });

  it('renders all nav links', () => {
    render(Navigation);
    expect(screen.getByRole('link', { name: /Startseite/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sortiment/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Service/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Kontakt/i })).toBeInTheDocument();
  });

  it('renders hamburger menu button on mobile', () => {
    render(Navigation);
    const button = screen.getByRole('button', { name: /menü öffnen/i });
    expect(button).toBeInTheDocument();
  });

  it('mobile menu is hidden by default', () => {
    render(Navigation);
    expect(screen.queryByRole('button', { name: /menü schließen/i })).not.toBeInTheDocument();
  });

  it('opens mobile menu when hamburger is clicked', async () => {
    const user = userEvent.setup();
    render(Navigation);

    const openButton = screen.getByRole('button', { name: /menü öffnen/i });
    await user.click(openButton);

    expect(screen.getByRole('button', { name: /menü schließen/i })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /hauptnavigation/i })).toBeInTheDocument();
  });

  it('closes mobile menu when close button is clicked', async () => {
    const user = userEvent.setup();
    render(Navigation);

    await user.click(screen.getByRole('button', { name: /menü öffnen/i }));
    expect(screen.getByRole('button', { name: /menü schließen/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /menü schließen/i }));
    expect(screen.getByRole('button', { name: /menü öffnen/i })).toBeInTheDocument();
  });

  it('renders the logo link pointing to home', () => {
    render(Navigation);
    const logoLink = screen.getByRole('link', { name: /softeis kai/i });
    expect(logoLink).toHaveAttribute('href', '/');
  });
});
