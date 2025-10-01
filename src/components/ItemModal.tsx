
import React, { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, Switch, Button, Space, Divider, Row, Col, Tooltip } from "antd";
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

interface Props {
  visible: boolean;
  onCancel: () => void;
  onSave: (values: any) => Promise<{ success: boolean; message: string }>;
  initialValues?: any;
  variantTypes?: number;
  categoryName?: string;
}

export const ItemFormModal: React.FC<Props> = ({ visible, onCancel, onSave, initialValues, variantTypes = 0, categoryName }) => {
  const [form] = Form.useForm();
  const [localVariantTypes, setLocalVariantTypes] = useState<number>(variantTypes || initialValues?.variantTypes || 0);
  const [variantNames, setVariantNames] = useState<string[]>(["", "", ""]);
  const [variants, setVariants] = useState<any[]>([]); // [{ values: [v1, v2, v3], priceTiers: [{min, max, price}]}]
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingData, setPendingData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Preload data on open
  useEffect(() => {
    if (visible) {
      form.resetFields();
      setLocalVariantTypes(initialValues?.variantTypes || 0);
      setVariantNames([
        initialValues?.variant1Name || "",
        initialValues?.variant2Name || "",
        initialValues?.variant3Name || "",
      ]);
      setVariants(initialValues?.variants || []);
    }
  }, [visible, initialValues, form]);

  // Update variantTypes in form when local changes
  useEffect(() => {
    form.setFieldsValue({ variantTypes: localVariantTypes });
    
    // Clear price field when variant types changes from 0 to > 0
    if (localVariantTypes > 0) {
      form.setFieldsValue({ price: undefined });
    }
  }, [localVariantTypes, form]);

  // Handle variant name change
  const handleVariantNameChange = (idx: number, value: string) => {
    const newNames = [...variantNames];
    newNames[idx] = value;
    setVariantNames(newNames);
    form.setFieldsValue({ [`variant${idx + 1}Name`]: value });
  };

  // Add a new variant combination
  const handleAddVariantCombo = () => {
    setVariants([...variants, { values: Array(localVariantTypes).fill(''), priceTiers: [] }]);
  };

  // Remove a variant combination
  const handleRemoveVariantCombo = (idx: number) => {
    setVariants(variants.filter((_, i) => i !== idx));
  };

  // Update a value in a variant combination
  const handleVariantValueChange = (comboIdx: number, valueIdx: number, value: string) => {
    const newVariants = [...variants];
    newVariants[comboIdx].values[valueIdx] = value;
    setVariants(newVariants);
  };

  // Add a price tier to a variant combination
  const handleAddPriceTier = (comboIdx: number) => {
    const newVariants = [...variants];
    if (!newVariants[comboIdx].priceTiers) newVariants[comboIdx].priceTiers = [];
    newVariants[comboIdx].priceTiers.push({ min: 1, max: 1, price: 0 });
    setVariants(newVariants);
  };

  // Remove a price tier
  const handleRemovePriceTier = (comboIdx: number, tierIdx: number) => {
    const newVariants = [...variants];
    newVariants[comboIdx].priceTiers.splice(tierIdx, 1);
    setVariants(newVariants);
  };

  // Update a price tier value
  const handlePriceTierChange = (comboIdx: number, tierIdx: number, key: string, value: number) => {
    const newVariants = [...variants];
    newVariants[comboIdx].priceTiers[tierIdx][key] = value;
    setVariants(newVariants);
  };

  // Save handler with custom confirmation
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      // Additional validation for variant names when variant types > 0
      if (localVariantTypes > 0) {
        const missingVariantNames = [];
        for (let i = 0; i < localVariantTypes; i++) {
          if (!variantNames[i] || variantNames[i].trim() === '') {
            missingVariantNames.push(`Variant ${i + 1}`);
          }
        }
        if (missingVariantNames.length > 0) {
          Modal.error({
            title: 'Validation Error',
            content: `Please enter names for: ${missingVariantNames.join(', ')}`,
            centered: true
          });
          return;
        }
      }
      
      // Filter out undefined and empty string values to prevent Firestore errors
      const cleanValues = Object.fromEntries(
        Object.entries(values).filter(([_, value]) => {
          return value !== undefined && value !== null && value !== '';
        })
      );
      
      // Add variant names to clean values
      for (let i = 0; i < localVariantTypes; i++) {
        if (variantNames[i] && variantNames[i].trim() !== '') {
          cleanValues[`variant${i + 1}Name`] = variantNames[i].trim();
        }
      }
      
      const itemData: any = {
        ...cleanValues,
        variantTypes: localVariantTypes,
        variants,
        // Ensure categoryName is always present
        categoryName: categoryName || cleanValues.categoryName,
        // Ensure visible has a default value
        visible: cleanValues.visible !== undefined ? cleanValues.visible : true
      };

      // Handle price field based on variant types
      if (localVariantTypes === 0) {
        // Include price for items with no variants
        if (cleanValues.price !== undefined && cleanValues.price !== null) {
          itemData.price = cleanValues.price;
        }
      } else {
        // Remove price field for items with variants (variants have their own pricing)
        delete itemData.price;
      }
      
      // Only add id if we're editing an existing item (not creating new)
      if (initialValues?.id) {
        itemData.id = initialValues.id;
      }
      
      // Set pending data and show confirmation
      setPendingData(itemData);
      setShowConfirmation(true);
    } catch (error) {
      // Form validation error
      console.error('Form validation failed:', error);
    }
  };

  // Handle confirmation accept
  const handleConfirmSave = async () => {
    if (!pendingData) return;
    
    setSaving(true);
    try {
      const result = await onSave(pendingData);
      
      if (result.success) {
        // Show success message
        Modal.success({
          title: 'Success',
          content: result.message,
          okText: 'OK',
          centered: true,
          onOk: () => {
            setShowConfirmation(false);
            setPendingData(null);
            onCancel(); // Close the form modal after success
          }
        });
      } else {
        // Show error message but keep form open
        Modal.error({
          title: 'Error',
          content: result.message,
          centered: true,
          onOk: () => {
            setShowConfirmation(false);
            setPendingData(null);
          }
        });
      }
    } catch (error) {
      Modal.error({
        title: 'Error',
        content: 'An unexpected error occurred. Please try again.',
        centered: true,
        onOk: () => {
          setShowConfirmation(false);
          setPendingData(null);
        }
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle confirmation cancel
  const handleConfirmCancel = () => {
    setShowConfirmation(false);
    setPendingData(null);
  };

  return (
    <Modal
      open={visible}
      title={<div style={{ fontWeight: 700, fontSize: 22, letterSpacing: 0.5 }}>{initialValues?.id ? "Edit Item" : "Add New Item"}</div>}
      onCancel={showConfirmation ? undefined : onCancel} // Disable cancel during confirmation
      onOk={handleOk}
      okText={initialValues?.id ? "Save Changes" : "Add New Item"}
      cancelText="Cancel"
      closable={!showConfirmation} // Disable close button during confirmation
      maskClosable={!showConfirmation} // Disable mask click during confirmation
      okButtonProps={{ 
        loading: saving,
        disabled: showConfirmation,
        style: { 
          background: 'linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)', 
          border: 'none', 
          fontWeight: 600, 
          fontSize: 16, 
          borderRadius: 8, 
          boxShadow: '0 2px 8px 0 rgba(99,102,241,0.13)' 
        } 
      }}
      cancelButtonProps={{ 
        disabled: showConfirmation,
        style: { borderRadius: 8 } 
      }}
      styles={{
        body: { padding: 28, background: '#f9fafb', borderRadius: 16, boxShadow: '0 8px 40px 0 rgba(99,102,241,0.10), 0 2px 12px 0 rgba(0,0,0,0.10)' }
      }}
      style={{ borderRadius: 20, minWidth: 700, boxShadow: '0 8px 40px 0 rgba(99,102,241,0.13), 0 2px 12px 0 rgba(0,0,0,0.10)', zIndex: 1000 }}
    >
  <Form form={form} layout="vertical" initialValues={initialValues} style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <Form.Item 
            name="name" 
            label={<b>Item Name</b>} 
            rules={[
              { required: true, message: 'Please enter item name!' },
              { min: 2, message: 'Item name must be at least 2 characters!' }
            ]}
            hasFeedback
          > 
            <Input 
              size="large" 
              placeholder="Enter item name" 
              style={{
                border: '1.5px solid #c7d2fe',
                borderRadius: 8,
                background: '#f8fafc',
                fontWeight: 600,
                fontSize: 16,
                boxShadow: '0 1px 4px #e0e7ef',
                transition: 'border 0.2s, box-shadow 0.2s',
              }} 
            />
          </Form.Item>
          <Form.Item 
            name="categoryName" 
            label={<b>Category Name</b>} 
            rules={[{ required: true, message: 'Category name is required!' }]}
          > 
            <Input 
              size="large" 
              value={categoryName} 
              disabled 
              placeholder="Category" 
              style={{
                border: '1.5px solid #c7d2fe',
                borderRadius: 8,
                background: '#f3f4f6',
                fontWeight: 600,
                fontSize: 16,
                color: '#6366f1',
                boxShadow: '0 1px 4px #e0e7ef',
              }} 
            />
          </Form.Item>
          <Form.Item 
            name="image" 
            label={<b>Image URL</b>}
            hasFeedback
          >
            <Input 
              size="large" 
              placeholder="Paste image URL (optional)" 
              style={{
                border: '1.5px solid #c7d2fe',
                borderRadius: 8,
                background: '#f8fafc',
                fontWeight: 500,
                fontSize: 16,
                boxShadow: '0 1px 4px #e0e7ef',
              }} 
            />
          </Form.Item>
          <Form.Item name="description" label={<b>Description</b>}>
            <Input.TextArea 
              rows={4} 
              placeholder="Enter item description (optional)" 
              style={{
                border: '1.5px solid #c7d2fe',
                borderRadius: 8,
                background: '#f8fafc',
                fontWeight: 500,
                fontSize: 15,
                boxShadow: '0 1px 4px #e0e7ef',
                minHeight: 80,
                resize: 'vertical',
              }} 
            />
          </Form.Item>
          <Form.Item 
            name="visible" 
            label={<b>Visible</b>} 
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="Yes" unCheckedChildren="No" />
          </Form.Item>
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <Form.Item name="specifications" label={<b>Technical Specifications</b>}>
            <Input.TextArea 
              rows={2} 
              placeholder="Technical specs (optional)" 
              style={{
                border: '1.5px solid #c7d2fe',
                borderRadius: 8,
                background: '#f8fafc',
                fontWeight: 500,
                fontSize: 15,
                boxShadow: '0 1px 4px #e0e7ef',
                minHeight: 80,
                resize: 'vertical',
              }} 
            />
          </Form.Item>
          <Form.Item name="returnPolicy" label={<b>Return Policy</b>}>
            <Input.TextArea 
              rows={2} 
              placeholder="Return policy (optional)" 
              style={{
                border: '1.5px solid #c7d2fe',
                borderRadius: 8,
                background: '#f8fafc',
                fontWeight: 500,
                fontSize: 15,
                boxShadow: '0 1px 4px #e0e7ef',
              }} 
            />
          </Form.Item>
          <Form.Item 
            label={<b>Variant Types</b>} 
            required
            help="Number of variant types (0-3)"
          >
            <InputNumber 
              min={0} 
              max={3} 
              value={localVariantTypes} 
              onChange={v => setLocalVariantTypes(Number(v))} 
              style={{ 
                width: '100%', 
                border: '1.5px solid #c7d2fe', 
                borderRadius: 8, 
                background: '#f8fafc', 
                fontWeight: 600, 
                fontSize: 16, 
                boxShadow: '0 1px 4px #e0e7ef' 
              }} 
            />
          </Form.Item>
          {localVariantTypes === 0 && (
            <Form.Item 
              name="price" 
              label={<b>Price</b>} 
              rules={[
                { required: true, message: 'Please enter price!' },
                { type: 'number', min: 0.01, message: 'Price must be greater than 0!' }
              ]}
              hasFeedback
            >
              <InputNumber 
                min={0.01}
                step={0.01}
                precision={2}
                placeholder="0.00" 
                style={{
                  width: '100%',
                  border: '1.5px solid #c7d2fe',
                  borderRadius: 8,
                  background: '#f8fafc',
                  fontWeight: 600,
                  fontSize: 16,
                  boxShadow: '0 1px 4px #e0e7ef',
                }} 
                formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value: any) => parseFloat(value?.replace(/₹\s?|(,*)/g, '') || '0')}
              />
            </Form.Item>
          )}
          <Form.Item name="vendor" label={<b>Vendor</b>}>
            <Input 
              size="large" 
              placeholder="Enter vendor name (optional)" 
              style={{
                border: '1.5px solid #c7d2fe',
                borderRadius: 8,
                background: '#f8fafc',
                fontWeight: 500,
                fontSize: 16,
                boxShadow: '0 1px 4px #e0e7ef',
              }} 
            />
          </Form.Item>
          {[...Array(localVariantTypes)].map((_, idx) => (
            <Form.Item 
              key={idx} 
              label={<b>{`Variant ${idx + 1} Name`}</b>} 
              required
              help={`e.g. ${idx === 0 ? 'Color' : idx === 1 ? 'Size' : 'Material'}`}
            >
              <Input 
                size="large" 
                value={variantNames[idx]} 
                onChange={e => handleVariantNameChange(idx, e.target.value)} 
                placeholder={`e.g. ${idx === 0 ? 'Color' : idx === 1 ? 'Size' : 'Material'}`} 
                style={{
                  border: '1.5px solid #c7d2fe',
                  borderRadius: 8,
                  background: '#f8fafc',
                  fontWeight: 500,
                  fontSize: 16,
                  boxShadow: '0 1px 4px #e0e7ef',
                }} 
              />
            </Form.Item>
          ))}
        </div>
      </Form>
      <Divider orientation="left" style={{ margin: '18px 0 10px 0' }}>Variant Combinations & Price Tiers</Divider>
      <div>
        <Button icon={<PlusOutlined />} type="dashed" onClick={handleAddVariantCombo} style={{ marginBottom: 12 }}>
          Add Variant Combination
        </Button>
        <div style={{ maxHeight: 260, overflowY: 'auto' }}>
          {variants.map((variant, vIdx) => (
            <div key={vIdx} style={{ background: '#fff', border: '1.5px solid #c7d2fe', borderRadius: 10, marginBottom: 16, padding: 14, boxShadow: '0 1px 8px #e0e7ef' }}>
              <Row gutter={8} align="middle">
                {[...Array(localVariantTypes)].map((_, idx) => (
                  <Col key={idx} span={6}>
                    <Input
                      size="middle"
                      value={variant.values[idx] || ''}
                      onChange={e => handleVariantValueChange(vIdx, idx, e.target.value)}
                      placeholder={variantNames[idx] || `Variant ${idx + 1}`}
                      style={{
                        border: '1.5px solid #c7d2fe',
                        borderRadius: 8,
                        background: '#f8fafc',
                        fontWeight: 500,
                        fontSize: 15,
                        boxShadow: '0 1px 4px #e0e7ef',
                      }}
                    />
                  </Col>
                ))}
                <Col span={3}>
                  <Tooltip title="Remove Combination">
                    <Button icon={<DeleteOutlined />} danger size="small" onClick={() => handleRemoveVariantCombo(vIdx)} />
                  </Tooltip>
                </Col>
              </Row>
              <div style={{ marginTop: 10, marginLeft: 8 }}>
                <b>Price Tiers:</b>
                <Button icon={<PlusOutlined />} size="small" style={{ marginLeft: 8 }} onClick={() => handleAddPriceTier(vIdx)}>
                  Add Price Tier
                </Button>
                {/* Price Tier Headings for this variant */}
                <div style={{ display: 'flex', gap: 12, margin: '10px 0 6px 0', fontWeight: 500, color: '#6366f1', fontSize: 15, opacity: 0.85 }}>
                  <div style={{ width: 80 }}>Min Qty</div>
                  <div style={{ width: 80 }}>Max Qty</div>
                  <div style={{ width: 100 }}>Price</div>
                  <div style={{ width: 110 }}>Delivery Fee</div>
                  <div style={{ width: 150 }}>Loading/Unloading Fee</div>
                </div>
                <div style={{ marginTop: 0 }}>
                  {variant.priceTiers && variant.priceTiers.length > 0 ? variant.priceTiers.map((tier: any, tIdx: number) => (
                    <Space key={tIdx} style={{ marginBottom: 4 }}>
                      <InputNumber min={1} value={tier.min} onChange={v => handlePriceTierChange(vIdx, tIdx, 'min', Number(v))} placeholder="Min Qty" style={{ width: 80, border: '1.5px solid #c7d2fe', borderRadius: 8, background: '#f8fafc', fontWeight: 500, fontSize: 15, boxShadow: '0 1px 4px #e0e7ef' }} />
                      <InputNumber min={tier.min || 1} value={tier.max} onChange={v => handlePriceTierChange(vIdx, tIdx, 'max', Number(v))} placeholder="Max Qty" style={{ width: 80, border: '1.5px solid #c7d2fe', borderRadius: 8, background: '#f8fafc', fontWeight: 500, fontSize: 15, boxShadow: '0 1px 4px #e0e7ef' }} />
                      <InputNumber min={0} value={tier.price} onChange={v => handlePriceTierChange(vIdx, tIdx, 'price', Number(v))} placeholder="Price" style={{ width: 100, border: '1.5px solid #c7d2fe', borderRadius: 8, background: '#f8fafc', fontWeight: 500, fontSize: 15, boxShadow: '0 1px 4px #e0e7ef' }} />
                       <InputNumber min={0} value={tier.deliveryFee || 0} onChange={v => handlePriceTierChange(vIdx, tIdx, 'deliveryFee', Number(v))} placeholder="Delivery Fee" style={{ width: 110, border: '1.5px solid #c7d2fe', borderRadius: 8, background: '#f8fafc', fontWeight: 500, fontSize: 15, boxShadow: '0 1px 4px #e0e7ef' }} />
                       <InputNumber min={0} value={tier.loadingUnloadingFee || 0} onChange={v => handlePriceTierChange(vIdx, tIdx, 'loadingUnloadingFee', Number(v))} placeholder="Loading/Unloading Fee" style={{ width: 150, border: '1.5px solid #c7d2fe', borderRadius: 8, background: '#f8fafc', fontWeight: 500, fontSize: 15, boxShadow: '0 1px 4px #e0e7ef' }} />
                      <Tooltip title="Remove Tier">
                        <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleRemovePriceTier(vIdx, tIdx)} />
                      </Tooltip>
                    </Space>
                  )) : <span style={{ color: '#64748b', marginLeft: 8 }}>No price tiers yet.</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Custom Confirmation Dialog */}
      {showConfirmation && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 10001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: 32,
            minWidth: 400,
            maxWidth: 500,
            boxShadow: '0 12px 48px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e0e7ef'
          }}>
            <div style={{
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 16,
              color: '#1f2937',
              textAlign: 'center'
            }}>
              {initialValues?.id ? 'Save Changes' : 'Add New Item'}
            </div>
            <div style={{
              fontSize: 16,
              color: '#6b7280',
              marginBottom: 24,
              textAlign: 'center',
              lineHeight: 1.5
            }}>
              {initialValues?.id 
                ? 'Are you sure you want to save these changes?' 
                : `Are you sure you want to add "${pendingData?.name || 'this item'}" to the ${categoryName} category?`}
            </div>
            <div style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center'
            }}>
              <Button 
                onClick={handleConfirmCancel}
                size="large"
                style={{
                  borderRadius: 8,
                  fontWeight: 600,
                  minWidth: 100
                }}
              >
                Cancel
              </Button>
              <Button 
                type="primary"
                onClick={handleConfirmSave}
                loading={saving}
                size="large"
                style={{
                  background: 'linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  minWidth: 120
                }}
              >
                {saving ? 'Saving...' : (initialValues?.id ? 'Save Changes' : 'Add Item')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
