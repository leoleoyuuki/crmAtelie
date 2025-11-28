
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from './input';

interface CurrencyInputProps {
  value: number; // Value in cents
  onChange: (value: number) => void; // onChange returns value in cents
  placeholder?: string;
  disabled?: boolean;
}

// Helper to format cents to a BRL string (e.g., 150 -> "R$ 1,50")
const formatToBRL = (cents: number) => {
  const realValue = cents / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(realValue);
};

// Helper to parse a string value back to cents
const parseToCents = (value: string): number => {
  const onlyNumbers = value.replace(/\D/g, '');
  if (onlyNumbers === '') return 0;
  return parseInt(onlyNumbers, 10);
};

export const CurrencyInput = ({ value, onChange, ...props }: CurrencyInputProps) => {
  const [displayValue, setDisplayValue] = useState(formatToBRL(value));

  // When the external value (from react-hook-form) changes, update the display
  useEffect(() => {
    setDisplayValue(formatToBRL(value));
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const cents = parseToCents(rawValue);
    
    // Update the internal display
    setDisplayValue(formatToBRL(cents));
    
    // Propagate the change in cents to the parent form
    onChange(cents);
  };
  
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Select all text on focus for easier editing
    e.target.select();
  };

  return (
    <Input
      {...props}
      value={displayValue}
      onChange={handleInputChange}
      onFocus={handleFocus}
      type="text" // Use text type to allow currency symbols and formatting
      inputMode="numeric" // Hint for mobile keyboards
    />
  );
};
