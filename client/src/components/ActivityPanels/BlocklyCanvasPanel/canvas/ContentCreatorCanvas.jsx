import React, { useEffect, useRef, useState, useReducer } from "react";
import "../../ActivityLevels.less";
import {
  compileArduinoCode,
  handleCreatorSaveActivity,
  handleCreatorSaveActivityLevel,
  handleUpdateWorkspace,
} from "../../Utils/helpers";
import { message, Spin, Row, Col, Alert, Dropdown, Menu, Button } from "antd";
import CodeModal from "../modals/CodeModal";
import SaveAsModal from "../modals/SaveAsModal";
import ConsoleModal from "../modals/ConsoleModal";
import PlotterModal from "../modals/PlotterModal";
import StudentToolboxMenu from "../modals/StudentToolboxMenu";
import LoadWorkspaceModal from "../modals/LoadWorkspaceModal";
import DisplayDiagramModal from "../modals/DisplayDiagramModal";
import {
  connectToPort,
  handleCloseConnection,
  handleOpenConnection,
} from "../../Utils/consoleHelpers";
import { getAuthorizedWorkspace, getAuthorizedWorkspaceToolbox } from "../../../../Utils/requests";
import ArduinoLogo from "../Icons/ArduinoLogo";
import PlotterLogo from "../Icons/PlotterLogo";
import { useNavigate } from "react-router-dom";
import NewBlockModal from "./NewBlockModal";
import BlockConfigEditor from "./BlockConfigEditor";
import { getCustomBlock } from "../../../../Utils/Customblocksgetter";

let plotId = 1;

