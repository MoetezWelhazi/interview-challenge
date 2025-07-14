import { useState, useEffect } from "react";
import { useDebounce } from "../hooks/useDebounce";
import { apiGet } from "@/app/api";

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
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    apiGet(`/patients/${selectedId}/assignments/remaining-days`)
      .then(setAssignments)
      .finally(() => setLoading(false));
  }, [selectedId]);

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row gap-4 h-full">
      {/* Master: Patients List */}
      <aside className="md:w-64 w-full bg-white rounded shadow p-2 md:p-4 overflow-y-auto max-h-[60vh] md:max-h-none">
        <h2 className="text-lg font-bold mb-2">Patients</h2>
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
              <button
                className={`w-full text-left px-2 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${selectedId === p.id ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"}`}
                onClick={() => setSelectedId(p.id)}
                aria-current={selectedId === p.id ? "true" : undefined}
              >
                <div>{p.name}</div>
                <div className="text-xs text-gray-500">DOB: {p.dateOfBirth}</div>
              </button>
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
            <h2 className="text-lg font-bold mb-2">Assignments</h2>
            {loading ? (
              <div>Loading...</div>
            ) : assignments.length ? (
              <ul className="space-y-2">
                {assignments.map((a) => (
                  <li key={a.id} className={`p-3 rounded border ${a.remainingDays === 0 ? "bg-gray-100 text-gray-500" : "bg-green-50 border-green-200"}`}>
                    <div className="font-semibold">{a.medication?.name}</div>
                    <div className="text-xs">Start: {a.startDate} | Days: {a.days}</div>
                    <div className="text-xs">
                      Remaining: <span className="font-mono">{a.remainingDays}</span> —
                      <span className={a.remainingDays === 0 ? "text-gray-500" : "text-green-700 font-bold ml-1"}>
                        {a.remainingDays === 0 ? "Completed" : "Active"}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-400">No assignments for this patient.</div>
            )}
          </>
        ) : (
          <div className="text-gray-400">Select a patient to view assignments.</div>
        )}
      </section>
    </div>
  );
} 