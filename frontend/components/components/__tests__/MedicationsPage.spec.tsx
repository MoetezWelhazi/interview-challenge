import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MedicationsPage from '../../../app/medications/page';
import '@testing-library/jest-dom';

jest.mock('../../../app/api', () => ({
  apiGet: jest.fn(),
}));
jest.mock('../../../app/hooks/useDebounce', () => ({
  useDebounce: (v: string) => v,
}));

const mockMedications = [
  { id: 1, name: 'Aspirin', dosage: '100mg', frequency: 'Daily' },
  { id: 2, name: 'Ibuprofen', dosage: '200mg', frequency: 'Twice daily' },
  { id: 3, name: 'Paracetamol', dosage: '500mg', frequency: 'Once daily' },
];

import { apiGet } from '../../../app/api';
(apiGet as jest.Mock).mockImplementation((url: string) => {
  if (url === '/medications') return Promise.resolve(mockMedications);
  return Promise.resolve([]);
});

describe('MedicationsPage', () => {
  it('renders medication list', async () => {
    render(<MedicationsPage />);
    expect(await screen.findByText('Aspirin')).toBeInTheDocument();
    expect(screen.getByText('Ibuprofen')).toBeInTheDocument();
    expect(screen.getByText('Paracetamol')).toBeInTheDocument();
  });

  it('filters medications by search', async () => {
    render(<MedicationsPage />);
    const search = screen.getByPlaceholderText('Search medications...');
    fireEvent.change(search, { target: { value: 'ibu' } });
    await waitFor(() => {
      expect(screen.getByText('Ibuprofen')).toBeInTheDocument();
      expect(screen.queryByText('Aspirin')).not.toBeInTheDocument();
      expect(screen.queryByText('Paracetamol')).not.toBeInTheDocument();
    });
  });

  it('sorts medications by name, dosage, and frequency', async () => {
    render(<MedicationsPage />);
    // Default sort by name asc
    await screen.findByText('Aspirin');
    let items = screen.getAllByRole('listitem').filter(li => !li.textContent?.includes('No medications found'));
    expect(items[0]).toHaveTextContent('Aspirin');
    expect(items[1]).toHaveTextContent('Ibuprofen');
    expect(items[2]).toHaveTextContent('Paracetamol');
    // Sort by dosage
    fireEvent.change(screen.getByDisplayValue('Name'), { target: { value: 'dosage' } });
    await waitFor(() => {
      const sorted = screen.getAllByRole('listitem').filter(li => !li.textContent?.includes('No medications found'));
      expect(sorted[0]).toHaveTextContent('Aspirin'); // 100mg
      expect(sorted[1]).toHaveTextContent('Ibuprofen'); // 200mg
      expect(sorted[2]).toHaveTextContent('Paracetamol'); // 500mg
    });
    // Sort by frequency
    fireEvent.change(screen.getByDisplayValue('Dosage'), { target: { value: 'frequency' } });
    await waitFor(() => {
      const sorted = screen.getAllByRole('listitem').filter(li => !li.textContent?.includes('No medications found'));
      expect(sorted[0]).toHaveTextContent('Aspirin'); // Daily
      expect(sorted[1]).toHaveTextContent('Paracetamol'); // Once daily
      expect(sorted[2]).toHaveTextContent('Ibuprofen'); // Twice daily
    });
  });

  it('toggles sort direction', async () => {
    render(<MedicationsPage />);
    // Default asc
    await screen.findByText('Aspirin');
    let items = screen.getAllByRole('listitem').filter(li => !li.textContent?.includes('No medications found'));
    expect(items[0]).toHaveTextContent('Aspirin');
    // Toggle to desc
    fireEvent.click(screen.getByRole('button', { name: /toggle sort direction/i }));
    await waitFor(() => {
      items = screen.getAllByRole('listitem').filter(li => !li.textContent?.includes('No medications found'));
      expect(items[0]).toHaveTextContent('Paracetamol');
    });
  });
}); 