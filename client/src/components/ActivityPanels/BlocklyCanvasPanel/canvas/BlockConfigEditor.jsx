import React, { useState } from "react";

const BlockConfigEditor = ({ initialConfig, onSave, onCancel }) => {
  // const [name, setName] = useState("");
  const [config, setConfig] = useState("");
  const [generatorStub, setGeneratorStub] = useState("");

  const handleSave = (e) => {
    e.preventDefault();

    // let parsedConfig = JSON.parse(config);
    let parsedConfig = config.replace(/'/g, '"');
    parsedConfig = JSON.parse(parsedConfig);
    console.log("parsed config", parsedConfig);

    // Implement validation or additional logic if needed
    onSave(parsedConfig, generatorStub);
  };

  return (
    <div>
      <div
        style={{
          backgroundColor: "#F4F4F5",
          padding: "15px",
          borderRadius: "20px",
          width: "450px",
          marginRight: "10px",
        }}>
        <div
          style={{
            height: "50px",
            marginBottom: "10px",
            textAlign: "center",
            background: "#5babde",
            padding: "5px",
            borderRadius: "20px",
            width: "350px",
            marginLeft: "30px",
          }}>
          <h2 style={{ marginTop: "5px", color: "white", fontSize: "1.2em", fontWeight: "bold" }}>
            Configure New Block
          </h2>
        </div>
        <form onSubmit={handleSave}>
          <textarea
            value={config}
            // onChange={(e) => setConfig(e.target.value)}
            placeholder="Type Block Definition here..." // Placeholder text
            rows={10}
            cols={60} // Adjust the column value to make the textarea wider
            style={{
              borderRadius: "20px",
              padding: "8px",
              border: "2px solid #5babde",
              width: "100%",
            }}
          />
          <textarea
            value={generatorStub}
            // onChange={(e) => setGeneratorStub(e.target.value)}
            placeholder="Type Generator Stub here..." // Placeholder text
            rows={10}
            cols={60} // Adjust the column value to make the textarea wider
            style={{
              borderRadius: "20px",
              padding: "8px",
              border: "2px solid #5babde",
              width: "100%",
            }}
          />
          <div className="configure-block-form-actions">
            <button
              style={{
                borderRadius: "8px",
                margin: "8px",
                padding: "8px 16px",
                cursor: "pointer", // Change cursor on hover
                border: "2px solid #5babde",
              }}
              className="btn configure-block-btn"
              onMouseOver={(e) => (e.target.style.backgroundColor = "#f3d250")} // Change background color on hover
              onMouseOut={(e) => (e.target.style.backgroundColor = "")} // Reset background color on mouse out
            >
              Save
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="btn configure-block-btn"
              style={{
                borderRadius: "8px",
                margin: "8px",
                padding: "8px 16px",
                cursor: "pointer", // Change cursor on hover
                border: "2px solid #5babde",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#f3d250")} // Change background color on hover
              onMouseOut={(e) => (e.target.style.backgroundColor = "")} // Reset background color on mouse out
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlockConfigEditor;
