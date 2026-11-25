"use client";

import { useState } from "react";

interface PasswordInputProps {
  id: string;
  name: string;
  label: string;
  autoComplete: string;
  minLength?: number;
}

export default function PasswordInput({
  id,
  name,
  label,
  autoComplete,
  minLength,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="auth-passwordWrap">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          minLength={minLength}
          maxLength={128}
          required
        />
        <button
          className="auth-passwordToggle"
          type="button"
          aria-controls={id}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}
