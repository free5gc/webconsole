import React, {Component} from 'react';
import {Button} from "react-bootstrap";
import {Link, withRouter} from "react-router-dom";
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import {connect} from "react-redux";
import UEInfoApiHelper from "../../util/UEInfoApiHelper"

// eslint-disable-next-line no-unused-vars
var products = [{
  supi: "imsi-2089300007487",
  status: "CONNECTED"
}, {
  supi: "imsi-2089300007488",
  status: "IDLE"
},
  {
    supi: "imsi-2089300007489",
    status: "CONNECTED"
  },
  {
    supi: "imsi-2089300007485",
    status: "IDLE"
  },
  {
    supi: "imsi-2089300007484",
    status: "CONNECTED"
  }];

// It's a data format example.

class DetailButton extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(cell, row, rowIndex) {
    UEInfoApiHelper.fetchUEInfoDetail(cell).then(result => {
      let success = result[0]
      let smContextRef = result[1]

      if (success) {
        // console.log("After fetchUEInfoDetail")
        // console.log(smContextRef)
        UEInfoApiHelper.fetchUEInfoDetailSMF(smContextRef).then()
      }
    });
  }

  render() {
    const {cell, row, rowIndex} = this.props;
    return (
      <Button
        bsStyle="primary"
        onClick={() => this.handleClick(cell, row, rowIndex)}
      ><Link to={`/ueinfo/${cell}`}>
        Show Info
      </Link>
      </Button>
    );
  }
}

class UEInfo extends Component {
  ueInfoFetcherTimer = null;

  componentDidMount() {
    UEInfoApiHelper.fetchRegisteredUE().then();

    // Fetch ue info per 2 seconds
    // this.ueInfoFetcherTimer = setInterval(async () => {
    //   await UEInfoApiHelper.fetchRegisteredUE();
    // }, 2000);
  }

  componentWillUnmount() {
    // if (this.ueInfoFetcherTimer)
    //   clearInterval(this.ueInfoFetcherTimer);
  }

  refreshTable() {
    UEInfoApiHelper.fetchRegisteredUE().then();
  }

  cellButton(cell, row, enumObject, rowIndex) {
    return (
      <DetailButton cell={cell} row={row} rowIndex={rowIndex}/>
    );
  }

  rowStyleFormat(cell, row, enumObject, rowIndexx) {
    if (cell.Status === "Registered") {

      return {backgroundColor: "#4CBB17"};
    } else if (cell.Status === "Disconnected") {

      return {backgroundColor: "#CD5C5C"};
    }
    //return { backgroundColor: rowIndexx % 2 === 0 ? 'red' : 'blue' };
  }

  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="header subscribers__header">
                <h4>Registered UEs</h4>
                <Button bsStyle={"primary"} className="subscribers__button"
                        onClick={this.refreshTable.bind(this)}>
                  Refresh
                </Button>
              </div>

              <div className="content subscribers__content">
                <div>
                  <div className="col-12">
                    {this.props.get_registered_ue_err ? (
                      <h5>{this.props.registered_ue_err_msg}</h5>
                    ) : (
                      <BootstrapTable data={this.props.registered_users} striped={true}
                                      hover={true} /*trStyle={this.rowStyleFormat.bind(this)}*/>
                        <TableHeaderColumn dataField="supi" isKey={true} dataAlign="center"
                                           dataSort={true}>SUPI</TableHeaderColumn>
                        <TableHeaderColumn dataField="status" dataSort={true}>Status</TableHeaderColumn>
                        <TableHeaderColumn dataField="supi"
                                           dataFormat={this.cellButton.bind(this)}>Details</TableHeaderColumn>
                      </BootstrapTable>
                    )}
                  </div>
                </div>

                <p>&nbsp;</p><p>&nbsp;</p>
                <p>&nbsp;</p><p>&nbsp;</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(connect(state => ({
  registered_users: state.ueinfo.registered_users,
  get_registered_ue_err: state.ueinfo.get_registered_ue_err,
  registered_ue_err_msg: state.ueinfo.registered_ue_err_msg,
  smContextRef: state.ueinfo.smContextRef
}))(UEInfo));
