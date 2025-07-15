import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NewMedicationForm } from '../NewMedicationForm';
import '@testing-library/jest-dom';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock('../../app/api', () => ({
  apiPost: jest.fn(),
}));

import { apiPost } from '../../app/api';

describe('NewMedicationForm', () => {
  it('renders form fields', () => {
    render(<NewMedicationForm />);
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Dosage')).toBeInTheDocument();
    expect(screen.getByLabelText('Frequency')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add medication/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<NewMedicationForm />);
    fireEvent.click(screen.getByRole('button', { name: /add medication/i }));
    // Should not call apiPost if required fields are empty
    await waitFor(() => {
      expect(apiPost).not.toHaveBeenCalled();
    });
  });

  it('submits form with valid data', async () => {
    (apiPost as jest.Mock).mockResolvedValueOnce({});
    render(<NewMedicationForm />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Aspirin' } });
    fireEvent.change(screen.getByLabelText('Dosage'), { target: { value: '100mg' } });
    fireEvent.change(screen.getByLabelText('Frequency'), { target: { value: 'Daily' } });
    fireEvent.click(screen.getByRole('button', { name: /add medication/i }));
    await waitFor(() => {
      expect(apiPost).toHaveBeenCalledWith('/medications', { name: 'Aspirin', dosage: '100mg', frequency: 'Daily' });
    });
  });
}); 