import React from 'react';
import { apiPost } from '@/app/api';
import { EntityForm } from './EntityForm';

const fields = [
  { label: 'Name', name: 'name', required: true },
  { label: 'Dosage', name: 'dosage', required: true },
  { label: 'Frequency', name: 'frequency', required: true },
];

export function NewMedicationForm({ onSuccess }: { onSuccess?: () => void }) {
  async function handleSubmit(data: Record<string, any>) {
    await apiPost('/medications', data);
    if (onSuccess) onSuccess();
  }
  return (
    <main className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add New Medication</h1>
      <EntityForm fields={fields} onSubmit={handleSubmit} submitLabel="Add Medication" />
    </main>
  );
} 