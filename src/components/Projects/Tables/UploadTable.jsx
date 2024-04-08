import { Button, Form, Input, Upload, Modal, notification } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import Papa from 'papaparse';
import './TableStyling.scss';
import { handlePost } from '../../Manager/FetchManager';
import { useContext, useState } from 'react';
import { myContext } from '../../../App';

export const UploadTable = ({ addTable, setAddTable, setTablesDD }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const { vocabUrl } = useContext(myContext);

  /* Function for upload. Takes the values from the form, parses the uploaded file's content
  into JSON, gets the file name to display on the page later, creates a "csvContents" array 
  with the file's data, then makes the POST call to load the new table.*/
  const handleUpload = values => {
    Papa.parse(values.csvContents.file, {
      header: true,
      skipEmptyLines: true,
      complete: function (result) {
        values.filename = values.csvContents.file.name;
        values.csvContents = result.data;
        handlePost(vocabUrl, 'LoadTable', values).catch(error => {
          if (error) {
            notification.error({
              message: 'Error',
              description: 'An error occurred uploading the table.',
            });
          }
          return error;
        });
      },
    });
  };
  return (
    <>
      {/* ant.design modal with the form to add a table */}
      {/* when the OK button is pressed, the form validates the fields to ensure required sections are completed.
        The handleSubmit function is called to POST the values to the API. 
        The modal is reset to its initial, blank state.
        addTable is set to false to close the modal */}
      <Modal
        open={addTable}
        width={'70%'}
        onOk={() =>
          form.validateFields().then(values => {
            handleUpload(values);
            form.resetFields();
            setAddTable(false);
          })
        }
        onCancel={() => {
          form.resetFields();
          setAddTable(false);
          setFileList([]);
        }}
        maskClosable={false}
      >
        <Form form={form} layout="vertical" name="form_in_modal">
          <h2>Upload Table</h2>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please input Table name.' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: false }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="url"
            label="URL"
            rules={[{ required: true, message: 'Please input Table URL.' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="csvContents"
            rules={[{ required: true, message: 'Please select file.' }]}
            extra="CSV files only"
          >
            <Upload
              maxCount={1}
              onRemove={file => {
                const index = fileList.indexOf(file);
                const newFileList = fileList.slice();
                newFileList.splice(index, 1);
                setFileList(newFileList);
              }}
              beforeUpload={file => {
                setFileList([...fileList, file]);
                return false;
              }}
              accept=".csv"
            >
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};