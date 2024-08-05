import { Modal, message, notification } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';

import { useContext } from 'react';
import { myContext } from '../../../App';
import { useNavigate } from 'react-router-dom';
import { handleDelete } from '../../Manager/FetchManager';

export const DeleteTable = ({ DDId, studyId }) => {
  const { confirm } = Modal;
  const { vocabUrl, deleteState, setDeleteState, table, user } =
    useContext(myContext);
  const navigate = useNavigate();

  const deleteTable = evt => {
    return handleDelete(evt, vocabUrl, 'Table', table, user)
      .then(data => {
        message.success('Table deleted successfully.');
        navigate(`/Study/${studyId}/DataDictionary/${DDId}`);
      })
      .catch(error => {
        notification.error({
          message: 'Error',
          description: 'An error occurred deleting the table.',
        });
      });
  };

  // Confirm modal. Deletes table on 'ok' click.
  const showConfirm = () => {
    confirm({
      className: 'delete_table_confirm',
      title: 'Alert',
      icon: <ExclamationCircleFilled />,
      content: (
        <>
          <div>
            This will delete the table and remove it from all Data Dictionaries.
          </div>
          <div>
            <b>Are you sure you want to delete the Table?</b>
          </div>
        </>
      ),
      onOk() {
        deleteTable();
        setDeleteState(false);
      },
      onCancel() {
        setDeleteState(false);
      },
    });
  };

  return deleteState && showConfirm();
};
