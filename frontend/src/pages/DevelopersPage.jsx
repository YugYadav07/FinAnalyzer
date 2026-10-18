import React from 'react';
import { Users } from 'lucide-react';

const developers = [
  { id: 1, name: 'DUG (BACKEND DEVELOPER)', image: '/dug.jpeg' },
  { id: 2, name: 'DASTVARDHAN (JUNIOR DATABASE DEVELOPER)', image: '/dastvardhan.jpeg' },
  { id: 3, name: 'Mr. KALA (SENIOR BACKEND DEVELOPER, LBDN)', image: '/kaalu.jpeg' },
  { id: 4, name: 'BIHARI BAMAN (EXPERT BHAAT MAKER, LBDN)', image: '/bihari.jpeg' },
];

export default function DevelopersPage() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '2.5rem' }}>
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '1rem',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem auto',
          boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
        }}>
          <Users style={{ width: '32px', height: '32px', color: '#fff' }} />
        </div>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '800',
          letterSpacing: '-0.025em',
          marginBottom: '0.5rem',
        }} className="text-slate-900 dark:text-white">
          Meet Our Developers
        </h1>
        <p style={{ fontSize: '0.95rem' }} className="text-slate-500 dark:text-slate-400">
          The team behind FinAnalyzer
        </p>
      </div>

      {/* Developer Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '2rem',
        width: '100%',
        maxWidth: '960px',
        padding: '0 1rem',
      }}>
        {developers.map((dev) => (
          <div
            key={dev.id}
            className="bg-white dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/50"
            style={{
              borderRadius: '1.25rem',
              border: '1px solid',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(99, 102, 241, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Image placeholder area — add your <img> here */}
            <div
              className="bg-slate-100 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600/40"
              style={{
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                border: '2px dashed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                overflow: 'hidden',
              }}
            >
              <img src={dev.image} alt={dev.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            {/* Name area — fill in dev.name above or hardcode here */}
            <p style={{
              fontSize: '1rem',
              fontWeight: '700',
              letterSpacing: '-0.01em',
              minHeight: '1.5rem',
            }} className="text-slate-800 dark:text-slate-200">
              {dev.name || '\u00A0'}
            </p>
          </div>
        ))}
      </div>

      {/* ——— Group Photos Section ——— */}
      <div style={{
        width: '100%',
        maxWidth: '960px',
        padding: '0 1rem',
        marginTop: '3.5rem',
      }}>
        {/* Section heading
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{
            fontSize: '1.4rem',
            fontWeight: '700',
            letterSpacing: '-0.02em',
            marginBottom: '0.35rem',
          }} className="text-slate-900 dark:text-white">
            Our Team
          </h2>
          <p style={{ fontSize: '0.85rem' }} className="text-slate-400 dark:text-slate-500">
            Our team moments together
          </p>
        </div> */}

        {/* Group photo placeholders grid
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}>
          {[1, 2, 3, 4].map((num) => (
            <div
              key={num}
              className="bg-white dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/50"
              style={{
                borderRadius: '1rem',
                border: '1px solid',
                overflow: 'hidden',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(99, 102, 241, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '200px',
                  overflow: 'hidden',
                }}
              >
                <img src="/dug.jpeg" alt="Group photo"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
          ))}
        </div> */}
      </div>
    </div>
  );
}
