import React from 'react';
import { apiPost } from '@/app/api';
import { EntityForm } from './EntityForm';

const fields = [
  { label: 'Name', name: 'name', required: true },
  { label: 'Date of Birth', name: 'dateOfBirth', type: 'date', required: true },
];

export function NewPatientForm({ onSuccess }: { onSuccess?: () => void }) {
  async function handleSubmit(data: Record<string, any>) {
    await apiPost('/patients', data);
    if (onSuccess) onSuccess();
  }
  return (
    <main className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add New Patient</h1>
      <EntityForm fields={fields} onSubmit={handleSubmit} submitLabel="Add Patient" />
    </main>
  );
} 