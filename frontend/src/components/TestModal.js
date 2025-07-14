// components/TestModal.js
import React, { useState } from 'react';
import { Button, Modal } from 'antd';

const TestModal = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Test Open Modal</Button>
      <Modal
        title="Test Modal"
        open={open}
        onOk={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      >
        <p>This is a test modal content</p>
      </Modal>
    </>
  );
};

export default TestModal;
