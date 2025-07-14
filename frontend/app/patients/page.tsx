import { apiGet } from "@/app/api";
import { useState } from "react";
import { useDebounce } from "../hooks/useDebounce";
import { PatientsMasterDetail } from "./PatientsMasterDetail";

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

export default async function PatientsPage() {
  const patients: Patient[] = await apiGet("/patients");
  // SSR: default to first patient if any
  const defaultPatientId = patients[0]?.id;
  // We'll use a client component for selection and detail
  return <PatientsMasterDetail patients={patients} defaultPatientId={defaultPatientId} />;
} 