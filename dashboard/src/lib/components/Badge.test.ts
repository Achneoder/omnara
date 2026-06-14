import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import BadgeWrapper from './BadgeWrapper.test.svelte';

describe('Badge', () => {
  it('renders label text', () => {
    render(BadgeWrapper, { props: { label: 'Live' } });
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('applies success variant classes', () => {
    render(BadgeWrapper, { props: { variant: 'success', label: 'OK' } });
    const badge = screen.getByText('OK');
    expect(badge.className).toContain('bg-green');
  });

  it('applies danger variant classes', () => {
    render(BadgeWrapper, { props: { variant: 'danger', label: 'Error' } });
    const badge = screen.getByText('Error');
    expect(badge.className).toContain('bg-red');
  });
});
