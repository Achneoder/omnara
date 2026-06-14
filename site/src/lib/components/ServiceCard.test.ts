import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import ServiceCard from './ServiceCard.svelte';
import type { RentalService } from '$lib/api';

const serviceWithStaff: RentalService = {
  name: 'Premium Paket',
  description: 'Unser All-Inclusive-Angebot für große Events.',
  ideal_for: 'Firmenfeiern und Hochzeiten',
  includes_staff: true,
  display_order: 1,
};

const serviceWithoutStaff: RentalService = {
  name: 'Selbstbedienung',
  description: 'Der Eiswagen ohne Personal – perfekt für Selbstorganisierte.',
  ideal_for: 'Familienfeste',
  includes_staff: false,
  display_order: 2,
};

const serviceWithoutIdealFor: RentalService = {
  name: 'Basis Paket',
  description: 'Einfaches Paket ohne besondere Extras.',
  ideal_for: '',
  includes_staff: false,
  display_order: 3,
};

describe('ServiceCard', () => {
  it('renders service name', () => {
    render(ServiceCard, { service: serviceWithStaff });
    expect(screen.getByText('Premium Paket')).toBeInTheDocument();
  });

  it('renders service description', () => {
    render(ServiceCard, { service: serviceWithStaff });
    expect(screen.getByText('Unser All-Inclusive-Angebot für große Events.')).toBeInTheDocument();
  });

  it('shows "mit Personal" badge when includes_staff is true', () => {
    render(ServiceCard, { service: serviceWithStaff });
    expect(screen.getByText('mit Personal')).toBeInTheDocument();
  });

  it('does not show "mit Personal" badge when includes_staff is false', () => {
    render(ServiceCard, { service: serviceWithoutStaff });
    expect(screen.queryByText('mit Personal')).not.toBeInTheDocument();
  });

  it('renders "Ideal für" section when ideal_for is provided', () => {
    render(ServiceCard, { service: serviceWithStaff });
    expect(screen.getByText('Ideal für')).toBeInTheDocument();
    expect(screen.getByText('Firmenfeiern und Hochzeiten')).toBeInTheDocument();
  });

  it('does not render "Ideal für" section when ideal_for is empty', () => {
    render(ServiceCard, { service: serviceWithoutIdealFor });
    expect(screen.queryByText('Ideal für')).not.toBeInTheDocument();
  });

  it('renders as an article element', () => {
    const { container } = render(ServiceCard, { service: serviceWithStaff });
    expect(container.querySelector('article')).toBeInTheDocument();
  });
});
