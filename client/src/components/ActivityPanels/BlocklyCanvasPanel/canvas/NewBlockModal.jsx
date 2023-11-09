import { Button, Input, Modal, Form } from "antd";
import React, { useState } from "react";


export default function NewBlockModal({ visible, handleCancelCb, handleOkCb, setVisible }) {
  // const [visible, setVisible] = useState(false);
  const handleCancel = () => {
    setVisible(false);
  };
  const handleOk = () => {
    setVisible(false);
    console.log("Cool beans, ok was pressed");
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form was submitted");
    setVisible(false);
  }
  const width = 1000;
  return (
    <Modal
      title={"Create New Block"}
      open={visible}
      onCancel={handleCancel}
      width={width}
      footer={[
        // <Button key="ok" type="primary" onClick={handleOk}>
        //   OK
        // </Button>,
      ]}>
      <Form>
        <Form.Item label="Block Name">
          <Input />
        </Form.Item>
        <Form.Item label="Block Description">
          <Input />
        </Form.Item>
        <Form.Item label="Block Type">
          <Input />
        </Form.Item>
        {/* <Button type="submit">Submit</Button> */}
        <button type="submit" className="btn" onClick={handleSubmit}>Submit</button>
      </Form>
      </Modal>
  );
}
