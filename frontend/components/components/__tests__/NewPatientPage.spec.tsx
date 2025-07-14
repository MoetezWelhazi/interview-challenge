import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NewPatientPage from '../../../app/patients/new/page';
import '@testing-library/jest-dom';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock('../../../app/api', () => ({
  apiPost: jest.fn(),
}));

import { apiPost } from '../../../app/api';

describe('NewPatientPage', () => {
  it('renders form fields', () => {
    render(<NewPatientPage />);
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Date of Birth')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add patient/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<NewPatientPage />);
    fireEvent.click(screen.getByRole('button', { name: /add patient/i }));
    // Should not call apiPost if required fields are empty
    await waitFor(() => {
      expect(apiPost).not.toHaveBeenCalled();
    });
  });

  it('submits form with valid data', async () => {
    (apiPost as jest.Mock).mockResolvedValueOnce({});
    render(<NewPatientPage />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Alice' } });
    fireEvent.change(screen.getByLabelText('Date of Birth'), { target: { value: '1990-01-01' } });
    fireEvent.click(screen.getByRole('button', { name: /add patient/i }));
    await waitFor(() => {
      expect(apiPost).toHaveBeenCalledWith('/patients', { name: 'Alice', dateOfBirth: '1990-01-01' });
    });
  });
}); 