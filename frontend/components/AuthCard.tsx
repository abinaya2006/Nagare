'use client';

import React from 'react';

interface AuthCardProps {
  children: React.ReactNode;
}

export default function AuthCard({ children }: AuthCardProps) {
  return (
    <div
      style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: 400,
        margin: '0 auto',
        padding: '40px 36px',
        background: 'rgba(255, 255, 255, 0.82)',
        backdropFilter: 'blur(16px) saturate(140%)',
        WebkitBackdropFilter: 'blur(16px) saturate(140%)',
        border: '0.5px solid rgba(28, 26, 46, 0.10)',
        borderRadius: 20,
        boxShadow: '0 2px 24px rgba(28, 26, 46, 0.07), 0 1px 3px rgba(28, 26, 46, 0.05)',
      }}
    >
      {children}
    </div>
  );
}

/* ── Brand mark ── */
export function NagareBrand() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 28 }}>
      {/* Droplet SVG */}
      <svg width="26" height="30" viewBox="0 0 26 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M13 2C13 2 3 11.5 3 18.5C3 23.747 7.477 28 13 28C18.523 28 23 23.747 23 18.5C23 11.5 13 2 13 2Z"
          fill="url(#droplet-fill)"
          fillOpacity="0.85"
        />
        <path
          d="M16 23C16 23 19.5 20.5 19.5 17.5"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.6"
        />
        <defs>
          <linearGradient id="droplet-fill" x1="3" y1="2" x2="23" y2="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="#AFA9EC" />
            <stop offset="1" stopColor="#85B7EB" />
          </linearGradient>
        </defs>
      </svg>
      <span style={{
        fontFamily: "'DM Serif Display', Georgia, serif",
        fontSize: '1.5rem',
        fontWeight: 400,
        letterSpacing: '-0.02em',
        color: '#1C1A2E',
      }}>
        nagare
      </span>
    </div>
  );
}

/* ── Reusable field ── */
interface FieldProps {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  error?: string;
}

export function Field({ label, id, type = 'text', placeholder, value, onChange, autoComplete, error }: FieldProps) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        htmlFor={id}
        style={{
          display: 'block',
          fontSize: '0.6875rem',
          fontWeight: 500,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: '#6B6880',
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete={autoComplete}
        style={{
          width: '100%',
          padding: '11px 14px',
          fontSize: '0.9375rem',
          fontFamily: "'Inter', sans-serif",
          color: '#1C1A2E',
          background: 'rgba(28, 26, 46, 0.03)',
          border: error
            ? '0.5px solid #F0997B'
            : '0.5px solid rgba(28, 26, 46, 0.14)',
          borderRadius: 10,
          outline: 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
        onFocus={e => {
          e.target.style.borderColor = 'rgba(123, 110, 232, 0.5)';
          e.target.style.boxShadow = '0 0 0 3px rgba(123, 110, 232, 0.10)';
        }}
        onBlur={e => {
          e.target.style.borderColor = error ? '#F0997B' : 'rgba(28, 26, 46, 0.14)';
          e.target.style.boxShadow = 'none';
        }}
      />
      {error && (
        <p style={{ marginTop: 5, fontSize: '0.75rem', color: '#C0583A' }}>{error}</p>
      )}
    </div>
  );
}

/* ── Primary button ── */
interface BtnProps {
  children: React.ReactNode;
  onClick: () => void;
  loading?: boolean;
}

export function PrimaryBtn({ children, onClick, loading }: BtnProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        width: '100%',
        marginTop: 6,
        padding: '12px',
        fontSize: '0.9375rem',
        fontFamily: "'Inter', sans-serif",
        fontWeight: 500,
        color: '#fff',
        background: loading ? '#9E96E4' : 'linear-gradient(135deg, #7B6EE8 0%, #6BAEE8 100%)',
        border: 'none',
        borderRadius: 10,
        cursor: loading ? 'default' : 'pointer',
        transition: 'opacity 0.2s, transform 0.15s',
        boxShadow: '0 2px 10px rgba(123, 110, 232, 0.22)',
        letterSpacing: '0.01em',
      }}
      onMouseEnter={e => { if (!loading) (e.target as HTMLButtonElement).style.opacity = '0.88'; }}
      onMouseLeave={e => { (e.target as HTMLButtonElement).style.opacity = '1'; }}
    >
      {loading ? 'One moment…' : children}
    </button>
  );
}

/* ── Switch link ── */
interface SwitchPromptProps {
  text: string;
  linkLabel: string;
  onLink: () => void;
}

export function SwitchPrompt({ text, linkLabel, onLink }: SwitchPromptProps) {
  return (
    <p style={{
      marginTop: 20,
      textAlign: 'center',
      fontSize: '0.8125rem',
      color: '#A09DB8',
    }}>
      {text}{' '}
      <button
        onClick={onLink}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.8125rem',
          fontFamily: "'Inter', sans-serif",
          fontWeight: 500,
          color: '#7B6EE8',
          textDecoration: 'underline',
          textUnderlineOffset: 2,
          padding: 0,
        }}
      >
        {linkLabel}
      </button>
    </p>
  );
}
