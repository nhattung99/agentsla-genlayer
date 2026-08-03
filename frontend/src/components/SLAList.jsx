import React, { useState } from 'react';
import { Search, PlusCircle, Clock, CheckCircle2, AlertCircle, Scale, ShieldAlert, ChevronRight } from 'lucide-react';

export default function SLAList({ agreements, onSelectAgreement, onCreateSLA, onSubmitDeliverable, onResolveSLA }) {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const filtered = agreements.filter(item => {
    const matchesFilter = filter === 'ALL' || item.status === filter;
    const matchesSearch = item.task_description.toLowerCase().includes(search.toLowerCase()) ||
                          item.client.toLowerCase().includes(search.toLowerCase()) ||
                          item.provider.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING_DELIVERY':
        return <span className="badge badge-pending"><Clock size={12} /> Pending</span>;
      case 'SUBMITTED':
        return <span className="badge badge-submitted"><Scale size={12} /> Awaiting Adjudication</span>;
      case 'RESOLVED':
        return <span className="badge badge-resolved"><CheckCircle2 size={12} /> Resolved</span>;
      case 'DISPUTED':
        return <span className="badge badge-disputed"><ShieldAlert size={12} /> Disputed</span>;
      case 'BREACHED_LATE':
        return <span className="badge badge-breached"><AlertCircle size={12} /> Breached Late</span>;
      default:
        return <span className="badge">{status}</span>;
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

  const getTimeRemaining = (deadlineSeconds) => {
    const diff = deadlineSeconds - Math.floor(Date.now() / 1000);
    if (diff <= 0) return <span style={{ color: 'var(--accent-rose)' }}>Expired</span>;
    const hours = Math.floor(diff / 3600);
    const mins = Math.floor((diff % 3600) / 60);
    return `${hours}h ${mins}m left`;
  };

  return (
    <div>
      {/* Top Bar Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} color="var(--text-subtle)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Search tasks or addresses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.65rem 0.75rem 0.65rem 2.3rem',
              color: 'var(--text-main)',
              fontSize: '0.85rem'
            }}
          />
        </div>

        {/* Filter Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['ALL', 'PENDING_DELIVERY', 'SUBMITTED', 'RESOLVED', 'DISPUTED', 'BREACHED_LATE'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              style={{
                background: filter === st ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                border: filter === st ? '1px solid var(--accent-indigo, #6366f1)' : '1px solid var(--border-color)',
                color: filter === st ? '#a5b4fc' : 'var(--text-muted)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.4rem 0.8rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Create SLA Button */}
        <button onClick={onCreateSLA} className="btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
          <PlusCircle size={18} />
          Create SLA Contract
        </button>
      </div>

      {/* SLA Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
        {filtered.length === 0 ? (
          <div className="glass-card" style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>No SLA agreements matching your search filter.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div key={item.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontFamily: 'monospace' }}>
                    SLA #{item.id}
                  </span>
                  {getStatusBadge(item.status)}
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.4, marginBottom: '0.75rem' }}>
                  {item.task_description}
                </h3>

                {/* Escrow Amount & Deadline */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '0.6rem 0.8rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem',
                  fontSize: '0.85rem'
                }}>
                  <div>
                    <span style={{ color: 'var(--text-subtle)', fontSize: '0.75rem', display: 'block' }}>Escrow Vault</span>
                    <strong style={{ color: 'var(--accent-emerald)' }}>{formatEther(item.payment_amount)}</strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: 'var(--text-subtle)', fontSize: '0.75rem', display: 'block' }}>Deadline</span>
                    <strong style={{ color: 'var(--text-main)' }}>{getTimeRemaining(item.deadline)}</strong>
                  </div>
                </div>

                {/* Criteria List */}
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontWeight: 600, textTransform: 'uppercase' }}>
                    SLA Criteria ({item.criteria.length})
                  </span>
                  <ul style={{ listStyle: 'none', marginTop: '0.35rem' }}>
                    {item.criteria.slice(0, 3).map((c, i) => (
                      <li key={i} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                        <span style={{ color: 'var(--accent-cyan)' }}>•</span> {c}
                      </li>
                    ))}
                    {item.criteria.length > 3 && (
                      <li style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                        +{item.criteria.length - 3} more criteria...
                      </li>
                    )}
                  </ul>
                </div>

                {/* Compliance Result Bar if Resolved */}
                {item.status === 'RESOLVED' && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                      <span style={{ color: 'var(--text-subtle)' }}>AI Compliance Score</span>
                      <strong style={{ color: item.compliance_pct >= 80 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                        {item.compliance_pct}%
                      </strong>
                    </div>
                    <div className="progress-bar-bg">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${item.compliance_pct}%`,
                          background: item.compliance_pct >= 80 ? 'var(--accent-emerald)' : 'var(--accent-amber)'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                {item.status === 'PENDING_DELIVERY' && (
                  <button
                    onClick={() => onSubmitDeliverable(item)}
                    className="btn-primary"
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', justifyContent: 'center' }}
                  >
                    Submit Deliverables
                  </button>
                )}

                {(item.status === 'SUBMITTED' || item.status === 'DISPUTED') && (
                  <button
                    onClick={() => onResolveSLA(item)}
                    className="btn-primary"
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      fontSize: '0.8rem',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #06b6d4, #3b82f6)'
                    }}
                  >
                    <Scale size={14} />
                    Run AI Adjudication
                  </button>
                )}

                <button
                  onClick={() => onSelectAgreement(item)}
                  className="btn-secondary"
                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
                >
                  Details <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
