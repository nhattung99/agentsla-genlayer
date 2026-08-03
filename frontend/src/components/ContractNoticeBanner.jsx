import React from 'react';
import { AlertTriangle, Info, Terminal } from 'lucide-react';

export default function ContractNoticeBanner({ isConfigured, customAddress, onSetCustomAddress }) {
  if (isConfigured) return null;

  return (
    <div style={{
      background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 70, 239, 0.08) 100%)',
      border: '1px solid rgba(245, 158, 11, 0.3)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem 1.5rem',
      marginBottom: '2rem',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1rem'
    }}>
      <AlertTriangle size={24} color="var(--accent-amber)" style={{ flexShrink: 0, marginTop: '2px' }} />
      <div style={{ flex: 1 }}>
        <h4 style={{ color: 'var(--accent-amber)', fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          Contract Chưa Đóng Cấu Hình Môi Trường (Chờ Deploy Thủ Công trên Studio)
        </h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          Ứng dụng đang ở chế độ xem trước dữ liệu mẫu. Sau khi bạn deploy 3 contract (<code>SLACourt</code>, <code>Treasury</code>, <code>Reputation</code>) thành công trên <strong>GenLayer Studio (studionet)</strong>, hãy điền địa chỉ contract bên dưới để kết nối trực tiếp:
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', maxWidth: '600px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Terminal size={16} color="var(--text-subtle)" style={{ position: 'absolute', left: '12px', top: '10px' }} />
            <input
              type="text"
              placeholder="0x... (Địa chỉ SLACourt đã deploy)"
              value={customAddress}
              onChange={(e) => onSetCustomAddress(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                color: 'var(--text-main)',
                fontFamily: 'monospace',
                fontSize: '0.85rem'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
