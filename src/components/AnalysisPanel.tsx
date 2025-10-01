// components/AnalysisPanel.tsx
import React from 'react';

interface AnalysisPanelProps {
  categories: any[];
  items: any[];
}

const cardColors = [
  'linear-gradient(135deg, #6366f1 0%, #60a5fa 100%)',
  'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
  'linear-gradient(135deg, #f59e42 0%, #fbbf24 100%)',
  'linear-gradient(135deg, #f43f5e 0%, #f87171 100%)',
];

const icons = [
  <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff" fillOpacity="0.2"/><path d="M8 12h8M12 8v8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>,
  <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="8" fill="#fff" fillOpacity="0.2"/><path d="M8 12h8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>,
  <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" fill="#fff" fillOpacity="0.2"/><path d="M12 8v8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>,
  <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff" fillOpacity="0.2"/><path d="M8 16l4-8 4 8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>,
];

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ categories, items }) => {
  // Animation: fade in and slight up
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);

  // More stats
  const visibleItems = items.filter(i => i.visible).length;
  const visibleCategories = categories.filter(cat => cat.visible !== false).length;
  const totalCategories = categories.length;
  const totalItems = items.length;

  const stats = [
    { label: 'Total Categories', value: totalCategories },
    { label: 'Total Items', value: totalItems },
    { label: 'Visible Categories', value: visibleCategories },
    { label: 'Visible Items', value: visibleItems },
  ];

  return (
    <div
      style={{
        display: 'flex',
        gap: 32,
        marginBottom: 32,
        justifyContent: 'center',
        flexWrap: 'wrap',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.7s cubic-bezier(.4,2,.3,1)',
      }}
    >
      {stats.map((stat, idx) => (
        <div
          key={stat.label}
          style={{
            minWidth: 180,
            background: cardColors[idx % cardColors.length],
            color: '#fff',
            borderRadius: 16,
            padding: '24px 32px',
            boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            animation: mounted ? `popIn 0.7s ${0.1 * idx}s cubic-bezier(.4,2,.3,1) both` : undefined,
          }}
        >
          <div style={{ position: 'absolute', top: 12, right: 12, opacity: 0.15 }}>{icons[idx % icons.length]}</div>
          <div style={{ fontSize: 15, fontWeight: 500, letterSpacing: 0.5, marginBottom: 8 }}>{stat.label}</div>
          <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: 1 }}>{stat.value}</div>
        </div>
      ))}
      <style>{`
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.95) translateY(30px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AnalysisPanel;
