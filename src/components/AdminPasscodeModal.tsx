import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Alert } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';

interface Props {
  visible: boolean;
  onSubmit: (passcode: string) => void;
  error?: string;
  loading?: boolean;
}

const AdminPasscodeModal: React.FC<Props> = ({ visible, onSubmit, error, loading }) => {
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsAnimated(true);
    }
  }, [visible]);

  const handleSubmit = () => {
    if (passcode.trim()) {
      onSubmit(passcode);
    }
  };

  return (
    <Modal
      open={visible}
      closable={false}
      footer={null}
      centered
      zIndex={9999}
      width={420}
      styles={{
        mask: {
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
        },
        content: {
          padding: 0,
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }
      }}
      maskClosable={false}
    >
      <div style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
        height: 120,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background circles */}
        <div style={{
          position: 'absolute',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          top: -50,
          left: -50,
          animation: 'float 6s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          bottom: -30,
          right: -30,
          animation: 'float 4s ease-in-out infinite reverse'
        }} />
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 1,
          transform: isAnimated ? 'translateY(0)' : 'translateY(20px)',
          opacity: isAnimated ? 1 : 0,
          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <div style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)'
          }}>
            <LockOutlined style={{ fontSize: 24, color: 'white' }} />
          </div>
          <h2 style={{
            color: 'white',
            margin: 0,
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: 0.5,
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
          }}>
            Admin Access
          </h2>
        </div>
      </div>

      <div style={{
        padding: '40px 32px 32px',
        transform: isAnimated ? 'translateY(0)' : 'translateY(30px)',
        opacity: isAnimated ? 1 : 0,
        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s'
      }}>
        <div style={{
          position: 'relative',
          marginBottom: 24
        }}>
          <div style={{
            position: 'relative',
            transform: inputFocused ? 'scale(1.02)' : 'scale(1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <UserOutlined style={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 16,
              color: inputFocused ? '#667eea' : '#9CA3AF',
              zIndex: 1,
              transition: 'all 0.3s ease'
            }} />
            
            <Input
              type={showPassword ? 'text' : 'password'}
              size="large"
              placeholder="Enter passcode"
              value={passcode}
              onChange={e => setPasscode(e.target.value)}
              onPressEnter={handleSubmit}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              style={{
                paddingLeft: 48,
                paddingRight: 48,
                height: 52,
                border: inputFocused ? '2px solid #667eea' : '2px solid #E5E7EB',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 500,
                background: inputFocused ? 'rgba(102, 126, 234, 0.05)' : '#FAFAFA',
                boxShadow: inputFocused 
                  ? '0 0 0 4px rgba(102, 126, 234, 0.1), 0 4px 15px rgba(102, 126, 234, 0.2)' 
                  : '0 2px 8px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                outline: 'none'
              }}
            />
            
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: inputFocused ? '#667eea' : '#9CA3AF',
                fontSize: 16,
                padding: 4,
                borderRadius: 4,
                transition: 'all 0.2s ease'
              }}
            >
              {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            animation: 'shake 0.5s ease-in-out',
            marginBottom: 20
          }}>
            <Alert 
              type="error" 
              message={error} 
              showIcon 
              style={{
                borderRadius: 10,
                border: '1px solid #FEE2E2',
                background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)'
              }}
            />
          </div>
        )}

        <Button
          type="primary"
          block
          size="large"
          onClick={handleSubmit}
          loading={loading}
          disabled={!passcode.trim()}
          style={{
            height: 52,
            borderRadius: 12,
            border: 'none',
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
            color: 'white',
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: 0.5,
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3), 0 3px 10px rgba(0, 0, 0, 0.2)',
            transform: 'translateY(-1px)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: passcode.trim() ? 'pointer' : 'not-allowed',
            opacity: passcode.trim() ? 1 : 0.6
          }}
          onMouseEnter={e => {
            if (passcode.trim()) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.4), 0 5px 15px rgba(0, 0, 0, 0.3)';
            }
          }}
          onMouseLeave={e => {
            if (passcode.trim()) {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3), 0 3px 10px rgba(0, 0, 0, 0.2)';
            }
          }}
        >
          {loading ? 'Authenticating...' : 'Access Dashboard'}
        </Button>

        <div style={{
          textAlign: 'center',
          marginTop: 20,
          padding: '16px 0',
          borderTop: '1px solid #E5E7EB'
        }}>
          <p style={{
            color: '#6B7280',
            fontSize: 13,
            margin: 0,
            fontStyle: 'italic'
          }}>
            🔒 Secure access to Clyft Catalogue Admin
          </p>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .ant-input:focus {
          border-color: #667eea !important;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1), 0 4px 15px rgba(102, 126, 234, 0.2) !important;
        }
        
        .ant-btn:focus {
          outline: none !important;
        }
      `}</style>
    </Modal>
  );
};

export default AdminPasscodeModal;
