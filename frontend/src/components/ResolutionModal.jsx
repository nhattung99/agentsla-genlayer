import React, { useState } from 'react';
import { X, Scale, Cpu, CheckCircle2, AlertTriangle, ExternalLink, ShieldCheck, PieChart } from 'lucide-react';

export default function ResolutionModal({ agreement, onClose, onRunAdjudication }) {
  const [isResolving, setIsResolving] = useState(false);

  // Parse verdict JSON safely
  let verdictData = null;
  if (agreement && agreement.verdict_reason) {
    try {
      verdictData = JSON.parse(agreement.verdict_reason);
    } catch {
      verdictData = {
        compliance_pct: agreement.compliance_pct || 0,
        confidence: agreement.confidence || 0,
        criteria_evaluations: agreement.criteria.map(c => ({
          criterion: c,
          status: agreement.compliance_pct >= 80 ? 'MET' : 'PARTIAL',
          note: agreement.verdict_reason || 'Evaluated by GenLayer Consensus'
        })),
        reason: agreement.verdict_reason || 'Adjudication completed.'
      };
    }
  }

  const handleExecuteResolution = async () => {
    setIsResolving(true);
    try {
      await onRunAdjudication(agreement.id);
    } finally {
      setIsResolving(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'MET':
        return <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>MET</span>;
      case 'PARTIAL':
        return <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>PARTIAL</span>;
      default:
        return <span style={{ background: 'rgba(244, 63, 94, 0.15)', color: 'var(--accent-rose)', border: '1px solid rgba(244, 63, 94, 0.3)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>NOT MET</span>;
    }
  };

  const formatEther = (weiStr) => {
    try {
      const num = Number(weiStr) / 1e18;
      return num.toFixed(2) + ' GL';
    } catch {
      return weiStr + ' WEI';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '750px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Scale size={24} color="var(--accent-cyan)" />
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>SLA Court Adjudication Details</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontFamily: 'monospace' }}>
                Agreement #{agreement.id}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* AI Loading Consensus Pulse State */}
        {isResolving ? (
          <div className="glass-card pulse-consensus" style={{ padding: '3rem 2rem', textAlign: 'center', margin: '2rem 0' }}>
            <Cpu size={48} color="var(--accent-cyan)" style={{ animation: 'spin 3s linear infinite', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }} className="gradient-text">
              Executing Non-Deterministic GenLayer Consensus...
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem', maxWidth: '500px', margin: '0.5rem auto' }}>
              GenLayer validator nodes are currently fetching deliverable links, rendering independent verification reference pages, and cross-referencing criteria with continuous compliance scoring tolerance (±5%).
            </p>
          </div>
        ) : (
          <div>
            {/* Task Overview */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'block', marginBottom: '0.2rem' }}>Task Statement</span>
              <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>{agreement.task_description}</p>
            </div>

            {/* Verdict Verdict Bar & Confidence Gauge (If Resolved) */}
            {verdictData ? (
              <div style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9))',
                border: '1px solid var(--border-highlight)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  {/* Compliance Score */}
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'block' }}>Compliance Verdict Score</span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.2rem' }}>
                      <span style={{ fontSize: '2rem', fontWeight: 800, color: verdictData.compliance_pct >= 80 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                        {verdictData.compliance_pct}%
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Completion Rate</span>
                    </div>
                  </div>

                  {/* Confidence Gauge */}
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'block' }}>Validator AI Confidence</span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.2rem' }}>
                      <span style={{ fontSize: '2rem', fontWeight: 800, color: verdictData.confidence >= 60 ? 'var(--accent-cyan)' : 'var(--accent-rose)' }}>
                        {verdictData.confidence}%
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {verdictData.confidence >= 60 ? 'High Agreement' : 'Low Confidence (Disputed)'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="progress-bar-bg" style={{ height: '14px', marginBottom: '1rem' }}>
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${verdictData.compliance_pct}%`,
                      background: 'var(--primary-gradient)'
                    }}
                  />
                </div>

                {/* Overall Summary Reason */}
                <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontStyle: 'italic', background: 'rgba(0, 0, 0, 0.2)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)' }}>
                  "{verdictData.reason}"
                </p>
              </div>
            ) : (
              <div style={{
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
                  Deliverables have been submitted. Click "Run AI Adjudication" to trigger GenLayer non-deterministic consensus evaluation.
                </p>
              </div>
            )}

            {/* Per-Criteria Evaluation Breakdown Table */}
            {verdictData && verdictData.criteria_evaluations && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <PieChart size={16} color="var(--accent-cyan)" /> Per-Criteria Assessment Breakdown
                </h4>
                <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255, 255, 255, 0.04)', color: 'var(--text-subtle)' }}>
                        <th style={{ padding: '0.65rem 0.85rem' }}>Criteria Description</th>
                        <th style={{ padding: '0.65rem 0.85rem', width: '100px' }}>Status</th>
                        <th style={{ padding: '0.65rem 0.85rem' }}>Evaluation Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {verdictData.criteria_evaluations.map((item, idx) => (
                        <tr key={idx} style={{ borderTop: '1px solid var(--border-color)', background: idx % 2 === 0 ? 'rgba(0, 0, 0, 0.15)' : 'transparent' }}>
                          <td style={{ padding: '0.65rem 0.85rem', color: 'var(--text-main)', fontWeight: 500 }}>
                            {item.criterion}
                          </td>
                          <td style={{ padding: '0.65rem 0.85rem' }}>
                            {getStatusBadge(item.status)}
                          </td>
                          <td style={{ padding: '0.65rem 0.85rem', color: 'var(--text-muted)' }}>
                            {item.note}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Financial Payout Math Split Summary */}
            {agreement.status === 'RESOLVED' && (
              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.5rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'block' }}>Provider Payout ({verdictData ? verdictData.compliance_pct : 0}%)</span>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--accent-emerald)' }}>
                    {formatEther(BigInt(Math.floor((Number(agreement.payment_amount) * (agreement.compliance_pct || 0)) / 100)).toString())}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'block' }}>Client Refund ({100 - (agreement.compliance_pct || 0)}%)</span>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                    {formatEther(BigInt(Math.floor((Number(agreement.payment_amount) * (100 - (agreement.compliance_pct || 0))) / 100)).toString())}
                  </strong>
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center' }}>
              <a
                href="https://studio.genlayer.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}
              >
                Inspect Consensus on GenLayer Explorer <ExternalLink size={12} />
              </a>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={onClose} className="btn-secondary">
                  Close
                </button>

                {(agreement.status === 'SUBMITTED' || agreement.status === 'DISPUTED') && (
                  <button onClick={handleExecuteResolution} className="btn-primary">
                    <Scale size={16} /> Execute Consensus Adjudication
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
