import React, { useEffect, useState } from 'react';
import { apiGet, apiPatch, apiDelete } from '@/app/api';
import { useDebounce } from '@/hooks/useDebounce';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';
import { Skeleton } from "./Skeleton";

interface Assignment {
  id: number;
  patient: { name: string };
  medication: { name: string };
  startDate: string;
  days: number;
  remainingDays?: number;
}

const sortOptions = [
  { label: 'Patient', value: 'patient' },
  { label: 'Medication', value: 'medication' },
  { label: 'Start Date', value: 'startDate' },
  { label: 'Days', value: 'days' },
  { label: 'Remaining Days', value: 'remainingDays' },
];

export function AssignmentsPage({ initialAssignments = [] }: { initialAssignments?: Assignment[] }) {
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('patient');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDays, setEditDays] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [loading, setLoading] = useState(initialAssignments.length === 0);

  useEffect(() => {
    if (initialAssignments.length === 0) {
      apiGet('/assignments/remaining-days').then(data => {
        setAssignments(data);
        setLoading(false);
      });
    }
  }, [initialAssignments]);

  const filtered = assignments.filter(a =>
    a.patient.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    a.medication.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    a.startDate.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    let aVal: string | number = '';
    let bVal: string | number = '';
    switch (sortBy) {
      case 'patient':
        aVal = a.patient.name.toLowerCase();
        bVal = b.patient.name.toLowerCase();
        break;
      case 'medication':
        aVal = a.medication.name.toLowerCase();
        bVal = b.medication.name.toLowerCase();
        break;
      case 'startDate':
        aVal = a.startDate;
        bVal = b.startDate;
        break;
      case 'days':
        aVal = a.days;
        bVal = b.days;
        break;
      case 'remainingDays':
        aVal = a.remainingDays ?? 0;
        bVal = b.remainingDays ?? 0;
        break;
    }
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const startEdit = (a: Assignment) => {
    setEditingId(a.id);
    setEditDays(a.days.toString());
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDays('');
  };

  const saveEdit = async (id: number) => {
    try {
      const updated = await apiPatch(`/assignments/${id}`, { days: Number(editDays) });
      setAssignments(list => list.map(a => a.id === id ? { ...a, ...updated } : a));
      cancelEdit();
    } catch (e) {
      alert('Failed to update assignment');
    }
  };

  const deleteAssignment = async (id: number, patient: string, medication: string) => {
    if (!window.confirm(`Are you sure you want to delete the assignment for ${patient} - ${medication}?`)) return;
    try {
      await apiDelete(`/assignments/${id}`);
      setAssignments(list => list.filter(a => a.id !== id));
    } catch (e) {
      alert('Failed to delete assignment');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Assignments</h1>
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search assignments..."
          className="flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="px-2 py-1 border rounded"
        >
          {sortOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <Button
          onClick={() => setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))}
          className="px-2 py-1 border rounded"
          aria-label="Toggle sort direction"
        >
          {sortDir === 'asc' ? '↑' : '↓'}
        </Button>
      </div>
      <ul className="divide-y divide-gray-200 bg-white rounded shadow">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="p-3 flex flex-col md:flex-row md:items-center md:gap-4">
              <Skeleton width="20%" height={24} className="mb-2 md:mb-0" />
              <Skeleton width="20%" height={24} className="mb-2 md:mb-0" />
              <Skeleton width="20%" height={24} className="mb-2 md:mb-0" />
              <Skeleton width="20%" height={24} className="mb-2 md:mb-0" />
              <Skeleton width="20%" height={24} className="mb-2 md:mb-0" />
            </li>
          ))
        ) : (
          sorted.map(a => (
            <li key={a.id} className="p-3 flex flex-col md:flex-row md:items-center md:gap-4 min-w-0">
              {editingId === a.id ? (
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    saveEdit(a.id);
                  }}
                  className="flex flex-col md:flex-row md:items-center md:gap-2 w-full min-w-0"
                >
                  <div className="flex flex-1 min-w-0 gap-2">
                    <span className="font-semibold flex-1 min-w-0">{a.patient.name}</span>
                    <span className="flex-1 min-w-0">{a.medication.name}</span>
                    <span className="text-sm text-gray-600 flex-1 min-w-0">{a.startDate}</span>
                    <input
                      aria-label="Days"
                      type="number"
                      value={editDays}
                      onChange={e => setEditDays(e.target.value)}
                      className="flex-1 min-w-0 px-1 py-0.5 border rounded"
                    />
                    <span className="text-sm text-gray-600 flex-1 min-w-0">{a.remainingDays}</span>
                  </div>
                  <div className="flex gap-2 ml-2 flex-shrink-0">
                    <button type="submit" className="cursor-pointer bg-blue-600 text-white px-2 py-1 rounded" aria-label="save">Save</button>
                    <button type="button" onClick={cancelEdit} className="cursor-pointer bg-gray-300 px-2 py-1 rounded">Cancel</button>
                  </div>
                </form>
              ) : (
                <>
                  <span className="font-semibold flex-1">{a.patient.name}</span>
                  <span className="flex-1">{a.medication.name}</span>
                  <span className="text-sm text-gray-600 flex-1">{a.startDate}</span>
                  <span className="text-sm text-gray-600 flex-1">Days: {a.days}</span>
                  <span className="text-sm text-gray-600 flex-1">{a.remainingDays}</span>
                  <Button
                    className="ml-2 text-blue-600 hover:underline"
                    onClick={() => startEdit(a)}
                    aria-label={`edit ${a.patient.name.toLowerCase()} ${a.medication.name.toLowerCase()}`}
                  >
                    <PencilSquareIcon className="h-6 w-6 text-blue-500" />
                  </Button>
                  <Button
                    className="ml-2 text-red-600 hover:underline"
                    onClick={() => deleteAssignment(a.id, a.patient.name, a.medication.name)}
                    aria-label={`delete ${a.patient.name.toLowerCase()} ${a.medication.name.toLowerCase()}`}
                  >
                    <TrashIcon className="h-6 w-6 text-red-500" />
                  </Button>
                </>
              )}
            </li>
          ))
        )}
        {sorted.length === 0 && (
          <li className="p-3 text-gray-400">No assignments found.</li>
        )}
      </ul>
    </div>
  );
} 