import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Button, Table } from "react-bootstrap";
import SubscriberModal from "./components/SubscriberModal";
import ApiHelper from "../../util/ApiHelper";


class SubscriberOverview extends Component {
  state = {
    subscriberModalOpen: false,
    subscriberModalData: null,
  };

  componentDidMount() {
    ApiHelper.fetchSubscribers().then();
  }

  openAddSubscriber() {
    this.setState({
      subscriberModalOpen: true,
      subscriberModalData: null,
    });
  }

  /**
   * @param subscriberId  {number}
   * @param plmn          {number}
   */
  async openEditSubscriber(subscriberId, plmn) {
    const subscriber = await ApiHelper.fetchSubscriberById(subscriberId, plmn);
    let origiData = subscriber;
    if (subscriber.FlowRules !== undefined && subscriber.FlowRules !== null) {
      subscriber.FlowRules.forEach(FlowRule => {
        let i = 0;
        subscriber.QosFlows.forEach(QosFlow => {
          if (QosFlow.snssai === FlowRule.snssai &&
              QosFlow.dnn === FlowRule.dnn &&
              QosFlow["5qi"] === FlowRule.qfi) 
          {
            if (origiData.QosFlows[i].flowRules === undefined) {
              origiData.QosFlows[i].flowRules = [];
            }
            origiData.QosFlows[i].flowRules.push(Object.assign(
                {
                  precedence: FlowRule.precedence, 
                  filter: FlowRule.filter,
                },
                FlowRule
                ))
          }
          i++;
        })
      });
    }
    delete origiData.FlowRules;
    this.setState({
      subscriberModalOpen: true,
      subscriberModalData: origiData,
    });
  }

  async addSubscriber(subscriberData) {
    this.setState({ subscriberModalOpen: false });
    let userNumber = subscriberData["userNumber"];

    if (!await ApiHelper.createSubscriber(subscriberData)) {
      if (userNumber > 1) {
        alert("Error creating new multiple subscribers when create user");
      }
      else if (userNumber === 1) {
        alert("Error creating new subscriber when create user");
      }
    }
    delete subscriberData["userNumber"];
    ApiHelper.fetchSubscribers().then();
  }

  /**
   * @param subscriberData
   */
  async updateSubscriber(subscriberData) {
    this.setState({ subscriberModalOpen: false });

    const result = await ApiHelper.updateSubscriber(subscriberData);

    if (!result) {
      alert("Error updating subscriber: " + subscriberData["ueId"]);
    }
    ApiHelper.fetchSubscribers().then();
  }

  /**
  * @param subscriber  {Subscriber}
   */
  async deleteSubscriber(subscriber) {
    if (!window.confirm(`Delete subscriber ${subscriber.id}?`))
      return;

    const result = await ApiHelper.deleteSubscriber(subscriber.id, subscriber.plmn);
    ApiHelper.fetchSubscribers().then();
    if (!result) {
      alert("Error deleting subscriber: " + subscriber.id);
    }
  }

  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="header subscribers__header">
                <h4>Subscribers</h4>
                <Button bsStyle={"primary"} className="subscribers__button"
                  onClick={this.openAddSubscriber.bind(this)}>
                  New Subscriber
                </Button>
              </div>
              <div className="content subscribers__content">
                <Table className="subscribers__table" striped bordered condensed hover>
                  <thead>
                    <tr>
                      <th style={{ width: 80 }}>PLMN</th>
                      <th>UE ID</th>
                      <th>MSISDN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.props.subscribers.map(subscriber => (
                      <tr key={subscriber.id}>
                        <td>{subscriber.plmn}</td>
                        <td>{subscriber.id}</td>
                        <td>{subscriber.msisdn}</td>
                        <td style={{ textAlign: 'center' }}>
                          <Button variant="danger" onClick={this.deleteSubscriber.bind(this, subscriber)}>Delete</Button>
                          &nbsp;&nbsp;&nbsp;&nbsp;
                          <Button variant="info" onClick={this.openEditSubscriber.bind(this, subscriber.id, subscriber.plmn)}>Modify</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                <p>&nbsp;</p><p>&nbsp;</p>
                <p>&nbsp;</p><p>&nbsp;</p>
                <p>&nbsp;</p><p>&nbsp;</p>
              </div>
            </div>
          </div>
        </div>

        <SubscriberModal open={this.state.subscriberModalOpen}
          setOpen={val => this.setState({ subscriberModalOpen: val })}
          subscriber={this.state.subscriberModalData}
          onModify={this.updateSubscriber.bind(this)}
          onSubmit={this.addSubscriber.bind(this)} />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  subscribers: state.subscriber.subscribers,
});

export default withRouter(connect(mapStateToProps)(SubscriberOverview));
