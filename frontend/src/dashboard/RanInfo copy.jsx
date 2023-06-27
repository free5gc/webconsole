import { useRef } from 'react';
import { Table } from "react-bootstrap";
import { useSelector } from 'react-redux';

import { ransActions } from '../_store';
import { InfoHeader } from '../_components/InfoHeader';


export { RanInfo };

const sliceFormatter = ({ slices }) => {
  return (
    <ul>
      {slices.map((slice, index) => {
        return (
          <li key={index}>Slice/Service Type: {slice.Sst}, <br />Slice Differentiator: {slice.Sd}</li>
        )
      })}
    </ul>
  );
}

function RanInfo() {
  const { rans } = useSelector(x => x.rans);
  const renderCounter = useRef(0);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            {/*<p>Rerenders: {renderCounter.current = renderCounter.current + 1}</p>*/}

            <InfoHeader headline="Connected RANs" refreshAction={() => ransActions.getConnectedRans()} />

            <div className="content subscribers__content">
              {rans.length &&
                <Table className="subscribers__table" striped bordered hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Address (external)</th>
                      <th>Available Slices</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rans.map(ran => {
                      return (
                        <tr key={ran.Name}>
                          <td>{ran.Name}</td>
                          <td>{ran.Address}</td>
                          <td>{sliceFormatter({ slices: ran.Slices })}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </Table>
              }
              {rans.loading && <div className="spinner-border spinner-border-sm"></div>}
              {rans.error && <div className="text-danger">Error loading connected RANs: {rans.error.message}
              </div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
