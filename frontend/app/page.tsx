"use client"
import React from 'react';
import { useEffect, useState } from 'react';
import { Skeleton } from "../components/Skeleton";
import { Button } from "../components/Button";

const API = "http://localhost:8080";

type SampleEntity = { id: number; name: string };

export default function Home() {
  const [samples, setSamples] = useState<SampleEntity[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchSamples = async () => {
    const res = await fetch(`${API}/sample`);
    const data = await res.json();
    setSamples(data);
    setLoading(false);
  };

  const createSample = async () => {
    if (!name.trim()) return;
    await fetch(`${API}/sample`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    setName('');
    fetchSamples();
  };

  useEffect(() => {
    fetchSamples();
  }, []);

  return (
    <div className="p-8 font-sans">
      <h1 className="text-2xl font-bold mb-4">Sample Entity Manager</h1>

      <div className="flex gap-2 mb-4">
        <input
          className="border px-2 py-1 rounded w-64"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button onClick={createSample} className="bg-blue-600 text-white px-4 py-1 rounded">
          Add
        </Button>
      </div>

      <ul className="space-y-1">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="border-b pb-1">
              <Skeleton width="60%" height={20} />
            </li>
          ))
        ) : (
          samples.map((s) => (
            <li key={s.id} className="border-b pb-1">
              #{s.id} - {s.name}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
