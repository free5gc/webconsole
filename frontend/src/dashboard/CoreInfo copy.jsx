import { useSelector } from 'react-redux';

import { slicesActions } from '../_store';
import { InfoHeader } from '../_components/InfoHeader';
import { useRef } from 'react';


export { CoreInfo };

function Slice(props) {
  return <li>PlmnID: {props.slice.plmnId}, Slice/Service Type: {props.slice.sst}, Slice Differentiator: {props.slice.sd}</li>;
}

function CoreInfo() {
  const { supportedSlices } = useSelector(x => x.slices);
  const renderCounter = useRef(0);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            {/*<p>Rerenders: {renderCounter.current = renderCounter.current + 1}</p>*/}

            <InfoHeader
              headline="Configured Slices"
              refreshAction={() => slicesActions.getSupportedSlices()} />

            <div className="content subscribers__content">
              <div>
                <div className="col-12">
                  {supportedSlices.length &&
                    <ul>
                      {supportedSlices.map((slice, index) =>
                        <Slice key={index} slice={slice} />
                      )}
                    </ul>
                  }
                  {supportedSlices.loading && <div className="spinner-border spinner-border-sm"></div>}
                  {supportedSlices.error && <div className="text-danger">Error loading supported slices: {supportedSlices.error.message }
                  </div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
