import React from 'react';
import { Award, ShieldCheck, CheckCircle2, TrendingUp } from 'lucide-react';

export default function Leaderboard({ agreements }) {
  // Compute leaderboard stats dynamically from completed SLAs
  const agentMap = {};

  agreements.forEach(sla => {
    if (sla.status === 'RESOLVED' || sla.status === 'BREACHED_LATE') {
      const p = sla.provider;
      if (!agentMap[p]) {
        agentMap[p] = { address: p, total: 0, complianceSum: 0 };
      }
      agentMap[p].total += 1;
      agentMap[p].complianceSum += (sla.compliance_pct || 0);
    }
  });

  // Default sample leaderboard if empty
  let leaderboard = Object.values(agentMap).map(item => ({
    address: item.address,
    total: item.total,
    avgCompliance: Math.round(item.complianceSum / item.total)
  }));

  if (leaderboard.length === 0) {
    leaderboard = [
      { address: '0x2222222222222222222222222222222222222222', total: 14, avgCompliance: 96 },
      { address: '0x4444444444444444444444444444444444444444', total: 8, avgCompliance: 91 },
      { address: '0x6666666666666666666666666666666666666666', total: 5, avgCompliance: 84 }
    ];
  }

  leaderboard.sort((a, b) => b.avgCompliance - a.avgCompliance);

  return (
    <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Award size={22} color="var(--accent-amber)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Agent Trust Leaderboard (Reputation Contract)</h3>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <TrendingUp size={12} /> Autonomous Agent Reliability Index
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-subtle)' }}>
              <th style={{ padding: '0.65rem 0.85rem' }}>Rank</th>
              <th style={{ padding: '0.65rem 0.85rem' }}>Agent Identity Address</th>
              <th style={{ padding: '0.65rem 0.85rem' }}>Completed SLAs</th>
              <th style={{ padding: '0.65rem 0.85rem' }}>Historical Avg Compliance</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((agent, idx) => (
              <tr key={agent.address} style={{ borderBottom: '1px solid var(--border-color)', background: idx === 0 ? 'rgba(245, 158, 11, 0.05)' : 'transparent' }}>
                <td style={{ padding: '0.65rem 0.85rem', fontWeight: 700, color: idx === 0 ? 'var(--accent-amber)' : 'var(--text-muted)' }}>
                  #{idx + 1}
                </td>
                <td style={{ padding: '0.65rem 0.85rem', fontFamily: 'monospace', color: 'var(--text-main)' }}>
                  {agent.address.slice(0, 10)}...{agent.address.slice(-6)}
                </td>
                <td style={{ padding: '0.65rem 0.85rem', color: 'var(--text-muted)' }}>
                  {agent.total} contracts
                </td>
                <td style={{ padding: '0.65rem 0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="progress-bar-bg" style={{ width: '100px', height: '8px' }}>
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${agent.avgCompliance}%`,
                          background: agent.avgCompliance >= 90 ? 'var(--accent-emerald)' : 'var(--accent-amber)'
                        }}
                      />
                    </div>
                    <strong style={{ color: agent.avgCompliance >= 90 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                      {agent.avgCompliance}%
                    </strong>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
