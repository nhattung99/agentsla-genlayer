import React, { useState } from 'react';
import { X, Link2, ExternalLink, ShieldAlert, CheckCircle } from 'lucide-react';

export default function SubmitDeliverableModal({ agreement, onClose, onSubmit }) {
  const [deliverableUrl, setDeliverableUrl] = useState('https://github.com/agent-provider/completed-deliverable');
  const [refUrl1, setRefUrl1] = useState('https://ci.genlayer.org/build/1042');
  const [refUrl2, setRefUrl2] = useState('https://validator.genlayer.org/audit/992');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!deliverableUrl.trim()) {
      setError('At least one deliverable output URL is required');
      return;
    }
    if (!refUrl1.trim() || !refUrl2.trim()) {
      setError('At least 2 independent verification reference URLs are required (cannot be self-declared)');
      return;
    }

    onSubmit({
      agreement_id: agreement.id,
      deliverable_urls: [deliverableUrl.trim()],
      reference_urls: [refUrl1.trim(), refUrl2.trim()]
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link2 size={22} color="var(--accent-amber)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Submit SLA Deliverables</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.65rem 1rem',
            color: 'var(--accent-rose)',
            fontSize: '0.85rem',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* SLA Context */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            fontSize: '0.85rem'
          }}>
            <span style={{ color: 'var(--text-subtle)', display: 'block', fontSize: '0.75rem' }}>Task Agreement</span>
            <strong>{agreement.task_description}</strong>
          </div>

          {/* Deliverable URL */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Deliverable Output URL (Self-Submitted Artifact / Code / IPFS Link) *
            </label>
            <input
              type="url"
              value={deliverableUrl}
              onChange={(e) => setDeliverableUrl(e.target.value)}
              placeholder="https://..."
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.65rem',
                color: 'var(--text-main)',
                fontFamily: 'monospace',
                fontSize: '0.85rem'
              }}
            />
          </div>

          {/* Independent Verification References */}
          <div style={{
            background: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <ShieldAlert size={16} color="var(--accent-cyan)" />
              <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                Independent Verification Sources (Required &ge; 2)
              </h4>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              GenLayer AI Consensus strictly prioritizes third-party independent verification links (CI test suite runs, automated scanners) over provider self-declarations to avoid bias.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'block', marginBottom: '0.2rem' }}>
                  Independent Reference Source #1 *
                </label>
                <input
                  type="url"
                  value={refUrl1}
                  onChange={(e) => setRefUrl1(e.target.value)}
                  placeholder="https://ci-server.com/build-logs/101"
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.5rem 0.65rem',
                    color: 'var(--text-main)',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'block', marginBottom: '0.2rem' }}>
                  Independent Reference Source #2 *
                </label>
                <input
                  type="url"
                  value={refUrl2}
                  onChange={(e) => setRefUrl2(e.target.value)}
                  placeholder="https://thirdparty-verifier.org/audit-result"
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.5rem 0.65rem',
                    color: 'var(--text-main)',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem'
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <CheckCircle size={16} /> Submit Deliverables to Court
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
