import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EpistemicBadge } from '../src/components/EpistemicBadge';
import { Navbar } from '../src/components/Navbar';
import { CommandPalette } from '../src/components/CommandPalette';

const renderWithProviders = (ui: React.ReactNode) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('EpistemicBadge Component', () => {
  it('renders Statically Established badge with correct label and style', () => {
    render(<EpistemicBadge provenance="statically_established" />);
    expect(screen.getByText('Statically Established')).toBeDefined();
  });

  it('renders Framework Rule badge with correct label', () => {
    render(<EpistemicBadge provenance="framework_rule" />);
    expect(screen.getByText('Framework Rule')).toBeDefined();
  });

  it('renders Inferred badge with correct label', () => {
    render(<EpistemicBadge provenance="inferred" />);
    expect(screen.getByText('Inferred')).toBeDefined();
  });

  it('renders Unresolved / Unknown badge with correct label', () => {
    render(<EpistemicBadge provenance="unresolved" />);
    expect(screen.getByText('Unresolved / Unknown')).toBeDefined();
  });

  it('renders Runtime Verified badge with correct label', () => {
    render(<EpistemicBadge provenance="runtime_verified" />);
    expect(screen.getByText('Runtime Verified')).toBeDefined();
  });
});

describe('Navbar Component', () => {
  it('renders branding and triggers command palette callback on click', () => {
    const handleOpen = vi.fn();
    render(
      <BrowserRouter>
        <Navbar onOpenCommandPalette={handleOpen} />
      </BrowserRouter>
    );

    expect(screen.getByText('DiffBeacon')).toBeDefined();
    expect(screen.getByText('Behavioral Change Intelligence')).toBeDefined();

    const searchButton = screen.getByText('Search symbols, scenarios, diffs...');
    fireEvent.click(searchButton);
    expect(handleOpen).toHaveBeenCalledTimes(1);
  });
});

describe('CommandPalette Component', () => {
  it('renders search input and responds to queries when open', () => {
    const handleClose = vi.fn();
    renderWithProviders(<CommandPalette isOpen={true} onClose={handleClose} />);

    const input = screen.getByPlaceholderText(/Type a symbol, scenario, or view/i);
    expect(input).toBeDefined();

    // Type query
    fireEvent.change(input, { target: { value: 'serializer' } });
    expect(screen.getByText('EmployeeCreateSerializer')).toBeDefined();
  });

  it('does not render when isOpen is false', () => {
    renderWithProviders(<CommandPalette isOpen={false} onClose={() => {}} />);

    expect(screen.queryByPlaceholderText(/Type a symbol, scenario, or view/i)).toBeNull();
  });
});