export default function ContentCreatorCanvas({
  activity,
  isSandbox,
  setActivity,
  isMentorActivity,
}) {
  const [hoverUndo, setHoverUndo] = useState(false);
  const [hoverRedo, setHoverRedo] = useState(false);
  const [hoverCompile, setHoverCompile] = useState(false);
  const [hoverConsole, setHoverConsole] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [showPlotter, setShowPlotter] = useState(false);
  const [showSaveAsModal, setShowSaveAsModal] = useState(false);
  const [plotData, setPlotData] = useState([]);
  const [connectionOpen, setConnectionOpen] = useState(false);
  const [selectedCompile, setSelectedCompile] = useState(false);
  const [compileError, setCompileError] = useState("");
  const [studentToolbox, setStudentToolbox] = useState([]);
  const [openedToolBoxCategories, setOpenedToolBoxCategories] = useState([]);
  const [showNewBlockModal, setShowNewBlockModal] = useState(false);
  const [showBlockConfigEditor, setShowBlockConfigEditor] = useState(false);
  const [showCustomBar, setShowCustomBar] = useState(false);
  const [customBlocks, setCustomBlocks] = useState([]);
  const [blockConfig, setBlockConfig] = useState({});

  const navigate = useNavigate();
  const [forceUpdate] = useReducer((x) => x + 1, 0);
  const workspaceRef = useRef(null);
  const activityRef = useRef(null);

  const rerenderWorkspace = () => {
    workspaceRef.current.clear();
    let xml = window.Blockly.Xml.textToDom(activityRef.current.template);
    window.Blockly.Xml.domToWorkspace(xml, workspaceRef.current);
    workspaceRef.current.clearUndo();
  };

  const setWorkspace = () => {
    workspaceRef.current = window.Blockly.inject("blockly-canvas", {
      toolbox: document.getElementById("toolbox"),
    });

    workspaceRef.current.addChangeListener((event) => {
      if (event.type === "create") {
        workspaceRef.current.updateToolbox(document.getElementById("toolbox"));
      }
    });
    
    // workspaceRef.current.registerToolboxCategoryCallback("CUSTOM_BLOCKS", () => {
    //   return customBlocks.map((block) => {
    //     return {
    //       kind: "BLOCK",
    //       blockxml: `<block type="${block.name}"></block>`,
    //     };
    //   });
    // });
    
    // setCustomBlocks(getCustomBlocks());

    const storedCustomBlocks = getCustomBlock().then(res => {
      console.log("stored blocks: ", res)
    })

    
    const savedCustomBlocks = getCustomBlocks();
    console.log("savedCustomBlocks", savedCustomBlocks);
    setCustomBlocks(savedCustomBlocks);
  };

  const loadSave = async (workspaceId) => {
    // get the corresponding workspace
    const res = await getAuthorizedWorkspace(workspaceId);
    if (res.data) {
      // set up the canvas
      if (workspaceRef.current) workspaceRef.current.clear();
      let xml = window.Blockly.Xml.textToDom(res.data.template);
      window.Blockly.Xml.domToWorkspace(xml, workspaceRef.current);

      // if we are not in sandbox mode, only the canvas will be changed.
      // set the toolbox here
      if (!isSandbox) {
        const toolboxRes = await getAuthorizedWorkspaceToolbox(workspaceId);
        if (toolboxRes.data) {
          let tempCategories = [],
            tempToolBox = [];
          toolboxRes.data.toolbox &&
            toolboxRes.data.toolbox.forEach(([category, blocks]) => {
              tempCategories.push(category);
              tempToolBox = [...tempToolBox, ...blocks.map((block) => block.name)];
            });

          setOpenedToolBoxCategories(tempCategories);
          setStudentToolbox(tempToolBox);
        }
      }

      // else if we are in sandbox, we will change the current workspace to the loaded worksapce
      else {
        // set up the student toolbox
        const toolboxRes = await getAuthorizedWorkspaceToolbox(res.data.id);
        if (toolboxRes.data) {
          //update localstorage
          let localActivity = {
            ...res.data,
            selectedToolbox: toolboxRes.data.toolbox,
            toolbox: activity.toolbox,
          };
          setActivity(localActivity);
        }
      }
      return true;
    } else {
      message.error(res.err);
      return false;
    }
  };

  const handleGoBack = () => {
    if (window.confirm("All unsaved progress will be lost. Do you still want to go back?"))
      navigate(-1);
  };

  useEffect(() => {
    // once the activity state is set, set the workspace and save

    const setUp = async () => {
      activityRef.current = activity;
      if (!workspaceRef.current && activity && Object.keys(activity).length !== 0) {
        setWorkspace();

        let xml = isMentorActivity
          ? window.Blockly.Xml.textToDom(activity.activity_template)
          : window.Blockly.Xml.textToDom(activity.template);
        window.Blockly.Xml.domToWorkspace(xml, workspaceRef.current);
        workspaceRef.current.clearUndo();
      }
    };
    setUp();
  }, [activity, isSandbox, customBlocks]);

  const handleCreatorSave = async () => {
    // Save activity template
    if (!isSandbox && !isMentorActivity) {
      const res = await handleCreatorSaveActivityLevel(activity.id, workspaceRef, studentToolbox);
      if (res.err) {
        message.error(res.err);
      } else {
        message.success("Activity Template saved successfully");
      }
    } else if (!isSandbox && isMentorActivity) {
      // Save activity template
      const res = await handleCreatorSaveActivity(activity.id, workspaceRef);
      if (res.err) {
        message.error(res.err);
      } else {
        message.success("Activity template saved successfully");
      }
    } else {
      // if we already have the workspace in the db, just update it.
      if (activity && activity.id) {
        const updateRes = await handleUpdateWorkspace(activity.id, workspaceRef, studentToolbox);
        if (updateRes.err) {
          message.error(updateRes.err);
        } else {
          message.success("Workspace saved successfully");
        }
      }
      // else create a new workspace and update local storage
      else {
        setShowSaveAsModal(true);
      }
    }
  };

  const handleUndo = () => {
    if (workspaceRef.current.undoStack_.length > 0) workspaceRef.current.undo(false);
  };

  const handleRedo = () => {
    if (workspaceRef.current.redoStack_.length > 0) workspaceRef.current.undo(true);
  };

  const handleConsole = async () => {
    if (showPlotter) {
      message.warning("Close serial plotter before openning serial monitor");
      return;
    }
    // if serial monitor is not shown
    if (!showConsole) {
      // connect to port
      await handleOpenConnection(9600, "newLine");
      // if fail to connect to port, return
      if (typeof window["port"] === "undefined") {
        message.error("Fail to select serial device");
        return;
      }
      setConnectionOpen(true);
      setShowConsole(true);
    }
    // if serial monitor is shown, close the connection
    else {
      if (connectionOpen) {
        await handleCloseConnection();
        setConnectionOpen(false);
      }
      setShowConsole(false);
    }
  };

  const handlePlotter = async () => {
    if (showConsole) {
      message.warning("Close serial monitor before openning serial plotter");
      return;
    }

    if (!showPlotter) {
      await handleOpenConnection(9600, "plot", plotData, setPlotData, plotId, forceUpdate);
      if (typeof window["port"] === "undefined") {
        message.error("Fail to select serial device");
        return;
      }
      setConnectionOpen(true);
      setShowPlotter(true);
    } else {
      plotId = 1;
      if (connectionOpen) {
        await handleCloseConnection();
        setConnectionOpen(false);
      }
      setShowPlotter(false);
    }
  };

  const handleCompile = async () => {
    if (showConsole || showPlotter) {
      message.warning("Close Serial Monitor and Serial Plotter before uploading your code");
    } else {
      if (typeof window["port"] === "undefined") {
        await connectToPort();
      }
      if (typeof window["port"] === "undefined") {
        message.error("Fail to select serial device");
        return;
      }
      setCompileError("");
      await compileArduinoCode(
        workspaceRef.current,
        setSelectedCompile,
        setCompileError,
        activity,
        false
      );
    }
  };

  const menu = (
    <Menu>
      <Menu.Item id="menu-save" onClick={handleCreatorSave}>
        <i className="fa fa-save" />
        &nbsp; Save
      </Menu.Item>
      <SaveAsModal
        visible={showSaveAsModal}
        setVisible={setShowSaveAsModal}
        workspaceRef={workspaceRef}
        studentToolbox={studentToolbox}
        activity={activity}
        setActivity={setActivity}
        isSandbox={isSandbox}
      />
      <LoadWorkspaceModal loadSave={loadSave} />
    </Menu>
  );

  const menuShow = (
    <Menu>
      <Menu.Item onClick={handlePlotter}>
        <PlotterLogo />
        &nbsp; Show Serial Plotter
      </Menu.Item>
      <CodeModal title={"XML"} workspaceRef={workspaceRef.current} />
      <Menu.Item>
        <CodeModal title={"Arduino Code"} workspaceRef={workspaceRef.current} />
      </Menu.Item>
    </Menu>
  );

  /**=================================================*/
  /**=========== CUSTOM BLOCK CONFIG START ===========*/
  /**=================================================*/

  // Function to handle opening the BlockConfigEditor
  const handleOpenBlockConfigEditor = () => {
    setShowBlockConfigEditor(true);
  };
  
  const getCustomBlocks = async () => {
    const customBlocks = [];
    
    // TODO: get the custom blocks from the database
    console.log('reached!');
    // const response = await getCustomBlocks();
    const newCustomBlocks = await getCustomBlock();

    console.log('Custom Blocks:', newCustomBlocks);
    
    return customBlocks;
  }

//   // Import axios and the necessary API functions
// import axios from 'axios';
// import { getCustomBlock } from '<path-to-your-api-functions>';

// // Function to get custom blocks from the server
// const getCustomBlocks = async () => {
//   try {
//     // Call the API function to get custom blocks
//     const response = await getCustomBlock();

//     // Check if the request was successful
//     if (response.status === 200) {
//       // Extract the custom blocks from the response data
//       const customBlocks = response.data;

//       // Log the custom blocks for debugging (you can remove this)
//       console.log('Custom Blocks:', customBlocks);

//       // Return the custom blocks
//       return customBlocks;
//     } else {
//       // Handle the case where the request was not successful
//       console.error('Failed to get custom blocks:', response.data);
//       return [];
//     }
//   } catch (error) {
//     // Handle any errors that occurred during the request
//     console.error('Error fetching custom blocks:', error);
//     return [];
//   }
// };

// // Use the getCustomBlocks function in your useEffect hook
// useEffect(() => {
//   const setUp = async () => {
//     activityRef.current = activity;
//     if (!workspaceRef.current && activity && Object.keys(activity).length !== 0) {
//       setWorkspace();

//       let xml = isMentorActivity
//         ? window.Blockly.Xml.textToDom(activity.activity_template)
//         : window.Blockly.Xml.textToDom(activity.template);
//       window.Blockly.Xml.domToWorkspace(xml, workspaceRef.current);
//       workspaceRef.current.clearUndo();
//     }

//     // Call getCustomBlocks to fetch custom blocks
//     const savedCustomBlocks = await getCustomBlocks();

//     // Log the fetched custom blocks for debugging (you can remove this)
//     console.log('Fetched Custom Blocks:', savedCustomBlocks);

//     // Set the custom blocks in the state
//     setCustomBlocks(savedCustomBlocks);
//   };
//   setUp();
// }, [activity, isSandbox, customBlocks]);


  const storeCustomBlock = (config, generatorStub) => {
    // const json = JSON.stringify(config);
    // const blockType = JSON.parse(json)
    const blockType = config.type;
    console.log("config", config);
    console.log("blockType", blockType);

    Blockly.Blocks[blockType] = {
      init: function () {
        this.jsonInit({ ...config, type: blockType });
        let block = this;
        this.setTooltip(() => {
          return blockType;
        });
      },
    };

    setCustomBlocks([...customBlocks, { name: blockType }]);

    const categories = activity.toolbox.map(([category, blocks]) => category);

    if (!categories.includes("Custom Blocks")) {
      setActivity({
        ...activity,
        toolbox: [...activity.toolbox, ["Custom Blocks", [...customBlocks, { name: blockType }]]],
      });
    } else {
      const newToolbox = activity.toolbox.map(([category, blocks]) => {
        if (category === "Custom Blocks") {
          return ["Custom Blocks", [...blocks, { name: blockType }]];
        } else {
          return [category, blocks];
        }
      });
      setActivity({ ...activity, toolbox: newToolbox });
    }
    
    // TODO: store the custom block in the database
  };

  // Function to handle saving block configuration from BlockConfigEditor
  const handleSaveBlockConfig = (config, generatorStub) => {
    console.log(" config: ", config, " generator stub: ", generatorStub);
    setBlockConfig(config);
    setShowBlockConfigEditor(false);
    setShowCustomBar(true);

    storeCustomBlock(config, generatorStub);

    rerenderWorkspace();
  };

  // Function to handle canceling block configuration in BlockConfigEditor
  const handleCancelBlockConfig = () => {
    setShowBlockConfigEditor(false);
  };

  //clear the working space
  const handleTrashbin = () => {
    if (workspaceRef.current.undoStack_.length >= 0) workspaceRef.current.clear(false);
  };
  const useTrashCan = () => 
  {
    console.log("im working");
    handleTrashbin(true);
  }

  /**===============================================*/
  /**=========== CUSTOM BLOCK CONFIG END ===========*/
  /**===============================================*/

  return (
    <div id="horizontal-container" className="flex flex-column">
      <div className="flex flex-row" style={{ height: "700px" }}>
        <div
          id="bottom-container"
          className="flex flex-column vertical-container overflow-visible"
          style={{ height: "800px" }}>
          <Spin
            tip="Compiling Code Please Wait... It may take up to 20 seconds to compile your code."
            className="compilePop"
            size="large"
            spinning={selectedCompile}>
            <Row id="icon-control-panel">
              <Col flex="none" id="section-header">
                {activity.lesson_module_name
                  ? `${activity.lesson_module_name} - Activity ${activity.number} - ${
                      isMentorActivity ? "Activity" : "Activity Level"
                    } Template`
                  : activity.name
                  ? `Workspace: ${activity.name}`
                  : "New Workspace!"}
              </Col>
              <Col flex="auto">
                <Row align="middle" justify="end" id="description-container">
                  <Col flex={"30px"}>
                    <button onClick={handleGoBack} id="link" className="flex flex-column">
                      <i id="icon-btn" className="fa fa-arrow-left" />
                    </button>
                  </Col>
                  <Col flex="auto" />
                  <Row>
                    <Col className="flex flex-row">
                      <Col className="flex flex-row" id="save-dropdown-container">
                        <Dropdown overlay={menu}>
                          <i id="save-icon-btn" className="fa fa-save" />
                        </Dropdown>
                        <i className="fas fa-angle-down" id="caret"></i>
                      </Col>
                    </Col>
                    <Col className="flex flex-row" id="redo-undo-container">
                      <button onClick={handleUndo} id="link" className="flex flex-column">
                        <i
                          id="icon-btn"
                          className="fa fa-undo-alt"
                          style={
                            workspaceRef.current
                              ? workspaceRef.current.undoStack_.length < 1
                                ? { color: "grey", cursor: "default" }
                                : null
                              : null
                          }
                          onMouseEnter={() => setHoverUndo(true)}
                          onMouseLeave={() => setHoverUndo(false)}
                        />
                        {hoverUndo && <div className="popup ModalCompile4">Undo</div>}
                      </button>
                      <button onClick={handleRedo} id="link" className="flex flex-column">
                        <i
                          id="icon-btn"
                          className="fa fa-redo-alt"
                          style={
                            workspaceRef.current
                              ? workspaceRef.current.redoStack_.length < 1
                                ? { color: "grey", cursor: "default" }
                                : null
                              : null
                          }
                          onMouseEnter={() => setHoverRedo(true)}
                          onMouseLeave={() => setHoverRedo(false)}
                        />
                        {hoverRedo && <div className="popup ModalCompile4">Redo</div>}
                      </button>
                    </Col>
                    <Col className="flex flex-row">
                      <div id="action-btn-container" className="flex space-around">
                        <ArduinoLogo
                          setHoverCompile={setHoverCompile}
                          handleCompile={handleCompile}
                        />
                        {hoverCompile && (
                          <div className="popup ModalCompile">Upload to Arduino</div>
                        )}
                        <DisplayDiagramModal image={activity.images} />
                        <i
                          onClick={() => handleConsole()}
                          className="fas fa-terminal hvr-info"
                          style={{ marginLeft: "6px" }}
                          onMouseEnter={() => setHoverConsole(true)}
                          onMouseLeave={() => setHoverConsole(false)}
                        />
                        {hoverConsole && (
                          <div className="popup ModalCompile">Show Serial Monitor</div>
                        )}
                        <Dropdown overlay={menuShow}>
                          <i className="fas fa-ellipsis-v"></i>
                        </Dropdown>
                      </div>
                    </Col>
                  </Row>
                </Row>
              </Col>
            </Row>
            <div id="blockly-canvas" />
            {/* <button className="btn new-block__btn" onClick={handleOpenBlockConfigEditor}>
              Configure Block
            </button> */}
          </Spin>
        </div>
        {!isMentorActivity && (
          <div className="flex flex-column">
            {!showBlockConfigEditor && (
              <StudentToolboxMenu
                activity={activity}
                studentToolbox={studentToolbox}
                setStudentToolbox={setStudentToolbox}
                openedToolBoxCategories={openedToolBoxCategories}
                setOpenedToolBoxCategories={setOpenedToolBoxCategories}
              />
            )}
            {showBlockConfigEditor && (
              <BlockConfigEditor
                initialConfig={blockConfig}
                onSave={handleSaveBlockConfig}
                onCancel={handleCancelBlockConfig}
              />
            )}
          </div>
        )}

        <ConsoleModal
          show={showConsole}
          connectionOpen={connectionOpen}
          setConnectionOpen={setConnectionOpen}></ConsoleModal>
        <PlotterModal
          show={showPlotter}
          connectionOpen={connectionOpen}
          setConnectionOpen={setConnectionOpen}
          plotData={plotData}
          setPlotData={setPlotData}
          plotId={plotId}
        />
      </div>

      {/* This xml is for the blocks' menu we will provide. Here are examples on how to include categories and subcategories */}
      <button className="trash_can" onClick={useTrashCan}>trashbin bottom</button>
      <xml id="toolbox" is="Blockly workspace">
        {console.log("activity.toolbox", activity.toolbox)}

        {
          // Maps out block categories
          activity &&
            activity.toolbox &&
            activity.toolbox.map(([category, blocks]) => (
              <category name={category} is="Blockly category" key={category}>
                {
                  // maps out blocks in category
                  // eslint-disable-next-line
                  blocks.map((block) => {
                    return <block type={block.name} is="Blockly block" key={block.name} />;
                  })
                }
              </category>
            ))
        }
        <category name='new custom blocks'>
          <block type='block_comment' is="Blockly block" key='block_comment' />;
          <block type='infinite_loop' is="Blockly block" key='infinite_loop' />;
          <block type='math_modulo' is="Blockly block" key='math_modulo' />;
        </category>
      </xml>

      {compileError && (
        <Alert
          message={compileError}
          type="error"
          closable
          onClose={(e) => setCompileError("")}></Alert>
      )}
    </div>
  );
}
