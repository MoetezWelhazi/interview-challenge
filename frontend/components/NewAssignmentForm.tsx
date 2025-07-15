import React, { useEffect, useState } from 'react';
import { apiPost, apiGet } from '@/app/api';
import { EntityForm } from './EntityForm';
import { Skeleton } from "./Skeleton";

export function NewAssignmentForm({ onSuccess, preselectedPatientId }: { onSuccess?: () => void, preselectedPatientId?: number }) {
  const [patients, setPatients] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [defaultForm, setDefaultForm] = useState<Record<string, any>>({});

  useEffect(() => {
    async function fetchData() {
      const pats = await apiGet('/patients');
      const meds = await apiGet('/medications');
      setPatients(pats);
      setMedications(meds);
      // Set default form values if preselectedPatientId is provided
      if (preselectedPatientId) {
        setDefaultForm({ patientId: preselectedPatientId });
      }
      setLoading(false);
    }
    fetchData();
  }, [preselectedPatientId]);

  const fields = [
    {
      label: 'Patient',
      name: 'patientId',
      type: 'select',
      options: patients.map((p) => ({ value: p.id, label: p.name })),
      required: true,
      disabled: !!preselectedPatientId,
    },
    {
      label: 'Medication',
      name: 'medicationId',
      type: 'select',
      options: medications.map((m) => ({ value: m.id, label: m.name })),
      required: true,
    },
    { label: 'Start Date', name: 'startDate', type: 'date', required: true },
    { label: 'Days', name: 'days', type: 'number', required: true },
  ];

  async function handleSubmit(data: Record<string, any>) {
    data.patientId = Number(data.patientId);
    data.medicationId = Number(data.medicationId);
    data.days = Number(data.days);
    await apiPost('/assignments', data);
    if (onSuccess) onSuccess();
  }

  if (loading) return <div className="p-4"><Skeleton width="100%" height={180} /></div>;

  return (
    <main className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Assign Medication to Patient</h1>
      <EntityForm fields={fields} onSubmit={handleSubmit} submitLabel="Assign" defaultValues={defaultForm} />
    </main>
  );
} 