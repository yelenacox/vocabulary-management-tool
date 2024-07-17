import { useContext, useEffect, useState } from 'react';
import { myContext } from '../../../App';
import './TableStyling.scss';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Spinner } from '../../Manager/Spinner';
import { getById } from '../../Manager/FetchManager';
import { Card, Col, Form, Menu, notification, Row, Table, Tooltip } from 'antd';
import { EditTableDetails } from './EditTableDetails';
import { DeleteTable } from './DeleteTable';
import { LoadVariables } from './LoadVariables';
import { MappingContext } from '../../../MappingContext';
import { ExportFile } from './ExportFile';
import { EditMappingsTableModal } from './EditMappingsTableModal';
import { SettingsDropdownTerminology } from '../../Manager/Dropdown/SettingsDropdownTerminology';
import { ClearMappings } from '../../Manager/MappingsFunctions/ClearMappings';
import { GetMappingsModal } from '../../Manager/MappingsFunctions/GetMappingsModal';
import { AddVariable } from './AddVariable';
import { ExpandedRowTable } from './ExpandedRowTable';
import { TableMenu } from './TableMenu';

export const TableDetails = () => {
  const [form] = Form.useForm();

  const { vocabUrl, edit, setEdit, table, setTable } = useContext(myContext);
  const {
    getMappings,
    setGetMappings,
    mapping,
    setMapping,
    setEditMappings,
    editMappings,
  } = useContext(MappingContext);
  const { studyId, DDId, tableId } = useParams();
  const [loading, setLoading] = useState(true);
  const [load, setLoad] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setDataSource(tableData(table));
  }, [table, mapping]);

  // fetches the table and sets 'table' to the response
  useEffect(() => {
    setLoading(true);
    getById(vocabUrl, 'Table', tableId)
      .then(data => {
        if (data === null) {
          navigate('/404');
        } else {
          setTable(data);
          if (data) {
            getById(vocabUrl, 'Table', `${tableId}/mapping`)
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
              });
          } else {
            setLoading(false);
          }
        }
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
  }, []);

  // sets table to an empty object on dismount
  useEffect(
    () => () => {
      setTable({});
    },
    []
  );

  // columns for the ant.design table
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
    },
    { title: 'Data Type', dataIndex: 'data_type' },
    { title: 'Enumerations', dataIndex: 'enumeration' },
    { title: 'Mapped Terms', dataIndex: 'mapped_terms' },
    {
      title: '',
      dataIndex: 'delete_column',
      render: (_, tableData) => {
        return (
          <>
            {tableData.key !== 'newRow' && (
              // If the tableData key is not "newRow" (i.e. it is not a newly added input field to add a new row)
              // The actions/mappings menu is displayed
              <>
                {/* <div className="edit_delete_buttons"> */}
                <TableMenu
                  table={table}
                  setTable={setTable}
                  tableData={tableData}
                  form={form}
                  loading={loading}
                  setLoading={setLoading}
                  setEditMappings={setEditMappings}
                  setGetMappings={setGetMappings}
                  mapping={mapping}
                />
              </>
            )}
          </>
        );
      },
    },
  ];

  /* The table may have numerous variables. The API call to fetch the mappings returns all mappings for the table.
The variables in the mappings need to be matched up to each variable in the table.
The function maps through the mapping array. For each variable, if the mapping variable is equal to the 
variable in the table, AND the mappings array length for the variable is > 0, the mappings array is mapped through
and returns the length of the mapping array (i.e. returns the number of variables mapped to the table variable). 
There is then a tooltip that displays the variables on hover.*/
  const matchCode = variable =>
    mapping?.length > 0 &&
    mapping?.map(
      (item, index) =>
        item.code === variable.code &&
        item?.mappings?.length > 0 && (
          <Tooltip
            title={item.mappings.map(code => {
              return <div key={index}>{code.code}</div>;
            })}
            key={index}
          >
            {item?.mappings?.length}
          </Tooltip>
        )
    );

  // data for the table columns. Each table has an array of variables. Each variable has a name, description, and data type.
  // The integer and quantity data types include additional details.
  // The enumeration data type includes a reference to a terminology, which includes further codes with the capability to match the
  // terms to ontology codes. If the data type is enumeration, there is a 'view/edit' link that takes the user to specified terminology.
  const tableData = table =>
    table?.variables?.map((variable, index) => {
      return {
        key: index,
        variable,
        code: variable.code,
        name: variable.name,
        description: variable.description,
        data_type: variable.data_type,
        min: variable.min,
        max: variable.max,
        units: variable.units,
        enumeration: variable.data_type === 'ENUMERATION' && (
          <Link to={`/${variable.enumerations.reference}`}>View/Edit</Link>
        ),
        mapped_terms: matchCode(variable),
      };
    });

  const [dataSource, setDataSource] = useState(tableData);

  // In progress. Not yet used.
  // Expandable rows for integer and quantity data types to display their additional data.
  // The additional elements include min, max, and units properties.
  const expandedRowRender = record => {
    return <ExpandedRowTable record={record} />;
  };

  return (
    <>
      {loading ? (
        // If page is loading, display loading spinner. Otherwise display code below

        <Spinner />
      ) : (
        <div className="table_id_container">
          <Row gutter={30}>
            <div className="study_details_container">
              <Col span={15}>
                <div className="study_details">
                  <div className="study_name">
                    {/* Displays table name if there is one. If no name, displays DD id */}

                    <h2>{table?.name ? table?.name : table?.id}</h2>
                  </div>
                  <div className="study_desc">
                    {/* Displays the DD description if there is one.
                    If there is no description, 'No description provided' is displayed in a gray font */}
                    {table?.description ? (
                      table?.description
                    ) : (
                      <span className="no_description">
                        No description provided.
                      </span>
                    )}
                  </div>
                </div>
              </Col>
              <Col span={6}>
                <div className="study_details_right">
                  <div className="study_dropdown">
                    {/* ant.design dropdown for edit. */}
                    <SettingsDropdownTerminology />
                  </div>
                </div>
              </Col>
            </div>
          </Row>
          {table?.filename ? (
            <>
              <div className="terminology_details terminology_desc">
                File name: {table?.filename}
              </div>
            </>
          ) : (
            ''
          )}
          <div className="terminology_details">{table?.url}</div>
          <div className="terminology_details terminology_desc"></div>
          <div className="table_container">
            <AddVariable
              table={table}
              setTable={setTable}
              dataSource={dataSource}
              setDataSource={setDataSource}
              form={form}
            />
            {/* ant.design table displaying the pre-defined columns and data, with expandable rows. 
            The expandable rows currently show the min, max, and units properties with no styling. */}
            {table?.variables?.length > 0 ? (
              <>
                <Form form={form}>
                  <Table
                    columns={columns}
                    dataSource={dataSource}
                    expandable={{
                      expandRowByClick: 'true',
                      expandedRowRender,
                      rowExpandable: record =>
                        record.data_type === 'INTEGER' ||
                        record.data_type === 'QUANTITY',
                    }}
                  />
                </Form>

                <ExportFile table={table} />
              </>
            ) : (
              <Row gutter={[20, 24]}>
                <Col span={6}>
                  {/* The first column is a card that opens a modal to add a new study. It sets 'addTable' to true on click
                and triggers the modal to open*/}
                  <span onClick={() => setLoad(true)}>
                    <Card
                      hoverable
                      bordered={true}
                      style={{
                        border: '1px solid darkgray',
                        height: '42vh',
                      }}
                    >
                      <div className="new_study_card_container">
                        <div className="new_study_card">
                          Upload Variables (CSV)
                        </div>
                      </div>
                    </Card>
                  </span>
                </Col>
              </Row>
            )}
          </div>
        </div>
      )}

      {/* Displays the edit form */}
      <EditTableDetails
        table={table}
        setTable={setTable}
        edit={edit}
        setEdit={setEdit}
      />
      <DeleteTable studyId={studyId} DDId={DDId} />
      <LoadVariables load={load} setLoad={setLoad} />
      <EditMappingsTableModal
        editMappings={editMappings}
        setEditMappings={setEditMappings}
        tableId={tableId}
        setMapping={setMapping}
      />
      <GetMappingsModal
        component={table}
        componentString={'Table'}
        setTable={setTable}
        searchProp={getMappings?.name}
        setGetMappings={setGetMappings}
        setMapping={setMapping}
        tableId={tableId}
        mappingProp={getMappings?.code}
      />
      <ClearMappings propId={tableId} component={'Table'} />
    </>
  );
};
