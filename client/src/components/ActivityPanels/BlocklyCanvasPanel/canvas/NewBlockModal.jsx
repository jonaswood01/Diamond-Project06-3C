import { useState } from 'react';
import { Button, Input, Form } from 'antd';

export default function NewBlockModal({ handleCancelCb, handleOkCb, visible, setVisible }) {
  const [form] = Form.useForm();


  const handleCancel = () => {
    handleCancelCb();
    setVisible(false);
  };

  const handleSubmit = (values) => {
    handleOkCb(values);
    setVisible(false);
    
  };

  return (
    <div
      style={{
        display: visible ? 'block' : 'none',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '20px',
        width: '450px',
        marginRight: '10px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Customized title */}
      <div style={{ height: '50px', marginBottom: '10px', textAlign: 'center', background: '#5babde', padding: '5px', borderRadius: '20px', width: '350px', marginLeft: '30px', }}>
        <h2 style={{ marginTop: '5px', color: 'white', fontSize: '1.2em',  fontWeight: 'bold' }}>
          Create New BLock
        </h2>
      </div>
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item name="blockName" label="Block Name">
          <Input />
        </Form.Item>
        <Form.Item name="blockDescription" label="Block Description">
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item name="blockType" label="Block Type">
          <Input />
        </Form.Item>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            type="submit"
            className="btn"
            style={{
              borderRadius: '8px',
              margin: '8px',
              padding: '8px 16px',
              cursor: 'pointer',
              border: '2px solid #5babde',
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = '#f3d250')}
            onMouseOut={(e) => (e.target.style.backgroundColor = '')}
          >
            Submit
          </button>
          <button
            onClick={handleCancel}
            style={{
              borderRadius: '8px',
              margin: '8px',
              padding: '8px 16px',
              cursor: 'pointer',
              border: '2px solid #5babde',
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = '#f3d250')}
            onMouseOut={(e) => (e.target.style.backgroundColor = '')}
          >
            Cancel
          </button>
        </div>
      </Form>
    </div>
  );
}
