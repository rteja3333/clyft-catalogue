import React, { useEffect, useState } from "react";
import { Layout, Button } from "antd";
import { db } from "./firebase";
import { collection, CollectionReference, DocumentData, getDocs, addDoc as firebaseAddDoc, doc, deleteDoc, query, where, updateDoc } from "firebase/firestore";
import { Modal } from "antd";
import AnalysisPanel from "./components/AnalysisPanel";
import CategoryTable from "./components/CategoryTable";
import { useCategoryEditModal } from "./useCategoryEditModal";
import TableCreationModal from "./components/TableCreationModal";
import AdminPasscodeModal from "./components/AdminPasscodeModal";
import { verifyAdminPasscode } from "./utils/adminPasscode";
import LoadingOverlay from "./components/LoadingOverlay";


const { Header, Content } = Layout;


function App() {
  const { show: showEditCategoryModal, Modal: EditCategoryModal } = useCategoryEditModal();
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [minLoading, setMinLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [passcodeModal, setPasscodeModal] = useState(true);
  const [passcodeError, setPasscodeError] = useState<string | undefined>(undefined);
  const [authenticating, setAuthenticating] = useState(false); // Used in handlePasscodeSubmit
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteType, setDeleteType] = useState<'category' | 'item'>('item');
  const [deleteData, setDeleteData] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [showBackupConfirm, setShowBackupConfirm] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showSafetyTips, setShowSafetyTips] = useState(false);

  function useCategoryGridResponsiveStyle() {
    useEffect(() => {
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        if (!document.getElementById('category-grid-responsive-style')) {
          const style = document.createElement('style');
          style.id = 'category-grid-responsive-style';
          style.innerHTML = `
            .category-grid-responsive {
              grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
            }
            @media (max-width: 1200px) {
              .category-grid-responsive {
                grid-template-columns: repeat(2, 1fr);
              }
            }
            @media (max-width: 900px) {
              .category-grid-responsive {
                grid-template-columns: 1fr;
              }
            }
          `;
          document.head.appendChild(style);
        }
      }
    }, []);
  }
  useCategoryGridResponsiveStyle();

  const fetchData = async () => {
    setLoading(true);
  setMinLoading(true);
  const minTimer = setTimeout(() => setMinLoading(false), 2000);
    try {
      const catSnap = await getDocs(collection(db, "categories"));
      setCategories(catSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      const itemSnap = await getDocs(collection(db, "widelisting"));
      setItems(itemSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) { console.error(err); }
    finally {
      setLoading(false);
      // minLoading will be set to false by timer
    }
    return () => clearTimeout(minTimer);
  };

  useEffect(() => {
    if (!passcodeModal) fetchData();
  }, [passcodeModal]);

  const groupedItems = categories.reduce<Record<string, any[]>>((acc, cat) => {
    acc[cat.name] = items.filter(i => i.categoryName === cat.name);
    return acc;
  }, {});

  const handleCreateTable = async (category: { name: string; image?: string; visible?: boolean }) => {
    await addDoc(collection(db, "categories"), category);
    setCreateModal(false);
    fetchData();
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    setDeleteType('category');
    setDeleteData({ id: categoryId, name: categoryName });
    setShowDeleteConfirmation(true);
  };

  const handleDeleteItem = async (itemId: string, itemName: string, categoryId: string) => {
    setDeleteType('item');
    setDeleteData({ id: itemId, name: itemName, categoryId: categoryId });
    setShowDeleteConfirmation(true);
  };

  // Execute the actual delete operation
  const executeDelete = async () => {
    if (!deleteData) return;
    
    setDeleting(true);
    try {
      let result;
      if (deleteType === 'category') {
        // Delete category logic
        const itemsQuery = query(
          collection(db, 'widelisting'),
          where('categoryName', '==', deleteData.name)
        );
        const itemsSnapshot = await getDocs(itemsQuery);
        
        // Delete each item
        for (const itemDoc of itemsSnapshot.docs) {
          await deleteDoc(doc(db, 'widelisting', itemDoc.id));
        }

        // Delete the category
        await deleteDoc(doc(db, 'categories', deleteData.id));

        // Refresh data
        await fetchData();

        result = { 
          success: true, 
          message: `Category "${deleteData.name}" and ${itemsSnapshot.docs.length} items deleted successfully!` 
        };
      } else {
        // Delete item logic
        await deleteDoc(doc(db, 'widelisting', deleteData.id));

        // Remove the item from category's widelistingItems array
        if (deleteData.categoryId) {
          const categoryRef = doc(db, 'categories', deleteData.categoryId);
          const category = categories.find(cat => cat.id === deleteData.categoryId);
          if (category) {
            const updatedWidelistingItems = (category.widelistingItems || []).filter(
              (item: any) => item.id !== deleteData.id
            );
            await updateDoc(categoryRef, {
              widelistingItems: updatedWidelistingItems,
              lastUpdated: new Date().toISOString()
            });
          }
        }

        // Refresh data
        await fetchData();

        result = { 
          success: true, 
          message: `Item "${deleteData.name}" deleted successfully!` 
        };
      }
      
      if (result.success) {
        // Show success message
        Modal.success({
          title: 'Success',
          content: result.message,
          okText: 'OK',
          centered: true,
          onOk: () => {
            setShowDeleteConfirmation(false);
            setDeleteData(null);
          }
        });
      }
    } catch (error) {
      console.error('Error deleting:', error);
      Modal.error({
        title: 'Error',
        content: `Failed to delete ${deleteType}. Please try again.`,
        centered: true,
        onOk: () => {
          setShowDeleteConfirmation(false);
          setDeleteData(null);
        }
      });
    } finally {
      setDeleting(false);
    }
  };

  // Cancel delete operation
  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setDeleteData(null);
  };

  // Backup download functionality
  const handleBackupDownload = () => {
    setShowBackupConfirm(true);
  };

  const executeBackupDownload = async () => {
    setDownloading(true);
    try {
      // Create backup data with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const backupData = {
        categories: categories,
        widelisting: items,
        timestamp: new Date().toISOString(),
        exportedBy: 'Clyft Catalogue Admin',
        version: '1.0'
      };

      // Create and download file
      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `clyft-backup-${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setShowBackupConfirm(false);
      
      // Show success message
      Modal.success({
        title: 'Backup Downloaded',
        content: `Backup file "clyft-backup-${timestamp}.json" has been downloaded successfully!`,
        centered: true
      });
    } catch (error) {
      console.error('Error creating backup:', error);
      Modal.error({
        title: 'Download Failed',
        content: 'Failed to create backup file. Please try again.',
        centered: true
      });
    } finally {
      setDownloading(false);
    }
  };

  const cancelBackupDownload = () => {
    setShowBackupConfirm(false);
  };

  // Safety tips functionality
  const handleSafetyTips = () => {
    setShowSafetyTips(true);
  };

  const closeSafetyTips = () => {
    setShowSafetyTips(false);
  };

  const handlePasscodeSubmit = async (input: string) => {
    setAuthenticating(true);
    setPasscodeError(undefined);
    try {
      const ok = await verifyAdminPasscode(input);
      if (ok) {
        setPasscodeModal(false);
      } else {
        setPasscodeError("Incorrect passcode. Try again.");
      }
    } catch (e) { 
      setPasscodeError("Error verifying passcode.");
    } finally {
      setAuthenticating(false);
    }
  };

  return (
    <>
      <AdminPasscodeModal
        visible={passcodeModal}
        onSubmit={handlePasscodeSubmit}
        error={passcodeError}
        loading={authenticating}
      />
      {!passcodeModal && (
        <Layout style={{ minHeight: "100vh", background: '#f3f4f6' }}>
          <Header style={{ background: '#111', padding: 0, boxShadow: '0 2px 12px #e0e7ef', minHeight: 120, zIndex: 2 }}>
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center',
              minHeight: 120,
              padding: '10px 0 8px 0',
            }}>
              <span style={{
                fontSize: 44,
                fontWeight: 900,
                letterSpacing: 2,
                color: '#fff',
                textShadow: '0 2px 16px #000, 0 1px 0 #222',
                marginBottom: 0,
                fontFamily: 'Montserrat, Inter, Arial, sans-serif',
                textTransform: 'uppercase',
              }}>Clyft</span>
              <span style={{
                fontSize: 20,
                color: '#fff',
                fontWeight: 500,
                letterSpacing: 1,
                textShadow: '0 1px 8px #000',
                fontFamily: 'Inter, Arial, sans-serif',
                marginTop: 0,
                marginBottom: 0,
                position: 'relative',
                top: '0',
              }}>
                Catalogue Admin Panel
              </span>
            </div>
          </Header>
          <div style={{ minHeight: 32 }} />
          <Content style={{ padding: 20, marginTop: 0 }}>
            {(loading || minLoading) && <LoadingOverlay />}
            {!loading && !minLoading && <>
              <AnalysisPanel categories={categories} items={items} />
              <div style={{ display: 'flex', gap: 16, marginBottom: 20, alignItems: 'center' }}>
                <Button type="dashed" onClick={() => setCreateModal(true)}>Create New Category</Button>
                <Button 
                  type="primary"
                  onClick={handleBackupDownload}
                  style={{
                    background: 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
                    border: 'none',
                    fontWeight: 600,
                    borderRadius: 8,
                    boxShadow: '0 2px 8px 0 rgba(5,150,105,0.2)'
                  }}
                >
                  📥 Download Backup
                </Button>
                <Button 
                  type="default"
                  onClick={handleSafetyTips}
                  style={{
                    background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
                    border: 'none',
                    color: 'white',
                    fontWeight: 600,
                    borderRadius: 8,
                    boxShadow: '0 2px 8px 0 rgba(245,158,11,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  🛡️ Safety Tips
                </Button>
              </div>
              <div
                className="category-grid-responsive"
                style={{
                  display: 'grid',
                  gap: 32,
                  alignItems: 'stretch',
                  marginBottom: 24,
                  gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
                }}
              >
                {categories.map(cat => (
                  <CategoryTable
                    key={cat.name}
                    category={cat}
                    items={groupedItems[cat.name] || []}
                    onSaveItem={async (item: any) => {
                      try {
                        console.log('Saving item:', item); // Debug log
                        console.log('Item ID exists:', !!item.id); // Debug log
                        
                        if (item.id && item.id.trim() !== '') {
                          // For editing existing items
                          console.log('Updating existing item with ID:', item.id);
                          const updateData = {
                            ...item,
                            updatedAt: new Date().toISOString()
                          };
                          // Remove the id from the update data as Firestore doesn't allow updating the document ID
                          delete updateData.id;
                          
                          await updateDoc(doc(db, 'widelisting', item.id), updateData);
                        } else {
                          // For adding new items
                          console.log('Creating new item (no ID found)');
                          if (!cat.id) {
                            throw new Error('Category ID is missing. Please refresh the page and try again.');
                          }
                          
                          const newItemData = {
                            ...item,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            categoryId: cat.id, // Store reference to category
                            categoryName: cat.name, // Also store category name for easier queries
                            visible: item.visible ?? true // Default to visible if not set
                          };

                          // Add to widelisting collection
                          const docRef = await addDoc(collection(db, 'widelisting'), newItemData);

                          // Update category's widelistingItems array (only if category has an ID)
                          if (cat.id) {
                            const categoryRef = doc(db, 'categories', cat.id);
                            await updateDoc(categoryRef, {
                              widelistingItems: [
                                ...(cat.widelistingItems || []),
                                {
                                  id: docRef.id,
                                  name: item.name,
                                  addedAt: new Date().toISOString()
                                }
                              ],
                              lastUpdated: new Date().toISOString()
                            });
                          }
                        }

                        // Refresh data
                        await fetchData();
                        
                        return { success: true, message: item.id ? 'Changes saved successfully!' : 'Item added successfully!' };
                      } catch (e) {
                        console.error('Error saving item:', e);
                        return { success: false, message: `Failed to ${item.id ? 'update' : 'add'} item. Please try again.` };
                      }
                    }}
                    onDeleteCategory={handleDeleteCategory}
                    onDeleteItem={handleDeleteItem}
                    onEditCategory={async (category) => {
                      showEditCategoryModal(category, async ({ image, visible }) => {
                        try {
                          const { db, doc, updateDoc } = await import('./firebase');
                          await updateDoc(doc(db, 'categories', category.id), { image, visible });
                          window.location.reload();
                        } catch (e) {
                          Modal.error({ title: 'Error', content: 'Failed to update category.' });
                        }
                      });
                    }}
                  />
                ))}
              </div>
              <TableCreationModal
                visible={createModal}
                onClose={() => setCreateModal(false)}
                categories={categories}
                existingCategories={items.map(i => i.categoryName)}
                onCreate={category => { handleCreateTable(category); }}
              />
              {EditCategoryModal}
            </>}
          </Content>
          
          {/* Custom Delete Confirmation Dialog */}
          {showDeleteConfirmation && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 10002,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                background: '#fff',
                borderRadius: 16,
                padding: 32,
                minWidth: 450,
                maxWidth: 600,
                boxShadow: '0 12px 48px rgba(0, 0, 0, 0.25)',
                border: '1px solid #e0e7ef'
              }}>
                <div style={{
                  fontSize: 20,
                  fontWeight: 700,
                  marginBottom: 16,
                  color: '#dc2626',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}>
                  <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.5 5h15M8.333 9.167v5M11.667 9.167v5M3.333 5l.834 10a1.667 1.667 0 001.666 1.667h6.334a1.667 1.667 0 001.666-1.667L14.667 5M7.5 5V3.333a1.667 1.667 0 011.667-1.666h1.666A1.667 1.667 0 0112.5 3.333V5" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {deleteType === 'category' ? 'Delete Category' : 'Delete Item'}
                </div>
                <div style={{
                  fontSize: 16,
                  color: '#374151',
                  marginBottom: 20,
                  textAlign: 'center',
                  lineHeight: 1.6
                }}>
                  {deleteType === 'category' ? (
                    <div>
                      <p style={{ marginBottom: 12 }}>Are you sure you want to delete the category <strong>"{deleteData?.name}"</strong>?</p>
                      <p style={{ color: '#dc2626', fontWeight: 'bold', marginBottom: 8 }}>
                        ⚠️ This will also delete ALL items in this category!
                      </p>
                      <p style={{ fontSize: 14, color: '#6b7280' }}>This action cannot be undone.</p>
                    </div>
                  ) : (
                    <div>
                      <p style={{ marginBottom: 8 }}>Are you sure you want to delete <strong>"{deleteData?.name}"</strong>?</p>
                      <p style={{ fontSize: 14, color: '#6b7280' }}>This action cannot be undone.</p>
                    </div>
                  )}
                </div>
                <div style={{
                  display: 'flex',
                  gap: 12,
                  justifyContent: 'center'
                }}>
                  <Button 
                    onClick={cancelDelete}
                    size="large"
                    style={{
                      borderRadius: 8,
                      fontWeight: 600,
                      minWidth: 120
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="primary"
                    danger
                    onClick={executeDelete}
                    loading={deleting}
                    size="large"
                    style={{
                      background: 'linear-gradient(90deg, #dc2626 0%, #ef4444 100%)',
                      border: 'none',
                      borderRadius: 8,
                      fontWeight: 600,
                      minWidth: 140
                    }}
                  >
                    {deleting ? 'Deleting...' : (deleteType === 'category' ? 'Delete Category' : 'Delete Item')}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Backup Confirmation Modal */}
          {showBackupConfirm && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
                backdropFilter: 'blur(8px)'
              }}
            >
              <div
                style={{
                  background: '#fff',
                  borderRadius: 16,
                  padding: 32,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                  maxWidth: 480,
                  width: '90%',
                  textAlign: 'center'
                }}
              >
                <div style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#059669',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 16v-4M12 8h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Download Backup
                </div>
                <div style={{
                  fontSize: 16,
                  color: '#374151',
                  marginBottom: 20,
                  textAlign: 'center',
                  lineHeight: 1.6
                }}>
                  <p style={{ marginBottom: 12 }}>This will download a complete backup of all your categories and widelisting data.</p>
                  <p style={{ fontSize: 14, color: '#6b7280' }}>The file will include a timestamp and can be used to restore your data.</p>
                </div>
                <div style={{
                  display: 'flex',
                  gap: 12,
                  justifyContent: 'center'
                }}>
                  <Button 
                    onClick={cancelBackupDownload}
                    size="large"
                    style={{
                      borderRadius: 8,
                      fontWeight: 600,
                      minWidth: 120
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="primary"
                    onClick={executeBackupDownload}
                    loading={downloading}
                    size="large"
                    style={{
                      background: 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
                      border: 'none',
                      borderRadius: 8,
                      fontWeight: 600,
                      minWidth: 140
                    }}
                  >
                    {downloading ? 'Downloading...' : 'Download Backup'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Safety Tips Modal */}
          {showSafetyTips && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
                backdropFilter: 'blur(8px)'
              }}
            >
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 20,
                  padding: '32px 36px',
                  boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                  maxWidth: 600,
                  width: '90%',
                  maxHeight: '80vh',
                  overflowY: 'auto'
                }}
              >
                {/* Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 24
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)'
                    }}>
                      🛡️
                    </div>
                    <div>
                      <h2 style={{
                        fontSize: 24,
                        fontWeight: 700,
                        color: '#1f2937',
                        margin: 0,
                        letterSpacing: 0.5
                      }}>
                        Safety Tips & Best Practices
                      </h2>
                      <p style={{
                        fontSize: 14,
                        color: '#6b7280',
                        margin: '4px 0 0 0'
                      }}>
                        Essential guidelines for safe data management
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeSafetyTips}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: 24,
                      color: '#9ca3af',
                      cursor: 'pointer',
                      borderRadius: '50%',
                      width: 36,
                      height: 36,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#f3f4f6';
                      e.currentTarget.style.color = '#374151';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'none';
                      e.currentTarget.style.color = '#9ca3af';
                    }}
                  >
                    ×
                  </button>
                </div>

                {/* Tips Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  
                  {/* Backup Safety */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(248, 113, 113, 0.05) 100%)',
                    border: '1px solid rgba(239, 68, 68, 0.1)',
                    borderRadius: 12,
                    padding: 20
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 12
                    }}>
                      <span style={{ fontSize: 20 }}>📥</span>
                      <h3 style={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: '#dc2626',
                        margin: 0
                      }}>
                        Backup Safety
                      </h3>
                    </div>
                    <ul style={{
                      fontSize: 14,
                      color: '#374151',
                      lineHeight: 1.6,
                      margin: 0,
                      paddingLeft: 20
                    }}>
                      <li><strong>Always download backup before making major changes</strong></li>
                      <li>Store backups in a safe location (cloud storage, external drive)</li>
                      <li>Regular backups prevent data loss during system updates</li>
                      <li>Backup filename includes timestamp for easy identification</li>
                    </ul>
                  </div>

                  {/* Deletion Warning */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(245, 101, 101, 0.05) 0%, rgba(248, 113, 113, 0.05) 100%)',
                    border: '1px solid rgba(245, 101, 101, 0.1)',
                    borderRadius: 12,
                    padding: 20
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 12
                    }}>
                      <span style={{ fontSize: 20 }}>⚠️</span>
                      <h3 style={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: '#dc2626',
                        margin: 0
                      }}>
                        Deletion Warnings
                      </h3>
                    </div>
                    <ul style={{
                      fontSize: 14,
                      color: '#374151',
                      lineHeight: 1.6,
                      margin: 0,
                      paddingLeft: 20
                    }}>
                      <li><strong>Deleting a category removes ALL items within it</strong></li>
                      <li>This action cannot be undone - ensure you have backups</li>
                      <li>Double-check category contents before deletion</li>
                      <li>Consider moving items to another category first</li>
                    </ul>
                  </div>

                  {/* Data Entry Best Practices */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(96, 165, 250, 0.05) 100%)',
                    border: '1px solid rgba(59, 130, 246, 0.1)',
                    borderRadius: 12,
                    padding: 20
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 12
                    }}>
                      <span style={{ fontSize: 20 }}>📝</span>
                      <h3 style={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: '#2563eb',
                        margin: 0
                      }}>
                        Data Entry Guidelines
                      </h3>
                    </div>
                    <ul style={{
                      fontSize: 14,
                      color: '#374151',
                      lineHeight: 1.6,
                      margin: 0,
                      paddingLeft: 20
                    }}>
                      <li><strong>Item names must be unique</strong> within each category</li>
                      <li><strong>Category names should be distinct</strong> and descriptive</li>
                      <li>Use clear, consistent naming conventions</li>
                      <li>Image fields accept any string (URLs, file paths, or identifiers)</li>
                      <li>Set appropriate visibility status for each item</li>
                      <li>Use variant types (0-3) to organize product variations</li>
                    </ul>
                  </div>

                  {/* Pricing Guidelines */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)',
                    border: '1px solid rgba(5, 150, 105, 0.1)',
                    borderRadius: 12,
                    padding: 20
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 12
                    }}>
                      <span style={{ fontSize: 20 }}>₹</span>
                      <h3 style={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: '#059669',
                        margin: 0
                      }}>
                        Pricing Best Practices
                      </h3>
                    </div>
                    <ul style={{
                      fontSize: 14,
                      color: '#374151',
                      lineHeight: 1.6,
                      margin: 0,
                      paddingLeft: 20
                    }}>
                      <li><strong>Price field appears only when variant types = 0</strong></li>
                      <li>For items with variants, pricing is handled within variant tiers</li>
                      <li>Always enter prices in rupees (₹) format</li>
                      <li>Ensure price consistency across similar items</li>
                      <li>Review pricing before making items visible to customers</li>
                    </ul>
                  </div>

                </div>

                {/* Footer */}
                <div style={{
                  textAlign: 'center',
                  marginTop: 28,
                  paddingTop: 20,
                  borderTop: '1px solid rgba(0,0,0,0.1)'
                }}>
                  <Button
                    type="primary"
                    onClick={closeSafetyTips}
                    size="large"
                    style={{
                      background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
                      border: 'none',
                      borderRadius: 10,
                      fontWeight: 600,
                      paddingLeft: 32,
                      paddingRight: 32,
                      boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
                    }}
                  >
                    Got It! 👍
                  </Button>
                  <p style={{
                    fontSize: 12,
                    color: '#9ca3af',
                    margin: '12px 0 0 0',
                    fontStyle: 'italic'
                  }}>
                    🔒 Keep these tips in mind for safe data management
                  </p>
                </div>
              </div>
            </div>
          )}
        </Layout>
      )}
    </>
  );
}

export default App;

// Implementation of addDoc using Firebase Firestore
async function addDoc(
  collectionRef: CollectionReference<DocumentData, DocumentData>,
  data: { name: string }
) {
  return await firebaseAddDoc(collectionRef, data);
}

