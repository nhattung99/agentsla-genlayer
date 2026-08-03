import React from 'react';
import { ShieldCheck, Wallet, ExternalLink, Cpu } from 'lucide-react';

export default function Header({ account, onConnectWallet }) {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-color)',
      background: 'rgba(11, 15, 25, 0.8)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '1rem 2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'var(--primary-gradient)',
            padding: '0.6rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
          }}>
            <ShieldCheck size={26} color="white" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }} className="gradient-text">
                AgentSLA
              </h1>
              <span style={{
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#a5b4fc',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.15rem 0.5rem',
                borderRadius: '999px',
                border: '1px solid rgba(99, 102, 241, 0.3)'
              }}>
                v1.0
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              GenLayer AI Consensus SLA Adjudication
            </p>
          </div>
        </div>

        {/* Network & Wallet Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Studionet Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            padding: '0.4rem 0.8rem',
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--accent-emerald)'
          }}>
            <Cpu size={14} />
            <span>studionet</span>
          </div>

          <a
            href="https://studio.genlayer.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
          >
            GenLayer Studio
            <ExternalLink size={14} />
          </a>

          {/* Wallet Button */}
          {account ? (
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-highlight)',
              padding: '0.45rem 0.9rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontFamily: 'monospace',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Wallet size={16} color="var(--accent-cyan)" />
              {account.slice(0, 6)}...{account.slice(-4)}
            </div>
          ) : (
            <button onClick={onConnectWallet} className="btn-primary" style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem' }}>
              <Wallet size={16} />
              Connect MetaMask
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
