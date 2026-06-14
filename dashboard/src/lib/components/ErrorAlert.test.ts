import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import { userEvent } from '@testing-library/user-event';
import ErrorAlert from './ErrorAlert.svelte';

describe('ErrorAlert', () => {
  it('displays the error message', () => {
    render(ErrorAlert, { props: { message: 'Something went wrong' } });
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
  });

  it('shows retry button when onretry provided', () => {
    render(ErrorAlert, { props: { message: 'Error', onretry: vi.fn() } });
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('hides retry button when onretry not provided', () => {
    render(ErrorAlert, { props: { message: 'Error' } });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onretry when retry button clicked', async () => {
    const user = userEvent.setup();
    const onretry = vi.fn();
    render(ErrorAlert, { props: { message: 'Error', onretry } });
    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(onretry).toHaveBeenCalledOnce();
  });
});
