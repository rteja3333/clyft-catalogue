// components/TableCreationModal.tsx
import React, { useState } from 'react';

interface TableCreationModalProps {
  visible: boolean;
  onClose: () => void;
  categories: any[];
  existingCategories: string[];
  onCreate: (category: { name: string; image?: string; visible?: boolean }) => void;
}

const TableCreationModal: React.FC<TableCreationModalProps> = ({ visible, onClose, categories, existingCategories, onCreate }) => {
  const [categoryName, setCategoryName] = useState('');
  const [image, setImage] = useState('');
  const [visibleFlag, setVisibleFlag] = useState(true);

  const handleCreate = () => {
    if (!categoryName.trim()) return;
    // Prevent duplicate
    if (categories.some(c => c.name.toLowerCase() === categoryName.trim().toLowerCase())) return;
    onCreate({ name: categoryName.trim(), image, visible: visibleFlag });
    setCategoryName('');
    setImage('');
    setVisibleFlag(true);
    onClose();
  };

  if (!visible) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2 style={{
          margin: 0,
          marginBottom: 18,
          fontWeight: 800,
          fontSize: 26,
          letterSpacing: 1,
          color: '#3730a3',
          textAlign: 'center',
          fontFamily: 'Montserrat, Inter, Arial, sans-serif',
        }}>Create New Category</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            type="text"
            placeholder="Category Name"
            value={categoryName}
            onChange={e => setCategoryName(e.target.value)}
            style={{
              padding: '12px 14px',
              borderRadius: 8,
              border: '1.5px solid #c7d2fe',
              fontSize: 17,
              background: '#f8fafc',
              fontWeight: 600,
              outline: 'none',
              boxShadow: '0 1px 4px #e0e7ef',
              transition: 'border 0.2s, box-shadow 0.2s',
            }}
          />
          <input
            type="text"
            placeholder="Image URL (optional)"
            value={image}
            onChange={e => setImage(e.target.value)}
            style={{
              padding: '12px 14px',
              borderRadius: 8,
              border: '1.5px solid #c7d2fe',
              fontSize: 17,
              background: '#f8fafc',
              fontWeight: 500,
              outline: 'none',
              boxShadow: '0 1px 4px #e0e7ef',
              transition: 'border 0.2s, box-shadow 0.2s',
            }}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 16, color: '#6366f1', fontWeight: 600 }}>
            <input type="checkbox" checked={visibleFlag} onChange={e => setVisibleFlag(e.target.checked)} style={{ accentColor: '#6366f1', width: 18, height: 18 }} />
            Visible
          </label>
        </div>
        <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end', gap: 14 }}>
          <button
            onClick={onClose}
            style={{
              background: '#f3f4f6',
              color: '#334155',
              border: 'none',
              borderRadius: 7,
              padding: '8px 22px',
              fontWeight: 600,
              fontSize: 16,
              boxShadow: '0 1px 4px #e0e7ef',
              cursor: 'pointer',
              transition: 'background 0.18s, color 0.18s, box-shadow 0.18s',
            }}
            onMouseOver={e => (e.currentTarget.style.background = '#e0e7ef')}
            onMouseOut={e => (e.currentTarget.style.background = '#f3f4f6')}
          >Cancel</button>
          <button
            onClick={handleCreate}
            style={{
              background: 'linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 7,
              padding: '8px 28px',
              fontWeight: 700,
              fontSize: 16,
              boxShadow: '0 2px 8px 0 rgba(99,102,241,0.13)',
              cursor: 'pointer',
              transition: 'background 0.18s, box-shadow 0.18s, transform 0.18s',
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = 'linear-gradient(90deg, #4f46e5 0%, #60a5fa 100%)';
              e.currentTarget.style.boxShadow = '0 4px 16px 0 rgba(99,102,241,0.18)';
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.04)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)';
              e.currentTarget.style.boxShadow = '0 2px 8px 0 rgba(99,102,241,0.13)';
              e.currentTarget.style.transform = 'none';
            }}
          >Create</button>
        </div>
      </div>
    </div>
  );
};

const overlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
};

const modalStyle: React.CSSProperties = {
  background: '#fff',
  padding: '32px 28px 24px 28px',
  borderRadius: 16,
  width: 420,
  boxShadow: '0 8px 40px 0 rgba(99,102,241,0.13), 0 2px 12px 0 rgba(0,0,0,0.10)',
  border: '1.5px solid #e0e7ef',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: 0,
  alignItems: 'stretch',
  minHeight: 0,
};

export default TableCreationModal;
