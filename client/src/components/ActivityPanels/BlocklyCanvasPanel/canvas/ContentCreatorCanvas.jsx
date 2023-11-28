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
  const [blockConfig, setBlockConfig] = useState({});
  const [myCustomBlocks, setMyCustomBlocks] = useState(['brandon_sample_custom', 'custom_block_2', 'custom_block_3']);
  const [customBlockIndex, setCustomBlockIndex] = useState(0);

  const navigate = useNavigate();
  const [forceUpdate] = useReducer((x) => x + 1, 0);
  const workspaceRef = useRef(null);
  const activityRef = useRef(null);

  const setWorkspace = () => {
    workspaceRef.current = window.Blockly.inject("blockly-canvas", {
      toolbox: document.getElementById("toolbox"),
    });
    handleSaveBlockConfig(null, null, null);
    Blockly.Blocks['brandon_sample_custom'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("This is a sample custom block")
            .appendField(new Blockly.FieldCheckbox("TRUE"), "NAME")
            .appendField(new Blockly.FieldColour("#ff0000"), "NAME");
        this.appendValueInput("text_input")
            .setCheck("String")
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("text_input");
        this.appendValueInput("number_input")
            .setCheck("Number")
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("number_input");
        this.appendValueInput("boolean_input")
            .setCheck("Boolean")
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("boolean_input");
        this.setOutput(true, null);
        this.setColour(45);
        this.setTooltip("A sample custom block");
        this.setHelpUrl("");
      }
    };

    Blockly.Arduino['brandon_sample_custom'] = function(block) {
      var checkbox_name = block.getFieldValue('NAME') == 'TRUE';
      var colour_name = block.getFieldValue('NAME');
      var value_text_input = Blockly.Arduino.valueToCode(block, 'text_input', Blockly.Arduino.ORDER_ATOMIC);
      var value_number_input = Blockly.Arduino.valueToCode(block, 'number_input', Blockly.Arduino.ORDER_ATOMIC);
      var value_boolean_input = Blockly.Arduino.valueToCode(block, 'boolean_input', Blockly.Arduino.ORDER_ATOMIC);
      // TODO: Assemble Arduino into code variable.
      var code = '...';
      // TODO: Change ORDER_NONE to the correct strength.
      return [code, Blockly.Arduino.ORDER_NONE];
    };
  };

  Blockly.Blocks['custom_block_2'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Another custom block");
      this.appendValueInput("text_input")
          .setCheck("Number")
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField("angle:")
          .appendField(new Blockly.FieldAngle(90), "NAME");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(300);
      this.setTooltip("Another custom block");
      this.setHelpUrl("");
    }
  };

  Blockly.Arduino['custom_block_2'] = function(block) {
    var angle_name = block.getFieldValue('NAME');
    var value_text_input = Blockly.Arduino.valueToCode(block, 'text_input', Blockly.Arduino.ORDER_ATOMIC);
    // TODO: Assemble Arduino into code variable.
    var code = '...;\n';
    return code;
  };

  Blockly.Blocks['custom_block_3'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Custom Block 3");
      this.appendValueInput("NAME")
          .setCheck(null)
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField(new Blockly.FieldNumber(0), "NAME");
      this.setInputsInline(false);
      this.setColour(0);
      this.setTooltip("Another custom block");
      this.setHelpUrl("");
    }
  };

  Blockly.Arduino['custom_block_3'] = function(block) {
    var number_name = block.getFieldValue('NAME');
    var value_name = Blockly.Arduino.valueToCode(block, 'NAME', Blockly.Arduino.ORDER_ATOMIC);
    // TODO: Assemble Arduino into code variable.
    var code = '...;\n';
    return code;
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
  }, [activity, isSandbox, customBlockIndex]);

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
  
  const handleNewBlock = () => {
    console.log("new block");
    setShowNewBlockModal(true);
  }

  // Function to handle opening the BlockConfigEditor
  const handleOpenBlockConfigEditor = () => {
    setShowBlockConfigEditor(true);
  };

  // Function to handle saving block configuration from BlockConfigEditor
  const handleSaveBlockConfig = (name, config, generatorStub) => {
    console.log("Saved block name: ", name, " config: ", config, " generator stub: ", generatorStub);
    setBlockConfig(config);
    setShowBlockConfigEditor(false);
    setShowCustomBar(true);
    // setCustomBlockIndex(customBlockIndex + 1);
    setCustomBlockIndex((prevState) => {return prevState + 1})
    console.log(customBlockIndex);
    window.Blockly.updateToolbox(toolbox);
  };

  // Function to handle canceling block configuration in BlockConfigEditor
  const handleCancelBlockConfig = () => {
    setShowBlockConfigEditor(false);
  };

  return (
    <div id="horizontal-container" className="flex flex-column">
      <div className="flex flex-row" style={{ height: '700px'}} > 
        <div id="bottom-container" className="flex flex-column vertical-container overflow-visible"style={{ height: '800px'}}>
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
            <button clasName="btn new-block__btn" onClick={handleOpenBlockConfigEditor}>Configure Block</button>
          </Spin>
        </div>
        {!isMentorActivity && (
          <div className="flex flex-column">
            {!showBlockConfigEditor && (<StudentToolboxMenu
              activity={activity}
              studentToolbox={studentToolbox}
              setStudentToolbox={setStudentToolbox}
              openedToolBoxCategories={openedToolBoxCategories}
              setOpenedToolBoxCategories={setOpenedToolBoxCategories}
            
            />
            )}
            {/*<button className="btn new-block__btn" onClick={handleNewBlock}>Create New Block</button>
            <NewBlockModal visible={showNewBlockModal} setVisible={setShowNewBlockModal} />*/}

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
      <xml id="toolbox" is="Blockly workspace">
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
        {console.log("status at time of render", showCustomBar)}
        {showCustomBar && (
            <category name='some sample custom blocks'>
              {myCustomBlocks.slice(0, customBlockIndex).map((blockType, index) => (
                  <block key={index} type={blockType} />
              ))}
            </category>
        )}
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
