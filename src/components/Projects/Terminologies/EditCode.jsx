import { Button, message, notification, Tooltip } from 'antd';
import {
  EditOutlined,
  CloseOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';
import { useContext, useEffect } from 'react';
import { myContext } from '../../../App';
import { DeleteCode } from './DeleteCode';
import { Spinner } from '../../Manager/Spinner';
import { getById, handlePatch } from '../../Manager/FetchManager';
import { useParams } from 'react-router-dom';
import { MappingContext } from '../../../MappingContext';

export const EditCode = ({
  editRow,
  setEditRow,
  tableData,
  terminology,
  setTerminology,
  dataSource,
  setDataSource,
  form,
  loading,
  setLoading,
}) => {
  const { vocabUrl } = useContext(myContext);
  const { setMapping } = useContext(MappingContext);
  const { terminologyId } = useParams();

  /* Submit function to edit a row. The input field is validated to ensure it is not empty.
     The index of the row being edited is found by the key of the row in the dataSource. 
     The element at that index is set to the index variable. If the index exists, item is set to 
     the element at that index. The data at the index of the row is replaced with the newData. 
      */

  useEffect(() => {
    if (editRow !== null && dataSource[editRow]) {
      const { code, display } = dataSource[editRow];
      form.setFieldsValue({ code, display });
    }
  }, [editRow]);

  const onFinish = async key => {
    const row = await form.validateFields();
    const index = dataSource.findIndex(item => key === item.key);
    const newData = [...dataSource];
    if (index > -1) {
      const item = newData[index];
      newData.splice(index, 1, {
        ...item,
        ...row,
      });
    }
    // Object to put in the body of the PATCH request. Provides the old code
    // and replaces with the updated code and/or display on the back end.
    // The code in the associdated mappings is automatically udpated on the back end.
    const updatedRowDTO = {
      code: {
        [`${dataSource[index].code}`]: `${row.code}`,
      },
      display: {
        [dataSource[index].code]: row.display,
      },
    };

    // If the new code already exists in the terminolgoy and does not match the index being edited,
    // an error message displays that the code already exists. Otherwise the PUT call is run.
    if (
      terminology.codes.some(
        item =>
          item.code.toLowerCase() === row.code.toLowerCase() &&
          dataSource[index].code.toLowerCase() !== row.code.toLowerCase()
      )
    ) {
      message.error(
        `"${row.code}" already exists in the Terminology. Please choose a different name.`
      );
    } else {
      setLoading(true);
      handlePatch(vocabUrl, 'Terminology', terminology, updatedRowDTO)
        .then(data => {
          setTerminology(data);
          setDataSource(newData);
          setEditRow('');
          message.success('Changes saved successfully.');
        })
        .catch(error => {
          if (error) {
            notification.error({
              message: 'Error',
              description:
                'An error occurred updating the row. Please try again.',
            });
          }
          return error;
        })
        .then(() =>
          getById(vocabUrl, 'Terminology', `${terminologyId}/mapping`)
            .then(data => setMapping(data.codes))
            .catch(error => {
              if (error) {
                notification.error({
                  message: 'Error',
                  description:
                    'An error occurred loading mappings. Please try again.',
                });
              }
              return error;
            })
        )
        .finally(() => setLoading(false));
    }
  };

  return (
    <>
      {!loading ? (
        editRow !== tableData.key ? (
          /* if the row is not being edited, the edit and delete icons are displayed*/
          <>
            <Tooltip title="Edit">
              {' '}
              <Button
                shape="circle"
                size="small"
                icon={<EditOutlined />}
                className="actions_icon"
                onClick={() => {
                  /* editRow is set to the key of the of the row.*/
                  setEditRow(tableData.key);
                }}
              />
            </Tooltip>
            <Tooltip title="Delete">
              <DeleteCode
                tableData={tableData}
                terminology={terminology}
                setTerminology={setTerminology}
              />{' '}
            </Tooltip>
          </>
        ) : (
          //if the row is being edited, the cancel and save icons are displayed
          <>
            {' '}
            <Tooltip title="Cancel">
              <Button
                size="small"
                shape="circle"
                icon={<CloseOutlined />}
                className="actions_icon"
                onClick={() => {
                  /* editRow is set to the key of the of the row.*/
                  setEditRow('');
                }}
              />
            </Tooltip>
            <Tooltip title="Save">
              <Button
                size="small"
                shape="circle"
                icon={<CloudUploadOutlined />}
                className="actions_icon"
                onClick={() => onFinish(tableData.key)}
              />
            </Tooltip>
          </>
        )
      ) : (
        <Spinner />
      )}
    </>
  );
};
