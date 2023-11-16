import React, { useState } from "react";

const BlockConfigEditor = ({ initialConfig, onSave, onCancel }) => {
  const [config, setConfig] = useState("");

 

  const handleSave = () => {
    // Implement validation or additional logic if needed
    onSave(config);
  };

  return (
    <div>
      <textarea
       value={config}
       onChange={(e) => setConfig(e.target.value)}
       placeholder="Type your configuration here..."  // Placeholder text
       rows={10}
       cols={150}  // Adjust the column value to make the textarea wider
       style={{ borderRadius: '8px', padding: '8px', border: '2px solid #5babde', }}  // Rounded corners and padding
      />
      <button
        onClick={handleSave}
        style={{
          borderRadius: '8px',
          margin: '8px',
          padding: '8px 16px',
          cursor: 'pointer',  // Change cursor on hover
          transition: 'background-color 0.3s ease',  // Smooth transition for the background color
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
  );
};

export default BlockConfigEditor;