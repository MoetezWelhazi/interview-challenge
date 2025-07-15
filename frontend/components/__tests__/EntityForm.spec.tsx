import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EntityForm } from '../EntityForm';

// Mock FormField since it is missing from the codebase
jest.mock('../FormField', () => ({
  FormField: (props: any) => (
    <div>
      <label htmlFor={props.name}>{props.label}</label>
      <input
        data-testid={`mock-formfield-${props.name}`}
        id={props.name}
        name={props.name}
        value={props.value}
        onChange={props.onChange}
        required={props.required}
      />
    </div>
  ),
}));

describe('EntityForm', () => {
  const fields = [
    { label: 'Name', name: 'name', required: true },
    { label: 'Type', name: 'type', type: 'select', required: true, options: [
      { value: 'A', label: 'Type A' },
      { value: 'B', label: 'Type B' },
    ] },
  ];

  it('renders all fields and submit button', () => {
    render(<EntityForm fields={fields} onSubmit={jest.fn()} submitLabel="Save" />);
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Type')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('calls onSubmit with form data', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<EntityForm fields={fields} onSubmit={onSubmit} submitLabel="Save" />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'A' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    // Wait for async submit
    await screen.findByRole('button', { name: /save/i });
    expect(onSubmit).toHaveBeenCalledWith({ name: 'John', type: 'A' });
  });
}); 