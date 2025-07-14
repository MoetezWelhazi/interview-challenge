import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PatientsMasterDetail } from '../../../app/patients/PatientsMasterDetail';
import '@testing-library/jest-dom';

jest.mock('../../../app/api', () => ({
  apiGet: jest.fn(),
}));
jest.mock('../../../app/hooks/useDebounce', () => ({
  useDebounce: (v: string) => v,
}));

const mockPatients = [
  { id: 1, name: 'Alice Smith', dateOfBirth: '1990-01-01' },
  { id: 2, name: 'Bob Jones', dateOfBirth: '1985-05-05' },
];
const mockAssignments = [
  { id: 10, medication: { name: 'Aspirin' }, startDate: '2024-06-01', days: 10, remainingDays: 5 },
  { id: 11, medication: { name: 'Ibuprofen' }, startDate: '2024-06-10', days: 5, remainingDays: 0 },
];

import { apiGet } from '../../../app/api';
(apiGet as jest.Mock).mockImplementation((url: string) => {
  if (url === '/patients/1/assignments/remaining-days') return Promise.resolve(mockAssignments);
  if (url === '/patients/2/assignments/remaining-days') return Promise.resolve([]);
  return Promise.resolve([]);
});

describe('PatientsMasterDetail', () => {
  it('renders patient list and assignments', async () => {
    render(<PatientsMasterDetail patients={mockPatients} defaultPatientId={1} />);
    expect(await screen.findByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    // Default: first patient selected
    expect(await screen.findByText('Aspirin')).toBeInTheDocument();
    expect(screen.getByText('Ibuprofen')).toBeInTheDocument();
    expect(screen.getAllByText((content, node) => !!node && !!node.textContent && node.textContent.includes('Remaining:')).length).toBeGreaterThan(0);
  });

  it('filters patients by name', async () => {
    render(<PatientsMasterDetail patients={mockPatients} defaultPatientId={1} />);
    const search = screen.getByPlaceholderText('Search by name...');
    fireEvent.change(search, { target: { value: 'bob' } });
    await waitFor(() => {
      expect(screen.getByText('Bob Jones')).toBeInTheDocument();
      expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
    });
  });

  it('shows assignments for selected patient', async () => {
    render(<PatientsMasterDetail patients={mockPatients} defaultPatientId={1} />);
    // Click Bob (no assignments)
    fireEvent.click(await screen.findByText('Bob Jones'));
    await waitFor(() => {
      expect(screen.getByText('No assignments for this patient.')).toBeInTheDocument();
    });
    // Click Alice (has assignments)
    fireEvent.click(screen.getByText('Alice Smith'));
    await waitFor(() => {
      expect(screen.getByText('Aspirin')).toBeInTheDocument();
      expect(screen.getByText('Ibuprofen')).toBeInTheDocument();
    });
  });
}); 