import React, { useState } from "react";

const BlockConfigEditor = ({ initialConfig, onSave, onCancel }) => {
  const [name, setName] = useState("");
  const [config, setConfig] = useState("");
  const [generatorStub, setGeneratorStub] = useState("");

 

  const handleSave = () => {
    // Implement validation or additional logic if needed
    onSave(name, config, generatorStub);
  };

  return (
    <div className="blockConfig">
      <textarea
       value={name}
       onChange={(e) => setName(e.target.value)}
       placeholder="Type Block Name here..."  // Placeholder text
       rows={1}
       cols={60}  // Adjust the column value to make the textarea wider
       style={{ borderRadius: '8px', padding: '8px', border: '2px solid #5babde', }}  // Rounded corners and padding
      />
      <textarea
       value={config}
       onChange={(e) => setConfig(e.target.value)}
       placeholder="Type Block Definition here..."  // Placeholder text
       rows={10}
       cols={60}  // Adjust the column value to make the textarea wider
       style={{ borderRadius: '8px', padding: '8px', border: '2px solid #5babde', }}  // Rounded corners and padding
      />
      <textarea
        value={generatorStub}
        onChange={(e) => setGeneratorStub(e.target.value)}
        placeholder="Type Generator Stub here..."  // Placeholder text
        rows={10}
        cols={60}  // Adjust the column value to make the textarea wider
        style={{ borderRadius: '8px', padding: '8px', border: '2px solid #5babde', }}  // Rounded corners and padding
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

  );
};

export default BlockConfigEditor;
