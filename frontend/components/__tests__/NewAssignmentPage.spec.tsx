import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NewAssignmentPage from '../../app/assignments/new/page';
import '@testing-library/jest-dom';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock('../../app/api', () => ({
  apiPost: jest.fn(),
  apiGet: jest.fn(),
}));

import { apiPost, apiGet } from '../../app/api';

const mockPatients = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];
const mockMedications = [
  { id: 10, name: 'Aspirin' },
  { id: 20, name: 'Ibuprofen' },
];

(apiGet as jest.Mock).mockImplementation((url: string) => {
  if (url === '/patients') return Promise.resolve(mockPatients);
  if (url === '/medications') return Promise.resolve(mockMedications);
  return Promise.resolve([]);
});

describe('NewAssignmentPage', () => {
  it('renders form fields after loading', async () => {
    render(<NewAssignmentPage />);
    expect(await screen.findByLabelText('Patient')).toBeInTheDocument();
    expect(screen.getByLabelText('Medication')).toBeInTheDocument();
    expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Days')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /assign/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<NewAssignmentPage />);
    await screen.findByLabelText('Patient');
    fireEvent.click(screen.getByRole('button', { name: /assign/i }));
    await waitFor(() => {
      expect(apiPost).not.toHaveBeenCalled();
    });
  });

  it('submits form with valid data', async () => {
    (apiPost as jest.Mock).mockResolvedValueOnce({});
    render(<NewAssignmentPage />);
    fireEvent.change(await screen.findByLabelText('Patient'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Medication'), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText('Start Date'), { target: { value: '2024-06-01' } });
    fireEvent.change(screen.getByLabelText('Days'), { target: { value: '7' } });
    fireEvent.click(screen.getByRole('button', { name: /assign/i }));
    await waitFor(() => {
      expect(apiPost).toHaveBeenCalledWith('/assignments', {
        patientId: 1,
        medicationId: 10,
        startDate: '2024-06-01',
        days: 7,
      });
    });
  });
}); 