import React, { useState } from "react";

const BlockConfigEditor = ({ initialConfig, onSave, onCancel }) => {
  const [config, setConfig] = useState("");

 

  const handleSave = () => {
    
    onSave(config);
  };

  return (
    <div>
    <div style={{ backgroundColor:  '#F4F4F5', padding: '15px', borderRadius: '20px',  width: '450px', marginRight: '10px' }}>

      <div style={{ height: '50px', marginBottom: '10px', textAlign: 'center', background: '#5babde', padding: '5px', borderRadius: '20px', width: '350px', marginLeft: '30px', }}>
      <h2 style={{ marginTop: '5px', color: 'white', fontSize: '1.2em', fontWeight: 'bold' }}>
        Configure New Block
      </h2>
    </div>
      <textarea
        value={config}
        onChange={(e) => setConfig(e.target.value)}
        placeholder="Type your configuration here..."  // Placeholder text
        rows={17}
        cols={60}  
        style={{ borderRadius: '20px', padding: '8px', border: '2px solid #5babde', width: '100%' }} 
      />
    
      <button
        onClick={handleSave}
        style={{
          borderRadius: '8px',
          margin: '8px',
          padding: '8px 16px',
          cursor: 'pointer',  // Change cursor on hover
          border: '2px solid #5babde',
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = '#f3d250')}  // Change background color on hover
        onMouseOut={(e) => (e.target.style.backgroundColor = '')}  // Reset background color on mouse out
      >
        Save
      </button>
      <button
        onClick={onCancel}
        style={{
          borderRadius: '8px',
          margin: '8px',
          padding: '8px 16px',
          cursor: 'pointer',  // Change cursor on hover
          border: '2px solid #5babde',
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = '#f3d250')}  // Change background color on hover
        onMouseOut={(e) => (e.target.style.backgroundColor = '')}  // Reset background color on mouse out
      >
        Cancel
      </button>

      </div>
    </div>
  );
};

export default BlockConfigEditor;