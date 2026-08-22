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
        padding: 'clamp(24px, 5vw, 40px) clamp(20px, 5vw, 36px)',
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

export function NagareBrand() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 28 }}>
      {/* River SVG — wider flowing lines */}
      <svg width="36" height="28" viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="river-fill" x1="0" y1="0" x2="36" y2="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="#AFA9EC" />
            <stop offset="1" stopColor="#85B7EB" />
          </linearGradient>
        </defs>
        <path d="M1 5 C5 3, 10 7, 16 6 C22 5, 27 2, 33 4" stroke="url(#river-fill)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
        <path d="M1 11 C6 9, 12 14, 18 13 C24 12, 28 8, 34 10" stroke="url(#river-fill)" strokeWidth="2.8" strokeLinecap="round" fill="none" opacity="0.75" />
        <path d="M1 18 C7 15, 13 20, 19 19 C25 18, 29 14, 35 17" stroke="url(#river-fill)" strokeWidth="3.2" strokeLinecap="round" fill="none" />
        <path d="M3 24 C8 22, 14 26, 20 25 C26 24, 30 21, 35 23" stroke="url(#river-fill)" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.6" />
      </svg>
      <span style={{
        fontFamily: "'DM Serif Display', Georgia, serif",
        fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
        fontWeight: 400,
        letterSpacing: '-0.02em',
        color: '#1C1A2E',
      }}>
        nagare
      </span>
    </div>
  );
}

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
          fontSize: 'clamp(0.875rem, 3vw, 0.9375rem)',
          fontFamily: "'Inter', sans-serif",
          color: '#1C1A2E',
          background: 'rgba(28, 26, 46, 0.03)',
          border: error ? '0.5px solid #F0997B' : '0.5px solid rgba(28, 26, 46, 0.14)',
          borderRadius: 10,
          outline: 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          boxSizing: 'border-box',
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
        fontSize: 'clamp(0.875rem, 3vw, 0.9375rem)',
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
      fontSize: 'clamp(0.75rem, 2.5vw, 0.8125rem)',
      color: '#A09DB8',
    }}>
      {text}{' '}
      <button
        onClick={onLink}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 'clamp(0.75rem, 2.5vw, 0.8125rem)',
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
