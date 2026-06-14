import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import FlavorCard from './FlavorCard.svelte';
import type { IceCreamFlavor } from '$lib/api';

const vanillaFlavor: IceCreamFlavor = {
  name: 'vanilla_classic',
  name_de: 'Vanille Classic',
  base: 'vanilla',
  display_order: 1,
};

const chocolateFlavor: IceCreamFlavor = {
  name: 'chocolate_dream',
  name_de: 'Schoko Traum',
  base: 'chocolate',
  secondary: 'dunkle Schokolade',
  display_order: 2,
};

const unknownBaseFlavor: IceCreamFlavor = {
  name: 'exotic_surprise',
  name_de: 'Exotische Überraschung',
  base: 'mango',
  display_order: 3,
};

describe('FlavorCard', () => {
  it('renders the German flavor name', () => {
    render(FlavorCard, { flavor: vanillaFlavor });
    expect(screen.getByText('Vanille Classic')).toBeInTheDocument();
  });

  it('renders the base label for vanilla', () => {
    render(FlavorCard, { flavor: vanillaFlavor });
    expect(screen.getByText('Vanille')).toBeInTheDocument();
  });

  it('renders secondary flavor info when provided', () => {
    render(FlavorCard, { flavor: chocolateFlavor });
    expect(screen.getByText(/dunkle Schokolade/)).toBeInTheDocument();
  });

  it('does not show secondary line when secondary is absent', () => {
    render(FlavorCard, { flavor: vanillaFlavor });
    expect(screen.queryByText(/·/)).not.toBeInTheDocument();
  });

  it('renders with an unknown base gracefully', () => {
    render(FlavorCard, { flavor: unknownBaseFlavor });
    expect(screen.getByText('Exotische Überraschung')).toBeInTheDocument();
    expect(screen.getByText('mango')).toBeInTheDocument();
  });

  it('renders as an article element', () => {
    const { container } = render(FlavorCard, { flavor: vanillaFlavor });
    expect(container.querySelector('article')).toBeInTheDocument();
  });
});
