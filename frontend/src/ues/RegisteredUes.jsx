import { Button, Table } from 'react-bootstrap';

import { uesActions } from '../_store';
import { useDispatch, useSelector } from 'react-redux';
//import { useRef } from 'react';
import { useState } from 'react';
import { UeDetailsModal } from './UeDetailsModal';
import { InfoHeader } from '../_components/InfoHeader';

export { RegisteredUes };

function RegisteredUes() {
  //const renderCounter = useRef(0);
  const dispatch = useDispatch();
  const { ues } = useSelector(x => x.ues);

  const [showModal, setShowModal] = useState(false);
  const toggleModal = () => setShowModal(!showModal);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            {/*<p>Rerenders: {renderCounter.current = renderCounter.current + 1}</p>*/}

            <InfoHeader headline="Registered User Equipment" refreshAction={() => uesActions.getRegisteredUesAndAmfContexts()} />

            <div>
              <div className="content subscribers__content">
                {ues.length &&
                  <Table className="subscribers__table" striped bordered hover>
                    <thead>
                      <tr>
                        <th>SUPI</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {ues.map(ue => {
                        return (
                          <tr key={ue.supi}>
                            <td>{ue.supi}</td>
                            <td>{ue.cmstate}</td>
                            <td>
                              <Button
                                variant="primary"
                                onClick={() => {
                                  dispatch(uesActions.getUeSessionInfoById(ue.supi));
                                  toggleModal();
                                }}>
                                UE Details
                              </Button></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </Table>
                }
                {/*ues.loading && <div className="spinner-border spinner-border-sm"></div>*/}
                {ues.info &&
                  <div className="text-info">Info: {ues.info.message}</div>
                }
                {ues.error &&
                  <div className="text-danger">Error loading registered UEs: {ues.error.message}</div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
      <UeDetailsModal
        show={showModal}
        handleClose={toggleModal} />
    </div>
  );
}
