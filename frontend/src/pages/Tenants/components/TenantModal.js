import React, { Component } from 'react';
import { Modal } from "react-bootstrap";
import Form from "react-jsonschema-form";
import PropTypes from 'prop-types';

class TenantModal extends Component {
  static propTypes = {
    open: PropTypes.bool.isRequired,
    setOpen: PropTypes.func.isRequired,
    subscriber: PropTypes.object,
    onModify: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
  };

  state = {
    editMode: false,
    formData: undefined,
    // for force re-rendering json form
    rerenderCounter: 0,
  };

  state = {
    formData: undefined,
    editMode: false,
    // for force re-rendering json form
    rerenderCounter: 0,
  };

  schema = {
    // title: "A registration form",
    // "description": "A simple form example.",
    type: "object",
    required: [
      "ueId",
    ],
    properties: {
      tenantId: {
        type: "string",
        title: "Tenant ID",
        pattern: "^[0-9a-zA-Z-]*$",
        default: "",
      },
      ueId: {
        type: "string",
        title: "Tenant Name",
        default: "",
      },
    },
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps !== this.props) {
      this.setState({ editMode: !!this.props.subscriber });

      if (this.props.subscriber) {
        const subscriber = this.props.subscriber;

        let formData = {
          tenantId: subscriber['tenantId'],
          ueId: subscriber['ueId'],
        };

        this.updateFormData(formData).then();
      }
    }
  }

  async onChange(data) {
    const lastData = this.state.formData;

    if (lastData && lastData.tenantId === undefined)
      lastData.tenantId = "";
  }

  async updateFormData(newData) {
    // Workaround for bug: https://github.com/rjsf-team/react-jsonschema-form/issues/758
    await this.setState({ rerenderCounter: this.state.rerenderCounter + 1 });
    await this.setState({
      rerenderCounter: this.state.rerenderCounter + 1,
      formData: newData,
    });
  }

  onSubmitClick(result) {
    const formData = result.formData;

    let tenantData = {
      "tenantId": formData["tenantId"],
      "tenantName": formData["ueId"]
    };

    if(this.state.editMode) {
      this.props.onModify(tenantData);
    } else {
      this.props.onSubmit(tenantData);
    }
  }

  render() {
    return (
      <Modal
        show={this.props.open}
        className={"fields__edit-modal theme-light"}
        backdrop={"static"}
        onHide={this.props.setOpen.bind(this, false)}>
        <Modal.Header closeButton>
          <Modal.Title id="example-modal-sizes-title-lg">
            {this.state.editMode ? "Edit Tenant" : "New Tenant"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {this.state.rerenderCounter % 2 === 0 &&
            <Form schema={this.schema}
              formData={this.state.formData}
              onChange={this.onChange.bind(this)}
              onSubmit={this.onSubmitClick.bind(this)} />
          }
        </Modal.Body>
      </Modal>
    );

  }
}

export default TenantModal;
