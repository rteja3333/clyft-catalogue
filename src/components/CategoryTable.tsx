// components/CategoryTable.tsx
import React, { useState } from 'react';
import { Modal, Button } from 'antd';
import { db } from '../firebase';
import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { ItemFormModal } from './ItemModal';

interface CategoryTableProps {
  category: any;
  items: any[];
  onSaveItem: (item: any) => Promise<{ success: boolean; message: string }>;
  onDeleteCategory?: (categoryId: string, categoryName: string) => void;
  onDeleteItem?: (itemId: string, itemName: string, categoryId: string) => void;
  onEditCategory?: (cat: any) => void;
}

const CategoryTable: React.FC<CategoryTableProps> = ({ 
  category, 
  items, 
  onSaveItem,
  onDeleteCategory,
  onDeleteItem,
  onEditCategory 
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);

  const handleEdit = (item: any) => {
    setCurrentItem(item);
    setModalVisible(true);
  };

  const handleAdd = () => {
    // When adding, prefill categoryName and lock it
    setCurrentItem({
      categoryName: category.name,
      visible: true,
      variantTypes: category.variantTypes || 0,
      variants: []
    });
    setModalVisible(true);
  };

  // Handle delete category confirmation
  const handleDeleteCategoryClick = () => {
    if (onDeleteCategory) {
      onDeleteCategory(category.id, category.name);
    }
  };

  // Handle delete item confirmation
  const handleDeleteItemClick = (item: any) => {
    if (onDeleteItem) {
      onDeleteItem(item.id, item.name, category.id);
    }
  };

  // Execute delete operation - NO LONGER NEEDED
  // const handleConfirmDelete = async () => { ... }

  // Cancel delete operation - NO LONGER NEEDED
  // const handleCancelDelete = () => { ... };


  // Compact analysis for this table
  const totalVariants = items.reduce((acc, item) => {
    if (Array.isArray(item.variants)) return acc + item.variants.length;
    return acc;
  }, 0);
  const visibleItems = items.filter(i => i.visible).length;

  return (
    <div style={tableContainerStyle} className="category-table-animated">
      {/* Edit and Delete icon buttons */}
      <div style={{ position: 'absolute', top: 14, right: 18, display: 'flex', gap: 8, zIndex: 2 }}>
        {onDeleteCategory && (
          <button
            onClick={handleDeleteCategoryClick}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              opacity: 0.7,
              transition: 'opacity 0.18s',
            }}
            title="Delete Category"
            onMouseOver={e => (e.currentTarget.style.opacity = '1')}
            onMouseOut={e => (e.currentTarget.style.opacity = '0.7')}
          >
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.5 5h15M8.333 9.167v5M11.667 9.167v5M3.333 5l.834 10a1.667 1.667 0 001.666 1.667h6.334a1.667 1.667 0 001.666-1.667L14.667 5M7.5 5V3.333a1.667 1.667 0 011.667-1.666h1.666A1.667 1.667 0 0112.5 3.333V5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        <button
          onClick={() => onEditCategory && onEditCategory(category)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            opacity: 0.7,
            transition: 'opacity 0.18s',
          }}
          title="Edit Category"
          onMouseOver={e => (e.currentTarget.style.opacity = '1')}
          onMouseOut={e => (e.currentTarget.style.opacity = '0.7')}
        >
          <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.5 3.5L16.5 6.5M3 17L7.5 16.5L16 8C16.2761 7.72386 16.2761 7.27614 16 7L13 4C12.7239 3.72386 12.2761 3.72386 12 4L3.5 12.5L3 17Z" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      <div style={tableHeaderStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: 20 }}>
            {category.image && (
              <img src={category.image} alt="cat" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: '50%', marginRight: 10, boxShadow: '0 2px 8px #e0e7ef' }} />
            )}
            {category.name}
          </span>
          <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#64748b', marginTop: 2 }}>
            <span>Items: <b>{items.length}</b></span>
            <span>Visible: <b>{visibleItems}</b></span>
            <span>Variants: <b>{totalVariants}</b></span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleAdd} style={addBtnStyle}>+ Add Item</button>
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={thStyle}>Name</th>
              {Array.from({ length: items[0]?.variantTypes || 0 }).map((_, idx) => (
                <th key={idx} style={thStyle}>{`Variant ${idx + 1}`}</th>
              ))}
              {items[0]?.variantTypes === 0 && (
                <th style={thStyle}>Price</th>
              )}
              <th style={thStyle}>Visible</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={3 + (items[0]?.variantTypes || 0) + (items[0]?.variantTypes === 0 ? 1 : 0)} style={{ textAlign: 'center', padding: 10, color: '#64748b' }}>No items yet</td>
              </tr>
            ) : (
              items.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s', background: item.visible ? '#fff' : '#f8fafc' }}>
                  <td style={tdStyle}>
                    {item.image && (
                      <img src={item.image} alt="item" style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: '50%', marginRight: 8, boxShadow: '0 1px 4px #e0e7ef', verticalAlign: 'middle' }} />
                    )}
                    <span style={{ verticalAlign: 'middle' }}>{item.name}</span>
                  </td>
                  {Array.from({ length: item.variantTypes }).map((_, idx) => (
                    <td key={idx} style={tdStyle}>{item[`variant${idx + 1}Name`] || ''}</td>
                  ))}
                  {item.variantTypes === 0 && (
                    <td style={tdStyle}>
                      <span style={{ color: '#059669', fontWeight: 600 }}>
                        {item.price ? `₹${Number(item.price).toFixed(2)}` : 'No price'}
                      </span>
                    </td>
                  )}
                  <td style={tdStyle}>
                    <span style={{ color: item.visible ? '#10b981' : '#f43f5e', fontWeight: 600 }}>
                      {item.visible ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleEdit(item)} style={editBtnStyle}>Edit</button>
                      {onDeleteItem && (
                        <button 
                          onClick={() => handleDeleteItemClick(item)}
                          style={deleteBtnStyle}
                          title="Delete Item"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ItemFormModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSave={onSaveItem}
        initialValues={currentItem}
        variantTypes={currentItem?.variantTypes || category.variantTypes || 0}
        categoryName={category.name}
      />
    </div>
  );
};

