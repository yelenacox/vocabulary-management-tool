import { useContext, useEffect, useState } from 'react';
import { myContext } from '../../../App';
import './TableStyling.scss';
import { Link, useParams } from 'react-router-dom';
import Background from '../../../assets/Background.png';
import { Spinner } from '../../Manager/Spinner';
import { getById } from '../../Manager/FetchManager';
import { Table, Dropdown, Button, Space, Row, Col } from 'antd';
import { DownOutlined } from '@ant-design/icons';

export const TableDetails = () => {
  const { table, setTable, vocabUrl } = useContext(myContext);
  const { tableId } = useParams();
  const [loading, setLoading] = useState(true);

  // fetches the table and sets 'table' to the response
  useEffect(() => {
    setLoading(true);
    getById(vocabUrl, 'Table', tableId)
      .then(data => setTable(data))
      .then(() => setLoading(false));
  }, []);

  // sets table to an empty object on dismount
  useEffect(
    () => () => {
      setTable({});
    },
    []
  );

  // placeholder items for the dropdown
  const items = [
    {
      label: 'Edit',
      key: '0',
    },
    {
      label: 'Delete',
      key: '2',
      danger: true,
    },
  ];

  const handleMenuClick = e => {
    // message.info('Click on menu item.');
    console.log('click', e);
  };
  const menuProps = {
    items,
    onClick: handleMenuClick,
  };

  // columns for the ant.design table
  const columns = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Description', dataIndex: 'description' },
    { title: 'Data Type', dataIndex: 'data_type' },
    { title: 'Enumerations', dataIndex: 'enumeration' },
  ];

  // data for the table columns. Each table has an array of variables. Each variable has a name, description, and data type.
  // The integer and quantity data types include additional details.
  // The enumeration data type includes a reference to a terminology, which includes further codes with the capability to match the
  // terms to ontology codes. If the data type is enumeration, there is a 'view/edit' link that takes the user to specified terminology.
  const dataSource = table?.variables?.map((v, index) => {
    return {
      key: index,
      name: v.name,
      description: v.description,
      data_type: v.data_type,
      enumeration:
        v.data_type === 'ENUMERATION' ? (
          <Link to={`/${v.enumerations.reference}`}>View/Edit</Link>
        ) : (
          ''
        ),
    };
  });

  // In progress. Not yet used.
  // Expandable rows for integer and quantity data types to display their additional data.
  // The additional elements include min, max, and units properties.
  const expandedRowRender = record => {
    const columns = [
      {
        title: 'Min',
        dataIndex: 'min',
        key: 'min',
      },
      {
        title: 'Max',
        dataIndex: 'max',
        key: 'max',
      },
      {
        title: 'Units',
        dataIndex: 'units',
        key: 'units',
      },
    ];

    const data = {
      min: record.min,
      max: record.max,
      units: record.units,
    };
    return <Table columns={columns} dataSource={data} pagination={false} />;
  };

  return (
    <>
      {loading ? (
        // If page is loading, display loading spinner. Otherwise display code below

        <Spinner />
      ) : (
        <div className="table_id_container">
          <div className="image_container">
            <img className="background_image_results" src={Background} />
          </div>

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
                    {/* ant.design dropdown with placeholder values. */}

                    <Dropdown menu={menuProps} style={{ width: '30vw' }}>
                      <Button>
                        <Space
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            width: 100,
                          }}
                        >
                          Settings
                          <DownOutlined />
                        </Space>
                      </Button>
                    </Dropdown>
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
            {/* ant.design table displaying the pre-defined columns and data, with expandable rows. 
            The expandable rows currently show the min, max, and units properties with no styling. */}
            <Table
              columns={columns}
              dataSource={dataSource}
              expandable={{
                expandedRowRender: record => (
                  <p
                    style={{
                      marginLeft: 50,
                    }}
                  >
                    min: {record.min} max: {record.max} units:{record.units}
                  </p>
                ),
                rowExpandable: record =>
                  record.data_type === 'INTEGER' ||
                  record.data_type === 'QUANTITY',
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};
