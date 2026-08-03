import React, { useState } from 'react';
import { X, Plus, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';

export default function CreateSLAForm({ onClose, onSubmit }) {
  const [taskDescription, setTaskDescription] = useState('');
  const [providerAddress, setProviderAddress] = useState('0x2222222222222222222222222222222222222222');
  const [paymentAmount, setPaymentAmount] = useState('5.0');
  const [durationHours, setDurationHours] = useState('24');
  const [criteria, setCriteria] = useState([
    'Must complete all specified deliverable requirements',
    'Output must pass automated unit & integration tests'
  ]);
  const [newCriterion, setNewCriterion] = useState('');
  const [error, setError] = useState('');

  const handleAddCriterion = () => {
    if (!newCriterion.trim()) return;
    setCriteria([...criteria, newCriterion.trim()]);
    setNewCriterion('');
  };

  const handleRemoveCriterion = (index) => {
    setCriteria(criteria.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!taskDescription.trim()) {
      setError('Task description is required');
      return;
    }
    if (criteria.length === 0) {
      setError('At least one SLA criterion is required');
      return;
    }
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      setError('Payment amount must be greater than zero');
      return;
    }

    const deadline = Math.floor(Date.now() / 1000) + (Number(durationHours) * 3600);
    // Convert Ether to Wei string (e.g. 5.0 -> 5000000000000000000)
    const weiAmount = (BigInt(Math.floor(Number(paymentAmount) * 1e6)) * BigInt(1e12)).toString();

    onSubmit({
      provider: providerAddress,
      task_description: taskDescription,
      criteria,
      payment_amount: weiAmount,
      deadline
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={22} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Create Intelligent SLA Contract</h2>
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
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Task Description */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Task / Scope Description *
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Write high performance GenLayer intelligent contract and React UI"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem',
                color: 'var(--text-main)',
                fontSize: '0.85rem'
              }}
            />
          </div>

          {/* Provider Address & Escrow Payment */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Provider Agent Address *
              </label>
              <input
                type="text"
                value={providerAddress}
                onChange={(e) => setProviderAddress(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.65rem',
                  color: 'var(--text-main)',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Escrow Escrow Deposit (GL Token) *
              </label>
              <input
                type="number"
                step="0.1"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.65rem',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          {/* Deadline Selector */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Execution Deadline Duration (Hours)
            </label>
            <select
              value={durationHours}
              onChange={(e) => setDurationHours(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.65rem',
                color: 'var(--text-main)',
                fontSize: '0.85rem'
              }}
            >
              <option value="6">6 Hours</option>
              <option value="12">12 Hours</option>
              <option value="24">24 Hours (1 Day)</option>
              <option value="48">48 Hours (2 Days)</option>
              <option value="168">7 Days</option>
            </select>
          </div>

          {/* Dynamic Criteria List Builder */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              SLA Quality Criteria List (Specific Objective & Subjective Benchmarks) *
            </label>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <input
                type="text"
                placeholder="Add new criteria statement..."
                value={newCriterion}
                onChange={(e) => setNewCriterion(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCriterion(); } }}
                style={{
                  flex: 1,
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.6rem 0.75rem',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem'
                }}
              />
              <button
                type="button"
                onClick={handleAddCriterion}
                className="btn-secondary"
                style={{ padding: '0.6rem 1rem' }}
              >
                <Plus size={16} /> Add
              </button>
            </div>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {criteria.map((item, idx) => (
                <li key={idx} style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.5rem 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.85rem'
                }}>
                  <span><strong style={{ color: 'var(--accent-cyan)' }}>#{idx + 1}</strong> {item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCriterion(idx)}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Initialize & Escrow Funds
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