const tableContainerStyle: React.CSSProperties = {
  background: '#fff',
  padding: 32,
  borderRadius: 20,
  marginBottom: 36,
  boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
  border: '1.5px solid #e0e7ef',
  minWidth: 440,
  maxWidth: 760,
  marginLeft: 'auto',
  marginRight: 'auto',
  transition: 'box-shadow 0.3s, transform 0.3s, border-color 0.3s',
  position: 'relative',
  overflow: 'hidden',
};

const tableHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  marginBottom: 8,
  gap: 12,
};

const thStyle: React.CSSProperties = {
  padding: '7px 10px',
  fontWeight: 600,
  color: '#334155',
  borderBottom: '2px solid #e5e7eb',
  textAlign: 'left',
  background: '#f3f4f6',
};

const tdStyle: React.CSSProperties = {
  padding: '14px 18px',
  color: '#334155',
  fontWeight: 500,
  background: 'none',
  transition: 'background 0.2s, box-shadow 0.2s',
};

const addBtnStyle: React.CSSProperties = {
  padding: '6px 16px',
  borderRadius: 6,
  border: 'none',
  background: 'linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)',
  color: '#fff',
  fontWeight: 600,
  fontSize: 15,
  cursor: 'pointer',
  boxShadow: '0 2px 8px 0 rgba(99,102,241,0.08)',
  transition: 'background 0.2s',
};

const editBtnStyle: React.CSSProperties = {
  padding: '4px 12px',
  borderRadius: 5,
  border: 'none',
  background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
  color: '#fff',
  fontWeight: 600,
  fontSize: 14,
  marginRight: 6,
  cursor: 'pointer',
  transition: 'background 0.2s',
};

const deleteBtnStyle: React.CSSProperties = {
  padding: '4px 12px',
  borderRadius: 5,
  border: 'none',
  background: 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)',
  color: '#fff',
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
  transition: 'background 0.2s',
};

// Add hover and animation effects
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    .category-table-animated:hover {
      box-shadow: 0 8px 32px 0 rgba(99,102,241,0.13), 0 2px 12px 0 rgba(0,0,0,0.10);
      transform: translateY(-4px) scale(1.03);
      border-color: #6366f1;
    }
    .category-table-animated {
      transition: box-shadow 0.3s, transform 0.3s, border-color 0.3s;
    }
    .category-table-animated table tbody tr {
      transition: background 0.2s, box-shadow 0.2s;
    }
    .category-table-animated table tbody tr:hover {
      background: #f1f5ff;
      animation: rowPulse 0.5s;
      box-shadow: 0 2px 12px 0 rgba(99,102,241,0.08);
      cursor: pointer;
    }
    .category-table-animated button {
      transition: filter 0.18s, box-shadow 0.18s, transform 0.18s;
    }
    .category-table-animated button:hover {
      filter: brightness(1.08) saturate(1.15);
      box-shadow: 0 2px 8px 0 rgba(99,102,241,0.13);
      transform: translateY(-2px) scale(1.04);
    }
    @keyframes rowPulse {
      0% { background: #e0e7ff; }
      100% { background: #f1f5ff; }
    }
  `;
  document.head.appendChild(style);
}

export default CategoryTable;