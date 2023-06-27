//import { useEffect, useRef } from 'react';
import { Button } from "react-bootstrap";
import { useSelector } from 'react-redux';

import { uesActions } from '../_store';
import { history } from '../_helpers';
import { InfoHeader } from '../_components/InfoHeader';

export { UeInfo };

function UeInfo() {
  const { ues } = useSelector(x => x.ues);
  //const renderCounter = useRef(0);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            {/*<p>Rerenders: {renderCounter.current = renderCounter.current + 1}</p>*/}

            <InfoHeader headline="Connected UEs" refreshAction={() => uesActions.getRegisteredUesAndAmfContexts()} />

            <div className="content subscribers__content">
              <div>
                <div className="col-12">
                  {ues.length &&
                    <div>
                      <span>{ues.length} registered UEs</span>
                      <Button className="subscribers__button"
                        onClick={() => history.navigate('/ues')}>
                        Show UEs
                      </Button>
                    </div>
                  }
                  {/*ues.loading && <div className="spinner-border spinner-border-sm"></div>*/}
                  {ues.info && <div className="text-info">Info: {ues.info.message}
                  </div>}
                  {ues.error && <div className="text-danger">Error loading registered UEs: {ues.error.message}
                  </div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
