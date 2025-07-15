import React, { useState } from "react";
import { FormField } from "./FormField";
import { Skeleton } from "./Skeleton";

type SelectOption = { value: string | number; label: string };

type FieldConfig = {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  options?: SelectOption[]; // for select fields
};

type EntityFormProps = {
  fields: FieldConfig[];
  onSubmit: (data: Record<string, any>) => Promise<void>;
  submitLabel?: string;
  defaultValues?: Record<string, any>;
};

export function EntityForm({ fields, onSubmit, submitLabel = "Submit", defaultValues }: EntityFormProps) {
  const [form, setForm] = useState<Record<string, any>>(() => {
    const base = Object.fromEntries(fields.map(f => [f.name, ""]));
    return { ...base, ...defaultValues };
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await onSubmit(form);
    } catch (err: any) {
      let msg = err.message || "Failed to submit";
      try {
        // Try to parse JSON error and extract message
        const parsed = JSON.parse(msg);
        if (parsed && typeof parsed === 'object' && parsed.message) {
          msg = Array.isArray(parsed.message) ? parsed.message.join(', ') : parsed.message;
        }
      } catch {}
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded shadow">
      {fields.map((f: FieldConfig) =>
        f.type === "select" ? (
          <div key={f.name}>
            <label htmlFor={f.name} className="block mb-1 font-medium">{f.label}</label>
            <select
              id={f.name}
              name={f.name}
              className="w-full border rounded px-2 py-1"
              value={form[f.name]}
              onChange={handleChange}
              required={f.required}
            >
              <option value="" disabled>
                Select {f.label.toLowerCase()}
              </option>
              {f.options?.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        ) : (
          <FormField
            key={f.name}
            label={f.label}
            name={f.name}
            type={f.type}
            value={form[f.name]}
            onChange={handleChange}
            required={f.required}
          />
        )
      )}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? <Skeleton width={80} height={32} /> : submitLabel}
      </button>
    </form>
  );
} 