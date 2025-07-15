import React from 'react';
import { render, screen } from '@testing-library/react';
import { Sidebar } from '../Sidebar';
import '@testing-library/jest-dom';

describe('Sidebar', () => {
  it('renders all navigation links', () => {
    render(<Sidebar />);
    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
    expect(screen.getByText('Patients')).toBeInTheDocument();
    expect(screen.getByText('Medications')).toBeInTheDocument();
    expect(screen.getByText('Assignments')).toBeInTheDocument();
  });

  it('all links have correct hrefs', () => {
    render(<Sidebar />);
    expect(screen.getByText('Patients').closest('a')).toHaveAttribute('href', '/patients');
    expect(screen.getByText('Medications').closest('a')).toHaveAttribute('href', '/medications');
    expect(screen.getByText('Assignments').closest('a')).toHaveAttribute('href', '/assignments');
  });
}); 