import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import EmptyState from './EmptyState.svelte';

describe('EmptyState', () => {
  it('renders title', () => {
    render(EmptyState, { props: { title: 'Nothing here' } });
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('renders optional description', () => {
    render(EmptyState, { props: { title: 'Empty', description: 'Add something to get started.' } });
    expect(screen.getByText('Add something to get started.')).toBeInTheDocument();
  });

  it('does not render description when omitted', () => {
    render(EmptyState, { props: { title: 'Empty' } });
    expect(screen.queryByText(/add/i)).not.toBeInTheDocument();
  });
});
