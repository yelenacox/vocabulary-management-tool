import { Modal, message, notification } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import './MappingsFunctions.scss';

import { useContext } from 'react';
import { myContext } from '../../../App';
import { MappingContext } from '../../../Contexts/MappingContext';

export const ClearMappings = ({ propId, component }) => {
  const { confirm } = Modal;
  const { vocabUrl, clear, setClear, user } = useContext(myContext);

  const { setMapping } = useContext(MappingContext);

  // The mappings for the code in a component are deleted when the "Reset" button is clicked
  // The updated data is fetched for the mappings for the code after the current mappings have been deleted.
  // setReset is set to true to open the modal that performs the search for the code again.
  const handleDelete = evt => {
    return fetch(`${vocabUrl}/${component}/${propId}/mapping`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ editor: user.email }),
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('An unknown error occurred.');
        }
      })
      .then(data => {
        setMapping(data.codes);
        message.success('Changes saved successfully.');
      })
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description: 'An error occurred. Please try again.',
          });
        }
        return error;
      });
  };

  // Confirm modal. Deletes mappings on 'ok' click.
  const showConfirm = () => {
    confirm({
      className: 'clear-mappings',
      title: 'Alert',
      icon: <ExclamationCircleFilled />,
      content: <span>Are you sure you want to clear all mappings?</span>,
      onOk() {
        handleDelete();
        setClear(false);
      },
      onCancel() {
        setClear(false);
      },
    });
  };

  return clear && showConfirm();
};
