"use client";

import { apiGet } from "@/app/api";
import React, { useEffect, useState } from "react";
import { PatientsMasterDetail } from "../../components/PatientsMasterDetail";
import { Skeleton } from "../../components/Skeleton";

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

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/patients").then((data) => {
      setPatients(data);
      setLoading(false);
    });
  }, []);

  if (loading || !patients) return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row gap-4 h-full">
        <aside className="md:w-1/3 md:w-64 w-full bg-white rounded shadow p-2 md:p-4 overflow-y-auto max-h-[60vh] md:max-h-none">
          <Skeleton width="100%" height={40} className="mb-2" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} width="100%" height={32} className="mb-2" />
          ))}
        </aside>
        <div className="flex-1 bg-white rounded shadow p-4 min-h-[300px]">
          <Skeleton width="60%" height={32} className="mb-4" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} width="100%" height={28} className="mb-3" />
          ))}
        </div>
      </div>
    </div>
  );
  const defaultPatientId = patients[0]?.id;
  return <PatientsMasterDetail patients={patients} defaultPatientId={defaultPatientId} />;
} 