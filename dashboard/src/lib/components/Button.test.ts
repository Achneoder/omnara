import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import { userEvent } from '@testing-library/user-event';
import ButtonWrapper from './ButtonWrapper.test.svelte';

describe('Button', () => {
  it('renders label text', () => {
    render(ButtonWrapper, { props: { label: 'Click me' } });
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(ButtonWrapper, { props: { disabled: true, label: 'Btn' } });
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled and shows spinner when loading', () => {
    render(ButtonWrapper, { props: { loading: true, label: 'Saving' } });
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn.querySelector('svg')).toBeInTheDocument();
  });

  it('calls onclick handler', async () => {
    const user = userEvent.setup();
    const onclick = vi.fn();
    render(ButtonWrapper, { props: { onclick, label: 'Go' } });
    await user.click(screen.getByRole('button'));
    expect(onclick).toHaveBeenCalledOnce();
  });

  it('renders as submit button when type is submit', () => {
    render(ButtonWrapper, { props: { type: 'submit', label: 'Submit' } });
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });
});
