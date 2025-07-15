import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AssignmentsPage } from '../AssignmentsPage';
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

const mockAssignments = [
  { id: 1, patient: { name: 'Alice' }, medication: { name: 'Aspirin' }, startDate: '2024-06-01', days: 10, remainingDays: 5 },
  { id: 2, patient: { name: 'Bob' }, medication: { name: 'Ibuprofen' }, startDate: '2024-06-10', days: 5, remainingDays: 0 },
  { id: 3, patient: { name: 'Charlie' }, medication: { name: 'Paracetamol' }, startDate: '2024-06-05', days: 7, remainingDays: 2 },
];

import { apiGet, apiPatch } from '../../app/api';
(apiGet as jest.Mock).mockImplementation((url: string) => {
  if (url === '/assignments/remaining-days') return Promise.resolve(mockAssignments);
  return Promise.resolve([]);
});
(apiPatch as jest.Mock).mockImplementation((url, data) => {
  const id = Number(url.split('/').pop());
  return Promise.resolve({ ...mockAssignments.find(a => a.id === id), ...data });
});

describe('AssignmentsPage', () => {
  it('renders assignment list', async () => {
    render(<AssignmentsPage />);
    expect(await screen.findByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  it('filters assignments by search', async () => {
    render(<AssignmentsPage />);
    const search = screen.getByPlaceholderText('Search assignments...');
    fireEvent.change(search, { target: { value: 'ibu' } });
    await waitFor(() => {
      expect(screen.getByText('Ibuprofen')).toBeInTheDocument();
      expect(screen.queryByText('Aspirin')).not.toBeInTheDocument();
      expect(screen.queryByText('Paracetamol')).not.toBeInTheDocument();
    });
  });

  it('sorts assignments by patient, medication, start date, days, and remaining days', async () => {
    render(<AssignmentsPage />);
    await screen.findByText('Alice');
    let items = screen.getAllByRole('listitem').filter(li => !li.textContent?.includes('No assignments found'));
    // Default sort by patient asc
    expect(items[0]).toHaveTextContent('Alice');
    expect(items[1]).toHaveTextContent('Bob');
    expect(items[2]).toHaveTextContent('Charlie');
    // Sort by medication
    fireEvent.change(screen.getByDisplayValue('Patient'), { target: { value: 'medication' } });
    await waitFor(() => {
      const sorted = screen.getAllByRole('listitem').filter(li => !li.textContent?.includes('No assignments found'));
      expect(sorted[0]).toHaveTextContent('Aspirin');
      expect(sorted[1]).toHaveTextContent('Ibuprofen');
      expect(sorted[2]).toHaveTextContent('Paracetamol');
    });
    // Sort by start date
    fireEvent.change(screen.getByDisplayValue('Medication'), { target: { value: 'startDate' } });
    await waitFor(() => {
      const sorted = screen.getAllByRole('listitem').filter(li => !li.textContent?.includes('No assignments found'));
      expect(sorted[0]).toHaveTextContent('Alice'); // 2024-06-01
      expect(sorted[1]).toHaveTextContent('Charlie'); // 2024-06-05
      expect(sorted[2]).toHaveTextContent('Bob'); // 2024-06-10
    });
    // Sort by days
    fireEvent.change(screen.getByDisplayValue('Start Date'), { target: { value: 'days' } });
    await waitFor(() => {
      const sorted = screen.getAllByRole('listitem').filter(li => !li.textContent?.includes('No assignments found'));
      expect(sorted[0]).toHaveTextContent('Bob'); // 5
      expect(sorted[1]).toHaveTextContent('Charlie'); // 7
      expect(sorted[2]).toHaveTextContent('Alice'); // 10
    });
    // Sort by remaining days
    fireEvent.change(screen.getByDisplayValue('Days'), { target: { value: 'remainingDays' } });
    await waitFor(() => {
      const sorted = screen.getAllByRole('listitem').filter(li => !li.textContent?.includes('No assignments found'));
      expect(sorted[0]).toHaveTextContent('Bob'); // 0
      expect(sorted[1]).toHaveTextContent('Charlie'); // 2
      expect(sorted[2]).toHaveTextContent('Alice'); // 5
    });
  });

  it('toggles sort direction', async () => {
    render(<AssignmentsPage />);
    await screen.findByText('Alice');
    let items = screen.getAllByRole('listitem').filter(li => !li.textContent?.includes('No assignments found'));
    expect(items[0]).toHaveTextContent('Alice');
    // Toggle to desc
    fireEvent.click(screen.getByRole('button', { name: /toggle sort direction/i }));
    await waitFor(() => {
      items = screen.getAllByRole('listitem').filter(li => !li.textContent?.includes('No assignments found'));
      expect(items[0]).toHaveTextContent('Charlie');
    });
  });

  it('allows editing an assignment', async () => {
    render(<AssignmentsPage initialAssignments={mockAssignments} />);
    fireEvent.click(await screen.findByRole('button', { name: /edit alice aspirin/i }));
    fireEvent.change(screen.getByLabelText('Days'), { target: { value: '15' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => {
      const updatedRow = screen.getAllByText('Alice')[0].closest('li');
      expect(updatedRow).toHaveTextContent('Days: 15');
    });
  });

  it('allows deleting an assignment', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
    render(<AssignmentsPage initialAssignments={mockAssignments} />);
    fireEvent.click(await screen.findByRole('button', { name: /delete bob ibuprofen/i }));
    await waitFor(() => {
      expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    });
  });
}); 