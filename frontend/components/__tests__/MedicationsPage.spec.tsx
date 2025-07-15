import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MedicationsPage } from '../MedicationsPage';
import '@testing-library/jest-dom';

jest.mock('../../app/api', () => ({
  apiGet: jest.fn(),
  apiPatch: jest.fn(),
}));
jest.mock('../../app/hooks/useDebounce', () => ({
  useDebounce: (v: string) => v,
}));

global.fetch = jest.fn();
window.confirm = jest.fn(() => true);
window.alert = jest.fn();

const mockMedications = [
  { id: 1, name: 'Aspirin', dosage: '100mg', frequency: 'Daily' },
  { id: 2, name: 'Ibuprofen', dosage: '200mg', frequency: 'Twice daily' },
  { id: 3, name: 'Paracetamol', dosage: '500mg', frequency: 'Once daily' },
];

import { apiGet, apiPatch } from '../../app/api';
(apiGet as jest.Mock).mockImplementation((url: string) => {
  if (url === '/medications') return Promise.resolve(mockMedications);
  return Promise.resolve([]);
});
(apiPatch as jest.Mock).mockImplementation((url, data) => {
  const id = Number(url.split('/').pop());
  return Promise.resolve({ ...mockMedications.find(m => m.id === id), ...data });
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

  it('allows editing a medication', async () => {
    render(<MedicationsPage initialMedications={mockMedications} />);
    fireEvent.click(await screen.findByRole('button', { name: /edit aspirin/i }));
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Aspirin Updated' } });
    fireEvent.change(screen.getByLabelText('Dosage'), { target: { value: '150mg' } });
    fireEvent.change(screen.getByLabelText('Frequency'), { target: { value: 'Twice daily' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => {
      const updatedRow = screen.getAllByText('Aspirin Updated')[0].closest('li');
      expect(updatedRow).toHaveTextContent('Aspirin Updated');
      expect(updatedRow).toHaveTextContent('150mg');
      expect(updatedRow).toHaveTextContent('Twice daily');
    });
  });

  it('allows deleting a medication', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
    render(<MedicationsPage initialMedications={mockMedications} />);
    fireEvent.click(await screen.findByRole('button', { name: /delete ibuprofen/i }));
    await waitFor(() => {
      expect(screen.queryByText('Ibuprofen')).not.toBeInTheDocument();
    });
  });
}); 