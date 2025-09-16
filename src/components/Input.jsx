import React from 'react';
export const Input = ({
  label,
  name,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  required = false,
  className = '',
  error,
  textarea = false,
  rows = 4
}) => {
  return <div className={`mb-4 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {textarea ? <textarea id={name} name={name} value={value} onChange={onChange} rows={rows} placeholder={placeholder} required={required} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" /> : <input id={name} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>;
};