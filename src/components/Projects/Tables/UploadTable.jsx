import {
  Button,
  Form,
  Input,
  Upload,
  Modal,
  notification,
  message,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import Papa from 'papaparse';
import './TableStyling.scss';
import { handlePost, handleUpdate } from '../../Manager/FetchManager';
import { useContext, useState } from 'react';
import { myContext } from '../../../App';
import { useNavigate, useParams } from 'react-router-dom';

export const UploadTable = ({ addTable, setAddTable, setTablesDD }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const { vocabUrl, dataDictionary, setDataDictionary, setTable, table } =
    useContext(myContext);
  const { studyId, DDId } = useParams();
  const navigate = useNavigate();

  //POST call to create a new table in a data dictionary (DD)
  // POST for new table. Then the id from the new table is pushed to the
  // copy of the tables array in the DD. The value of the
  // tables array is set to the copy with the new table in the PUT call (handleUpdate function)
  const tableUpload = values => {
    const newTableArray = [...dataDictionary?.tables];
    handlePost(vocabUrl, 'LoadTable', values)
      .then(data => {
        setTable(data);
        newTableArray.push({ 'reference': `Table/${data.id}` });
        handleUpdate(vocabUrl, 'DataDictionary', dataDictionary, {
          ...dataDictionary,
          tables: newTableArray,
        })
          .then(updatedData => {
            setDataDictionary(updatedData);
            message.success('Table uploaded successfully.');

            navigate(
              `/Study/${studyId}/DataDictionary/${DDId}/Table/${data.id}`
            );
          })
          .catch(error => {
            if (error) {
              notification.error({
                message: 'Error',
                description:
                  'An error occurred updating the data dictionary. Please try again.',
              });
            }
            return error;
          });
      })
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description:
              'An error occurred uploading the table. Please try again.',
          });
        }
        return error;
      });
  };

  /* Function for upload. If a file was uploaded, it takes the values from the form, parses the uploaded file's content
  into JSON, gets the file name to display on the page later, creates a "csvContents" array 
  with the file's data, then runs the tableUpload function to create the new table.
  If there is no file selected, it skips the JSON parsing and skips straight to the POST. */
  const handleUpload = values => {
    values?.csvContents?.file
      ? Papa.parse(values.csvContents.file, {
          header: true,
          skipEmptyLines: true,
          complete: function (result) {
            values.filename = values.csvContents.file.name;
            values.csvContents = result.data;
            tableUpload(values);
          },
        })
      : tableUpload({
          ...values,
          csvContents: [],
          filename: null,
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
            extra="CSV files only in Data Dictionary format."
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
