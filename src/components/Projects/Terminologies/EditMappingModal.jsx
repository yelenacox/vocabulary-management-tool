import { Checkbox, Modal, Form, Button, notification, message } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { myContext } from '../../../App';
import { ModalSpinner } from '../../Manager/Spinner';
import { MappingSearch } from './MappingSearch';
import { ResetMappings } from './ResetMappings';
import { MappingContext } from '../../../MappingContext';

export const EditMappingsModal = ({
  editMappings,
  setEditMappings,
  terminologyId,
  setMapping,
}) => {
  const [form] = Form.useForm();
  const [termMappings, setTermMappings] = useState([]);
  const [options, setOptions] = useState([]);
  const { vocabUrl, terminology } = useContext(myContext);
  const [loading, setLoading] = useState(false);
  const [reset, setReset] = useState(false);
  const [mappingsForSearch, setMappingsForSearch] = useState([]);
  const [editSearch, setEditSearch] = useState(false);

  const { existingMappings, filteredMappings } = useContext(MappingContext);

  useEffect(() => {
    fetchMappings();
  }, [editMappings]);

  const clearData = () => {
    setTermMappings([]);
    setOptions([]);
  };

  const fetchMappings = () => {
    /* The terminology code was passed through the editMappings prop.
    If there is a code, the mappings for the code in the terminology are fetched.
    */
    if (editMappings) {
      setLoading(true);
      return fetch(
        `${vocabUrl}/Terminology/${terminologyId}/mapping/${editMappings.code}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
        .then(res => {
          if (res.ok) {
            return res.json();
          }
        })
        .then(data => {
          setMappingsForSearch(data.mappings); // will be passed to MappingSearch.jsx to check existing mappings by default
          // If the mappings array length for the code is < 1, undefined is returned
          if (data.mappings.length < 1) {
            return undefined;
          }
          // array of mapped codes used to check default values in checkboxes
          const mappings = [];
          // array of mapped codes used to display the the checkboxes and build data structure of object
          const options = [];

          data.mappings.forEach((m, index) => {
            {
              /* For each mapping in the mappings array, JSON stringify the object below of code, display, and system. 
          The API does not yet support the description field, so it is commented out for easy future integration
          */
            }
            const val = JSON.stringify({
              code: m.code,
              display: m.display,
              // description: m.description[0],
              system: m?.system,
            });

            mappings.push(val); // For each mapping in the mappings array, push the stringified object above to the mappings array.
            // For each mapping in the mappings array, push the stringified object above to the options array
            // as the value for the value field for the ant.design checkbox. The label for the checkbox is returned in edditMappingsLabel function.
            options.push({ value: val, label: editMappingsLabel(m, index) });
          });
          // termMappings are set to the mappings array. Options are set to the options array.
          setTermMappings(mappings);
          setOptions(options);
        })
        .catch(error => {
          if (error) {
            notification.error({
              message: 'Error',
              description: 'An error occurred. Please try again.',
            });
          }
          return error;
        })
        .finally(() => setLoading(false));
    }
  };

  // The label for the checkbox for each mapping. Displays JSX to show the display and code.
  // The description field is commented out to be integrated when there is API support.
  const editMappingsLabel = (item, index) => {
    return (
      <>
        <div key={index} className="modal_search_result">
          <div>
            <div className="modal_term_ontology">
              <div>
                <b>{item?.display}</b>
              </div>
              <div>
                {/* <a href={item.iri} target="_blank"> */}
                {item?.code}
                {/* </a> */}
              </div>
            </div>
            {/* <div>{ellipsisString(item?.description[0], '100')}</div> */}
          </div>
        </div>
      </>
    );
  };

  // Function to send a PUT call to update the mappings.
  // Each mapping in the mappings array being edited is JSON.parsed and pushed to the blank mappings array.
  // The mappings are turned into objects in the mappings array.
  const updateMappings = values => {
    const mappingsDTO = () => {
      let mappings = [];
      values?.mappings?.forEach(v => mappings.push(JSON.parse(v)));
      return { mappings: mappings };
    };
    fetch(
      `${vocabUrl}/Terminology/${terminologyId}/mapping/${editMappings.code}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mappingsDTO()),
      }
    )
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('An unknown error occurred.');
        }
      })
      .then(data => {
        setMapping(data.codes);
        message.success('Mappings updated successfully.');
      })
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description: 'An error occurred. Please try again.',
          });
        }
        return error;
      })
      .finally(() => setLoading(false));
  };

  const editExistingMappings = values => {
    const mappingsDTO = () => {
      const parsedFilteredMappings = [];
      filteredMappings?.forEach(v =>
        parsedFilteredMappings.push(JSON.parse(v))
      );
      const combinedMappings = [...existingMappings, ...parsedFilteredMappings];
      return { mappings: combinedMappings };
    };

    console.log(mappingsDTO());

    fetch(
      `${vocabUrl}/Terminology/${terminologyId}/mapping/${editMappings.code}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mappingsDTO()),
      }
    )
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('An unknown error occurred.');
        }
      })
      .then(data => {
        setMapping(data.codes);
        message.success('Mappings updated successfully.');
      })
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description: 'An error occurred. Please try again.',
          });
        }
        return error;
      })
      .finally(() => setLoading(false));
  };
  return (
    <Modal
      // since the code is passed through editMappings, the '!!' forces it to be evaluated as a boolean.
      // if there is a code being passed, it evaluates to true and opens the modal.
      open={!!editMappings}
      width={'51%'}
      styles={{ body: { height: '60vh', overflowY: 'auto' } }}
      okText="Save"
      onOk={() => {
        form
          .validateFields()
          .then(values => {
            {
              /* Performs the updateMappings PUT call on 'Save' button click */
            }
            editSearch ? editExistingMappings(values) : updateMappings(values);
            clearData();
            form.resetFields();
            setEditMappings(null);
            setReset(false);
            setEditSearch(false);
          })
          .then(data => setMapping(data));
      }}
      onCancel={() => {
        clearData();
        form.resetFields();
        setEditMappings(null);
        setReset(false);
        setEditSearch(false);
      }}
      closeIcon={false}
      maskClosable={false}
      destroyOnClose={true}
      footer={(_, { OkBtn, CancelBtn }) => (
        <>
          <div className={!reset ? 'footer_buttons' : 'save_button_only'}>
            {/* If reset and editSearch are false, the reset and edit buttons are displayed
            The reset button opens a modal to confirm mapping deletion, then the search is performed again
            in the MappingSearch modal below. The edit/add button sets editSearch to true and opens 
            the modal to perform the search in MappingSearch below. */}
            <div className="reset_edit_buttons">
              {!reset && !editSearch && (
                <>
                  <ResetMappings
                    terminologyId={terminologyId}
                    editMappings={editMappings}
                    setReset={setReset}
                  />
                  <Button onClick={() => setEditSearch(true)}>
                    Edit / Add
                  </Button>
                </>
              )}
            </div>
            <div className="cancel_ok_buttons">
              {!reset && <CancelBtn />}
              <OkBtn />
            </div>
          </div>
        </>
      )}
    >
      {loading ? (
        <ModalSpinner />
      ) : !reset && !editSearch ? (
        <>
          {/* If reset is false, the mappings for the code are displayed with checkboxes */}
          <div className="modal_search_results_header">
            <h3>Mappings for: {editMappings?.code}</h3>
          </div>
          <Form form={form} layout="vertical" preserve={false}>
            <Form.Item
              name={['mappings']}
              valuePropName="value"
              // Each checkbox is checked by default. The user can uncheck a checkbox to remove a mapping by clicking the save button.
              initialValue={termMappings}
            >
              <Checkbox.Group className="mappings_checkbox" options={options} />
            </Form.Item>
          </Form>
        </>
      ) : (
        // If reset or editSearch is true the MappingSearch modal opens to perform the search for the terminology code
        (editSearch || reset) && (
          <MappingSearch
            terminologyId={terminologyId}
            editMappings={editMappings}
            setEditMappings={setEditMappings}
            setMapping={setMapping}
            mappingsForSearch={mappingsForSearch}
            options={options}
            form={form}
            reset={reset}
            onClose={form.resetFields}
          />
        )
      )}
    </Modal>
  );
};
