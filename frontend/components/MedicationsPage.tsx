import React, { useEffect, useState } from 'react';
import { apiGet, apiPatch, apiDelete } from '@/app/api';
import { useDebounce } from '@/hooks/useDebounce';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';
import { Skeleton } from "./Skeleton";
import { NewMedicationForm } from './NewMedicationForm';

interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
}

const sortOptions = [
  { label: 'Name', value: 'name' },
  { label: 'Dosage', value: 'dosage' },
  { label: 'Frequency', value: 'frequency' },
];

export function MedicationsPage({ initialMedications = [] }: { initialMedications?: Medication[] }) {
  const [medications, setMedications] = useState<Medication[]>(initialMedications);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editDosage, setEditDosage] = useState('');
  const [editFrequency, setEditFrequency] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [loading, setLoading] = useState(initialMedications.length === 0);
  const [medicationPage, setMedicationPage] = useState(1);
  const [medicationsPerPage, setMedicationsPerPage] = useState(5);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (initialMedications.length === 0) {
      apiGet('/medications').then(data => {
        setMedications(data);
        setLoading(false);
        setMedicationPage(1); // Reset to first page on data load
      });
    }
  }, [initialMedications]);

  const filtered = medications.filter(m =>
    m.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    m.dosage.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    m.frequency.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    let aVal = '';
    let bVal = '';
    switch (sortBy) {
      case 'name':
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
        break;
      case 'dosage':
        aVal = a.dosage.toLowerCase();
        bVal = b.dosage.toLowerCase();
        break;
      case 'frequency':
        aVal = a.frequency.toLowerCase();
        bVal = b.frequency.toLowerCase();
        break;
    }
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });
  const totalMedicationPages = Math.ceil(sorted.length / medicationsPerPage);
  const paginatedMedications = sorted.slice((medicationPage - 1) * medicationsPerPage, medicationPage * medicationsPerPage);

  const startEdit = (m: Medication) => {
    setEditingId(m.id);
    setEditName(m.name);
    setEditDosage(m.dosage);
    setEditFrequency(m.frequency);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditDosage('');
    setEditFrequency('');
  };

  const saveEdit = async (id: number) => {
    try {
      const updated = await apiPatch(`/medications/${id}`, { name: editName, dosage: editDosage, frequency: editFrequency });
      setMedications(list => list.map(m => m.id === id ? { ...m, ...updated } : m));
      cancelEdit();
    } catch (e) {
      alert('Failed to update medication');
    }
  };

  const deleteMedication = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await apiDelete(`/medications/${id}`);
      setMedications(list => list.filter(m => m.id !== id));
    } catch (e) {
      alert('Failed to delete medication');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Medications</h1>
        <Button
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors text-sm"
          onClick={() => setShowModal(true)}
        >
          + Add Medication
        </Button>
      </div>
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search medications..."
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
        <select
          value={medicationsPerPage}
          onChange={e => {
            setMedicationsPerPage(Number(e.target.value));
            setMedicationPage(1); // Reset to first page when page size changes
          }}
          className="px-2 py-1 border rounded"
        >
          {[5, 10, 15, 25, 50].map(size => (
            <option key={size} value={size}>{size} / page</option>
          ))}
        </select>
      </div>
      <ul className="divide-y divide-gray-200 bg-white rounded shadow">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="p-3 flex flex-col md:flex-row md:items-center md:gap-4">
              <Skeleton width="30%" height={24} className="mb-2 md:mb-0" />
              <Skeleton width="20%" height={24} className="mb-2 md:mb-0" />
              <Skeleton width="20%" height={24} className="mb-2 md:mb-0" />
            </li>
          ))
        ) : (
          paginatedMedications.map(m => (
            <li key={m.id} className="p-3 flex flex-col md:flex-row md:items-center md:gap-4 min-w-0">
              {editingId === m.id ? (
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    saveEdit(m.id);
                  }}
                  className="flex flex-col md:flex-row md:items-center md:gap-2 w-full min-w-0"
                >
                  <div className="flex flex-1 min-w-0 gap-2">
                    <input
                      aria-label="Name"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="flex-1 min-w-0 px-1 py-0.5 border rounded"
                    />
                    <input
                      aria-label="Dosage"
                      value={editDosage}
                      onChange={e => setEditDosage(e.target.value)}
                      className="flex-1 min-w-0 px-1 py-0.5 border rounded"
                    />
                    <input
                      aria-label="Frequency"
                      value={editFrequency}
                      onChange={e => setEditFrequency(e.target.value)}
                      className="flex-1 min-w-0 px-1 py-0.5 border rounded"
                    />
                  </div>
                  <div className="flex gap-2 ml-2 flex-shrink-0">
                    <button type="submit" className="cursor-pointer bg-blue-600 text-white px-2 py-1 rounded" aria-label="save">Save</button>
                    <button type="button" onClick={cancelEdit} className="cursor-pointer bg-gray-300 px-2 py-1 rounded">Cancel</button>
                  </div>
                </form>
              ) : (
                <>
                  <span className="font-semibold flex-1">{m.name}</span>
                  <span className="text-sm text-gray-600 flex-1">{m.dosage}</span>
                  <span className="text-sm text-gray-600 flex-1">{m.frequency}</span>
                  <Button
                    className="ml-2 text-blue-600 hover:text-blue-800"
                    onClick={() => startEdit(m)}
                    aria-label={`edit ${m.name.toLowerCase()}`}
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </Button>
                  <Button
                    className="ml-2 text-red-600 hover:text-red-800"
                    onClick={() => deleteMedication(m.id, m.name)}
                    aria-label={`delete ${m.name.toLowerCase()}`}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </Button>
                </>
              )}
            </li>
          ))
        )}
        {sorted.length === 0 && (
          <li className="p-3 text-gray-400">No medications found.</li>
        )}
      </ul>
      {totalMedicationPages > 1 && !loading && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <Button
            className="px-2 py-1 rounded border"
            onClick={() => setMedicationPage(p => Math.max(1, p - 1))}
            disabled={medicationPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm">Page {medicationPage} of {totalMedicationPages}</span>
          <Button
            className="px-2 py-1 rounded border"
            onClick={() => setMedicationPage(p => Math.min(totalMedicationPages, p + 1))}
            disabled={medicationPage === totalMedicationPages}
          >
            Next
          </Button>
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay first, lower z-index */}
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-40"
            onClick={() => setShowModal(false)}
            aria-label="Close modal overlay"
          />
          {/* Modal content, higher z-index */}
          <div className="bg-white rounded shadow-lg max-w-md w-full relative z-50">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <NewMedicationForm onSuccess={() => {
              setShowModal(false);
              apiGet('/medications').then(setMedications);
            }} />
          </div>
        </div>
      )}
    </div>
  );
} 