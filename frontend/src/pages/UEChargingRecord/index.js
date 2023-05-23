import React, { Component } from "react";
import { Button } from "react-bootstrap";
import { Link, withRouter } from "react-router-dom";
import BootstrapTable from "react-bootstrap-table-next";

import { connect } from "react-redux";
import UEInfoApiHelper from "../../util/UEInfoApiHelper";

class UEChargingRecord extends Component {
  componentDidMount() {
    UEInfoApiHelper.fetchUEWithCR().then();

    this.interval = setInterval(async () => {
      await UEInfoApiHelper.fetchUEWithCR();
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  columns = [{
    dataField: 'supi',
    text: 'SUPI',
    sort: true
  }, {
    dataField: 'status',
    text: 'Status'
  }, {
    dataField: 'quotaLeft',
    text: 'Quota Left'
  }, {
    dataField: 'totalVol',
    text: 'Data Total Volume'
  }, {
    dataField: 'ulVol',
    text: 'Data Volume Uplink'
  }, {
    dataField: 'dlVol',
    text: 'Data Volume Downlink'
  }];
  
  flowColumns = [{
    dataField: 'Filter',
    text: 'Filter',
    sort: true
  }, {
    dataField: 'QuotaLeft',
    text: 'Quota Left'
  }, {
    dataField: 'DataTotalVolume',
    text: 'Data Total Volume'
  }, {
    dataField: 'DataVolumeUplink',
    text: 'Data Volume Uplink'
  }, {
    dataField: 'DataVolumeDownlink',
    text: 'Data Volume Downlink'
  }];

  
  expandRow = {
    renderer: (row) => (
      <div>
        <script>
          console.log(row)
        </script>
  
        <BootstrapTable 
          keyField='Filter' 
          data={ row.flowInfos }
          columns={ this.flowColumns }
        />
      </div>
    )
  };

  render() {
    return (
      <div className="content">
        <div className="container-fluid">
          <div className="dashboard__title">
            <h2>Real Time Status with Charging Record</h2>
            <Button
              bsStyle={"primary"}
              className="subscribers__button"
              onClick={() => UEInfoApiHelper.fetchUEWithCR().then()}
            >
              Refresh
            </Button>
          </div>

          <div className="row">
            <BootstrapTable 
              keyField='supi' 
              data={ this.props.users_cr } 
              columns={ this.columns }
              expandRow={ this.expandRow } 
            />
          </div>

        </div>
      </div>
    );
  }
}

export default withRouter(
  connect((state) => ({
    users_cr: state.ueinfo.users_cr,
    get_ue_cr_err: state.ueinfo.get_ue_cr_err,
    ue_cr_err_msg: state.ueinfo.ue_cr_err_msg,
    smContextRef: state.ueinfo.smContextRef,
  }))(UEChargingRecord)
);
