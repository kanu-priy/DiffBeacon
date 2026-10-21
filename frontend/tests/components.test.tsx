import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { EpistemicBadge } from '../src/components/EpistemicBadge';

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
