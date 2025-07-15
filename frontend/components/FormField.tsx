import React from 'react';

type FormFieldProps = {
  label: string;
  name: string;
  type?: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
};

export function FormField({ label, name, type = 'text', value, onChange, required }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={name} className="block mb-1 font-medium">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full border rounded px-2 py-1"
      />
    </div>
  );
} 