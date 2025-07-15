"use client";
import React from 'react';
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { apiGet, apiPatch, apiPost, apiDelete } from "@/app/api";
import { NewPatientForm } from '@/components/NewPatientForm';
import { NewAssignmentForm } from '@/components/NewAssignmentForm';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/Button';

interface Assignment {
  id: number;
  medication: { name: string };
  startDate: string;
  days: number;
  remainingDays?: number;
}

interface Patient {
  id: number;
  name: string;
  dateOfBirth: string;
}

export function PatientsMasterDetail({ patients, defaultPatientId }: { patients: Patient[]; defaultPatientId?: number }) {
  const [selectedId, setSelectedId] = useState<number | undefined>(defaultPatientId);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDob, setEditDob] = useState("");
  const [patientList, setPatientList] = useState<Patient[]>(patients);
  const debouncedSearch = useDebounce(search, 300);
  const [showModal, setShowModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentPage, setAssignmentPage] = useState(1);
  const ASSIGNMENTS_PER_PAGE = 5;
  const [assignmentSortDir, setAssignmentSortDir] = useState<'asc' | 'desc'>('desc');
  const sortedAssignments = [...assignments].sort((a, b) => {
    if (assignmentSortDir === 'asc') {
      return (a.remainingDays ?? 0) - (b.remainingDays ?? 0);
    } else {
      return (b.remainingDays ?? 0) - (a.remainingDays ?? 0);
    }
  });
  const paginatedAssignments = sortedAssignments.slice((assignmentPage - 1) * ASSIGNMENTS_PER_PAGE, assignmentPage * ASSIGNMENTS_PER_PAGE);
  const totalAssignmentPages = Math.ceil(assignments.length / ASSIGNMENTS_PER_PAGE);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    apiGet(`/patients/${selectedId}/assignments/remaining-days`)
      .then(data => {
        setAssignments(data);
        setAssignmentPage(1); // Reset to first page on patient change
      })
      .finally(() => setLoading(false));
  }, [selectedId]);

  const filteredPatients = patientList.filter(p =>
    p.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const startEdit = (p: Patient) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditDob(p.dateOfBirth);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDob("");
  };

  const saveEdit = async (id: number) => {
    try {
      const updated = await apiPatch(`/patients/${id}`, { name: editName, dateOfBirth: editDob });
      setPatientList(list => list.map(p => p.id === id ? { ...p, ...updated } : p));
      cancelEdit();
    } catch (e) {
      alert("Failed to update patient");
    }
  };

  const deletePatient = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await apiDelete(`/patients/${id}`);
      setPatientList(list => list.filter(p => p.id !== id));
      if (selectedId === id) setSelectedId(undefined);
    } catch (e) {
      alert("Failed to delete patient");
    }
  };

  const handlePatientCreated = async () => {
    setShowModal(false);
    // Refresh patient list
    const updated = await apiGet('/patients');
    setPatientList(updated);
  };

  const handleAssignmentCreated = async () => {
    setShowAssignmentModal(false);
    if (selectedId) {
      setLoading(true);
      apiGet(`/patients/${selectedId}/assignments/remaining-days`).then(setAssignments).finally(() => setLoading(false));
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 h-full">
      {/* Master: Patients List */}
      <aside className="md:w-64 w-full bg-white rounded shadow p-2 md:p-4 overflow-y-auto max-h-[60vh] md:max-h-none">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold">Patients</h2>
          <Button
            className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors text-xs"
            onClick={() => setShowModal(true)}
          >
            + Add Patient
          </Button>
        </div>
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full mb-2 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Search patients by name"
        />
        <ul className="divide-y divide-gray-200">
          {filteredPatients.map((p) => (
            <li key={p.id}>
              {editingId === p.id ? (
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    saveEdit(p.id);
                  }}
                  className="space-y-1 p-2 bg-blue-50 rounded"
                >
                  <input
                    aria-label="Name"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full px-1 py-0.5 border rounded"
                  />
                  <input
                    aria-label="Date of Birth"
                    type="date"
                    value={editDob}
                    onChange={e => setEditDob(e.target.value)}
                    className="w-full px-1 py-0.5 border rounded"
                  />
                  <div className="flex gap-2 mt-1">
                    <button type="submit" className="cursor-pointer bg-blue-600 text-white px-2 py-1 rounded" aria-label="save">Save</button>
                    <button type="button" onClick={cancelEdit} className="cursor-pointer bg-gray-300 px-2 py-1 rounded">Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between">
                  <button
                    className={`w-full text-left px-2 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${selectedId === p.id ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"}`}
                    onClick={() => setSelectedId(p.id)}
                    aria-current={selectedId === p.id ? "true" : undefined}
                  >
                    <div>{p.name}</div>
                    <div className="text-xs text-gray-500">DOB: {p.dateOfBirth}</div>
                  </button>
                  <Button
                    className="ml-2 text-blue-600 hover:underline"
                    onClick={() => startEdit(p)}
                    aria-label={`edit ${p.name.toLowerCase()}`}
                  >
                      <PencilSquareIcon className="h-6 w-6 text-sky-500" />
                  </Button>
                  <Button
                    className="ml-2 text-red-600 hover:underline"
                    onClick={() => deletePatient(p.id, p.name)}
                    aria-label={`delete ${p.name.toLowerCase()}`}
                  >
                    <TrashIcon className="h-6 w-6 text-red-500" />
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
        {filteredPatients.length === 0 && (
          <div className="text-gray-400 text-sm mt-4">No patients found.</div>
        )}
      </aside>
      {/* Detail: Assignments */}
      <section className="flex-1 bg-white rounded shadow p-4 min-h-[300px]">
        {selectedId ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold">Assignments</h2>
              <div className="flex items-center gap-2">
                <Button
                  className="px-2 py-1 rounded border text-xs"
                  onClick={() => setAssignmentSortDir(d => d === 'asc' ? 'desc' : 'asc')}
                  aria-label="Toggle sort order"
                >
                  Sort by Remaining {assignmentSortDir === 'asc' ? '↑' : '↓'}
                </Button>
                <Button
                  className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors text-xs"
                  onClick={() => setShowAssignmentModal(true)}
                >
                  + Add Assignment
                </Button>
              </div>
            </div>
            {loading ? (
              <div>Loading...</div>
            ) : assignments.length ? (
              <>
                <ul className="space-y-2">
                  {paginatedAssignments.map((a) => (
                    <li key={a.id} className={`p-3 rounded border ${a.remainingDays === 0 ? "bg-gray-100 text-gray-500" : "bg-green-50 border-green-200"}`}>
                      <div className="font-semibold">{a.medication?.name}</div>
                      <div className="text-xs">Start: {a.startDate} | Days: {a.days}</div>
                      <div className="text-xs">
                        Remaining: <span className="font-mono">{a.remainingDays}</span> — 
                        <span className={
                          a.remainingDays === 0
                            ? "bg-gray-200 text-gray-600 rounded px-2 py-0.5 text-xs font-semibold inline-block"
                            : "bg-green-100 text-green-800 rounded px-2 py-0.5 text-xs font-semibold inline-block ml-1"
                        }>
                          {a.remainingDays === 0 ? "Completed" : "Active"}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
                {totalAssignmentPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-4">
                    <Button
                      className="px-2 py-1 rounded border"
                      onClick={() => setAssignmentPage(p => Math.max(1, p - 1))}
                      disabled={assignmentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">Page {assignmentPage} of {totalAssignmentPages}</span>
                    <Button
                      className="px-2 py-1 rounded border"
                      onClick={() => setAssignmentPage(p => Math.min(totalAssignmentPages, p + 1))}
                      disabled={assignmentPage === totalAssignmentPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-gray-400">No assignments for this patient.</div>
            )}
          </>
        ) : (
          <div className="text-gray-400">Select a patient to view assignments.</div>
        )}
      </section>
      {/* Modal for new patient */}
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
            <NewPatientForm onSuccess={handlePatientCreated} />
          </div>
        </div>
      )}
      {/* Modal for new assignment */}
      {showAssignmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-40"
            onClick={() => setShowAssignmentModal(false)}
            aria-label="Close modal overlay"
          />
          <div className="bg-white rounded shadow-lg max-w-md w-full relative z-50">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl"
              onClick={() => setShowAssignmentModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <NewAssignmentForm onSuccess={handleAssignmentCreated} preselectedPatientId={selectedId} />
          </div>
        </div>
      )}
    </div>
  );
} 