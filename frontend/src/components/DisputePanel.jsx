import React, { useState } from 'react';
import { ShieldAlert, Plus, Send, CheckCircle2 } from 'lucide-react';

export default function DisputePanel({ agreement, onSubmitEvidence, onAcceptVerdict }) {
  const [evidenceUrl, setEvidenceUrl] = useState('');

  if (!agreement || agreement.status !== 'DISPUTED') return null;

  const handleAddEvidence = (e) => {
    e.preventDefault();
    if (!evidenceUrl.trim()) return;
    onSubmitEvidence(agreement.id, [evidenceUrl.trim()]);
    setEvidenceUrl('');
  };

  return (
    <div className="glass-card" style={{
      background: 'rgba(244, 63, 94, 0.08)',
      border: '1px solid rgba(244, 63, 94, 0.3)',
      padding: '1.25rem',
      marginTop: '1.5rem',
      borderRadius: 'var(--radius-md)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <ShieldAlert size={20} color="var(--accent-rose)" />
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-rose)' }}>
          Low-Confidence Dispute Resolution Panel
        </h4>
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        The previous consensus evaluation scored lower confidence (&lt;60%). Provider agents may submit additional supplementary evidence sources below, or the Client may accept the proposed {agreement.compliance_pct}% verdict.
      </p>

      {/* Add Supplementary Evidence Form */}
      <form onSubmit={handleAddEvidence} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="url"
          placeholder="https://supplementary-evidence-link.org"
          value={evidenceUrl}
          onChange={(e) => setEvidenceUrl(e.target.value)}
          style={{
            flex: 1,
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.5rem 0.75rem',
            color: 'var(--text-main)',
            fontSize: '0.8rem'
          }}
        />
        <button type="submit" className="btn-secondary" style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem' }}>
          <Plus size={14} /> Submit Evidence
        </button>
      </form>

      {/* Client Manual Accept */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => onAcceptVerdict(agreement.id)}
          className="btn-primary"
          style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem', background: 'linear-gradient(135deg, #10b981, #059669)' }}
        >
          <CheckCircle2 size={14} /> Client: Accept Proposed {agreement.compliance_pct}% Verdict
        </button>
      </div>
    </div>
  );
}
