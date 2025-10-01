import React, { useState } from 'react';

interface CategoryEditModalProps {
  visible: boolean;
  image: string;
  visibleFlag: boolean;
  categoryName: string;
  onSave: (data: { image: string; visible: boolean }) => void;
  onClose: () => void;
}

const CategoryEditModal: React.FC<CategoryEditModalProps> = ({ visible, image: initialImage, visibleFlag: initialVisible, categoryName, onSave, onClose }) => {
  const [image, setImage] = useState(initialImage || '');
  const [visibleFlag, setVisibleFlag] = useState(initialVisible);

  React.useEffect(() => {
    setImage(initialImage || '');
    setVisibleFlag(initialVisible);
  }, [initialImage, initialVisible, visible]);

  if (!visible) return null;



  return (
    <div style={{ ...overlayStyle, zIndex: 99998 }}>
      <div style={modalStyle}>
        <h3 style={{
          margin: 0,
          marginBottom: 18,
          fontWeight: 800,
          fontSize: 22,
          letterSpacing: 1,
          color: '#3730a3',
          textAlign: 'center',
          fontFamily: 'Montserrat, Inter, Arial, sans-serif',
        }}>Edit Category</h3>
        <div style={{
          marginBottom: 10,
          fontWeight: 700,
          fontSize: 17,
          color: '#6366f1',
          textAlign: 'center',
          background: '#f3f4f6',
          borderRadius: 7,
          padding: '8px 0',
          letterSpacing: 0.5,
          userSelect: 'all',
        }}>{categoryName}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            type="text"
            placeholder="Image URL"
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
            onClick={() => onSave({ image, visible: visibleFlag })}
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
          >Save</button>
        </div>
      </div>
    </div>
  );
};

const overlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
};

const modalStyle: React.CSSProperties = {
  background: '#fff',
  padding: '22px 16px 16px 16px',
  borderRadius: 14,
  width: 320,
  maxWidth: '90vw',
  boxShadow: '0 8px 40px 0 rgba(99,102,241,0.18), 0 2px 12px 0 rgba(0,0,0,0.13)',
  border: '1.5px solid #e0e7ef',
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 99999,
  display: 'flex',
  flexDirection: 'column',
  gap: 0,
  alignItems: 'stretch',
  minHeight: 0,
};

export default CategoryEditModal;
