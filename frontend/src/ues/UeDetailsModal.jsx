import { useSelector } from "react-redux";
import Modal from 'react-bootstrap/Modal';
import _ from 'lodash';
import { Table } from "react-bootstrap";

export { UeDetailsModal };

const AmfInfo = (props) => {
  let { supi, accesstype, cmstate, guti, pdusessions, tac, mcc, mnc } = props.amfInfo;
  console.log(props.amfInfo);
  return (
    <div className="content subscribers__content">
      <Table className="subscribers__table" striped bordered hover>
        <thead>
          <tr>
            <th>Property</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>SUPI</td>
            <td>{supi}</td>
          </tr>
          <tr>
            <td>AccessType</td>
            <td>{accesstype}</td>
          </tr>
          <tr>
            <td>Status</td>
            <td>{cmstate}</td>
          </tr>
          <tr>
            <td>GUTI</td>
            <td>{guti}</td>
          </tr>
          <tr>
            <td>TAI</td>
            <td>
              <ul>
                <li>PLMN: {mcc}{mnc}</li>
                <li>TAC: {tac}</li>
              </ul>
            </td>
          </tr>
          <tr>
            <td>PDU Sessions</td>
            <td><ul>{pdusessions.map(session => {
              return (
                <li key={session.pdusessionid}>
                  ID: {session.pdusessionid}<br />
                  S-NSSAI: sst: {session.sst}, sd: {session.sd}<br />
                  DNN Name: {session.dnn}<br />
                  smContextRef: {session.smcontextref}
                </li>
              )
            })}</ul></td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
}

const SmfInfo = (props) => {
  let { pduaddress, upcnxstate, pdusessionid } = props.smfInfo;
  return (
    <div className="content subscribers__content">
      <Table className="subscribers__table" striped bordered hover>
        <thead>
          <tr>
            <th>Property</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
        <tr>
            <td>PDU Session ID</td>
            <td>{pdusessionid}</td>
          </tr>
          <tr>
            <td>PDU Session Address</td>
            <td>{pduaddress}</td>
          </tr>
          <tr>
            <td>User Plane Context State</td>
            <td>{upcnxstate}</td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
}

function UeDetailsModal(props) {
  const { detailedUe } = useSelector(x => x.ues);

  return (
    <Modal show={props.show} onHide={props.handleClose} size='lg'>
      <Modal.Header closeButton>
        <Modal.Title>Details for Registered UE {!_.isEmpty(detailedUe) && !detailedUe.loading ? detailedUe.amfInfo?.supi : ''}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!_.isEmpty(detailedUe) && !detailedUe.loading && !detailedUe.error &&
          <>
            {/*console.log('detailed UE: ', detailedUe)*/}
            <div>
              <h4>AMF Information</h4>
              <AmfInfo amfInfo={detailedUe.amfInfo} />
            </div>
            <div>
              <h4>SMF Information</h4>
              <SmfInfo smfInfo={detailedUe.smfInfo} />
            </div>
          </>
        }
        {detailedUe.loading && <div className="spinner-border spinner-border-sm"></div>}
        {
          detailedUe.error &&
          <div className="alert alert-danger mt-3 mb-0">Problem loading UE details: {detailedUe.error.message}</div>
        }
      </Modal.Body >
    </Modal >
  );
};
