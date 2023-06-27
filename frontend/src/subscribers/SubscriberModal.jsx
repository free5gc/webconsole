import Modal from 'react-bootstrap/Modal';
import { useSelector } from 'react-redux';
import { useForm } from "react-hook-form";
import { useEffect } from 'react';
import { SlicesArray } from './SlicesArray';
import _ from 'lodash';
import { useState } from 'react';
import { backendToFrontend, frontendToBackend } from './marshalHelper';
import { Button } from 'react-bootstrap';
import { store, subscribersActions } from '../_store';
import { defaultSubscriber } from './defaultSubscriber';

export { SubscriberModal };

function SubscriberModal(props) {
  const { error: subscriberError, detailedSubscriber, subscribers } = useSelector(x => x.subscribers);

  const formOptions = {
    defaultValues: defaultSubscriber
  };

  // get functions to build form with useForm() hook
  const { register, handleSubmit, formState, setValue, getValues, control, reset, watch } = useForm(formOptions);
  const { errors, isSubmitting } = formState;

  const [supiReadOnly, setSupiReadOnly] = useState(true);
  const toggleSupi = () => setSupiReadOnly(!supiReadOnly);

  // set the detailed subscriber data
  useEffect(() => {
    if (!_.isEmpty(detailedSubscriber) && !detailedSubscriber.loading) {
      reset(backendToFrontend(detailedSubscriber));
    }
  }, [detailedSubscriber, reset]);

  const onSubmit = async (data, e) => {
    // prevent browser from reloading, as we do that with our change in the subscribers list
    e.preventDefault();

    console.log('data from form ', data);

    let marshalledData = frontendToBackend(data);
    console.log('previous subscriber data ', detailedSubscriber);
    console.log('modified subscriber data ', marshalledData);

    let previousSupi = _.get(detailedSubscriber, 'supi');
    let newSupi = _.get(marshalledData, 'supi');
    let previousMsisdn = _.get(detailedSubscriber, 'AccessAndMobilitySubscriptionData.gpsis')?.filter(gpsi => gpsi.includes('msisdn-'))[0];
    let newMsisdn = _.get(marshalledData, 'AccessAndMobilitySubscriptionData.gpsis')?.filter(gpsi => gpsi.includes('msisdn-'))[0];

    // A susbcriber cannot be created if it has the same SUPI as the previous one
    if (props.duplicateSubscriber
      && _.isEqual(previousSupi, newSupi)) {
      //subscriber unique identifier was not modified, do not accept submit
      alert('You have to modify the IMSI/ SUPI!');
      return false;
    }

    // A susbcriber cannot be created if it has the same MSISDN as the previous one (except for empty msisdn)
    if (props.duplicateSubscriber
      && newMsisdn !== 'msisdn-'
      && _.isEqual(previousMsisdn, newMsisdn)) {
      //subscriber unique identifier was not modified, do not accept submit
      alert('You have to modify the MSISDN!');
      return false;
    }

    // If a subscriber is not modified (aka only shown), do not post/ put any changes
    if (!props.duplicateSubscriber && !props.newSubscriber
      && _.isEqual(detailedSubscriber, marshalledData)) {
      console.log('subscriber not modified, do not PUT to backend');
      props.handleClose();
      return false;
    }

    // If a subscriber is created with a duplicate SUPI or MSISDN, do not accept and warn
    // Otherwise the existing subscriber will be overwritten accidentally
    if ((props.duplicateSubscriber || props.newSubscriber)
      && _.filter(subscribers, function (sub) {
        return sub.supi === newSupi || (newMsisdn !== 'msisdn-' && _.isEqual('msisdn-' + sub.msisdn, newMsisdn))
      }).length > 0) {
      alert('SUPI and/ or MSISDN already exist. You have to modify the SUPI and/ or MSISDN!');
      return false;
    }

    store.dispatch(subscribersActions.setDetailedSubscriber(marshalledData));

    try {
      await props.submitAction(marshalledData);
      props.handleClose();
    } catch (e) {
      console.log('error while submitting: ', e);
    }
  }

  const supiToPlmnMsin = (supi) => {
    if (supi.length === 15) {
      let plmnId = supi.substring(0, 5);
      setValue('plmnId', '' + plmnId);
      setValue('mcc', '' + plmnId.substring(0, 3));
      setValue('mnc', '' + plmnId.substring(3, 5));
      setValue('msin', parseInt(supi.substring(5)));
    } else if (supi.length === 16) {
      let plmnId = supi.substring(0, 6);
      setValue('plmnId', '' + plmnId);
      setValue('mcc', '' + plmnId.substring(0, 3));
      setValue('mnc', '' + plmnId.substring(3, 6));
      setValue('msin', parseInt(supi.substring(6)));
    } else {
      setValue('plmnId', '--');
      setValue('mcc', '--');
      setValue('mnc', '--');
      setValue('msin', 0);
    }
  };

  return (
    <Modal show={props.show} onHide={() => {
      reset(defaultSubscriber);
      props.handleClose();
    }} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{props.newSubscriber ? 'New Subscriber' : props.duplicateSubscriber ? 'New Subscriber (from Existing)' : 'Modify Subscriber'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {(props.newSubscriber || (!detailedSubscriber.error && !detailedSubscriber.loading)) &&
          <form onSubmit={handleSubmit(onSubmit)}>
            <button disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting && <span className="spinner-border spinner-border-sm mr-1"></span>}
              Submit
            </button>
            {props.newSubscriber &&
              <button
                type="button"
                className="btn btn-danger"
                style={{ marginLeft: '10px' }}
                onClick={() => {
                  reset(defaultSubscriber);
                }}>
                Reset
              </button>
            }
            {/*<button type="button" className="btn btn-secondary" onClick={() => {
              frontendToBackend(getValues());
            }}>
              Log backend data (TODO: remove)
          </button>*/}

            {(props.newSubscriber || props.duplicateSubscriber) &&
              <div className="subscriber-config-block">
                <div className="form-group">
                  <label>Create multiple subscribers at once</label>
                  <input
                    name={'multisubs'}
                    {...register('multisubs')}
                    type="checkbox" />
                </div>

                {watch('multisubs') &&
                  <div>
                    <div className="form-group">
                      <label>Number of subscribers to create simultaneously (auto-increased MSIN)</label>
                      <input
                        name="userNumber"
                        type="number"
                        {...register('userNumber', {
                          required: 'Please enter the number of subscribers you want to create simultaneously.',
                          min: { value: 2, message: 'The number of subscribers must be between 2 and 20.' },
                          max: { value: 20, message: 'The number of subscribers must be between 2 and 20.' },
                        })}
                        className={`form-control ${errors.userNumber ? 'is-invalid' : ''}`} />
                      <div className="invalid-feedback">{errors.userNumber?.message}</div>
                    </div>
                  </div>
                }
              </div>
            }

            <div className="subscriber-config-block">
              <h3>Subscriber Information</h3>

              {(props.newSubscriber || props.duplicateSubscriber) &&
                <Button
                  variant="info"
                  checked={!supiReadOnly}
                  onClick={toggleSupi} >Modify {supiReadOnly ? 'IMSI' : 'PLMN+MSIN'}</Button>
              }

              <div className="form-group">
                <label>IMSI/ SUPI</label>
                <input
                  name="supi"
                  type="text"
                  readOnly={supiReadOnly || (!props.newSubscriber && !props.duplicateSubscriber)}
                  {...register('supi', {
                    required: 'Please enter an IMSI/ SUPI.',
                    pattern: { value: /^[0-9]{14,15}$/, message: 'An IMSI/ SUPI must consist of 14-15 digits.' }
                  })}
                  onInput={(e) => supiToPlmnMsin(e.target.value)}
                  className={`form-control ${errors.supi ? 'is-invalid' : ''}`} />
                <div className="invalid-feedback">{errors.supi?.message}</div>
                {(!props.newSubscriber && !props.duplicateSubscriber) &&
                  <div style={{ width: '100%', marginTop: '0.25rem', fontSize: '0.875em', color: '#1DC7EA' }}>The IMSI/ SUPI is not modifyable for an existing subscriber.</div>
                }
              </div>

              <div className="form-group">
                <label>MSISDN</label>
                <input
                  name="msisdn"
                  type="text"
                  readOnly={(!props.newSubscriber && !props.duplicateSubscriber)}
                  {...register('msisdn', {
                    pattern: { value: /^$|^[0-9]{5,15}$/, message: 'A MSISDN can be empty or must consist of 5-15 digits.' }
                  })}
                  className={`form-control ${errors.msisdn ? 'is-invalid' : ''}`} />
                <div className="invalid-feedback">{errors.msisdn?.message}</div>
                {(!props.newSubscriber && !props.duplicateSubscriber) &&
                  <div style={{ width: '100%', marginTop: '0.25rem', fontSize: '0.875em', color: '#1DC7EA' }}>The MSISDN is not modifyable for an existing subscriber.</div>
                }
              </div>

              {(props.newSubscriber || props.duplicateSubscriber) && !supiReadOnly &&
                <div className="form-group">
                  <label>PLMN ID</label>
                  <input
                    name="plmnId"
                    type="text"
                    readOnly
                    {...register('plmnId', {
                      required: 'Please enter a PLMN ID.',
                      pattern: { value: /^[0-9]{5,6}$/, message: 'A PLMN ID must consist of 5-6 digits.' }
                    })}
                    className={`form-control ${errors.plmnId ? 'is-invalid' : ''}`} />
                  <div className="invalid-feedback">{errors.plmnId?.message}</div>
                </div>
              }

              {(props.newSubscriber || props.duplicateSubscriber) && supiReadOnly &&
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexDirection: 'row' }}>
                  <div className="form-group">
                    <label>PLMN ID</label>
                    {(!props.newSubscriber && !props.duplicateSubscriber) &&
                      <div style={{ width: '100%', marginTop: '0.25rem', fontSize: '0.875em', color: '#1DC7EA' }}>The PLMN ID is not modifyable for an existing subscriber.</div>
                    }
                    <div style={{ display: 'flex' }}>
                      <label>MCC</label>
                      <input
                        name="mcc"
                        type="text"
                        readOnly={!supiReadOnly || (!props.newSubscriber && !props.duplicateSubscriber)}
                        {...register('mcc', {
                          required: 'Please enter an MCC.',
                          pattern: { value: /^[0-9]{3}$/, message: 'An MCC must consist of 3 digits.' }
                        })}
                        onInput={(e) => {
                          setValue('supi', '' + e.target.value + getValues('mnc') + getValues('msin').toString().padStart(10, '0'));
                          setValue('plmnId', '' + e.target.value + getValues('mnc'));
                        }}
                        className={`form-control ${errors.mcc ? 'is-invalid' : ''}`} />
                      <div className="invalid-feedback">{errors.mcc?.message}</div>

                      <label>MNC</label>
                      <input
                        name="mnc"
                        type="text"
                        readOnly={!supiReadOnly || (!props.newSubscriber && !props.duplicateSubscriber)}
                        {...register('mnc', {
                          required: 'Please enter an MNC.',
                          pattern: { value: /^[0-9]{2,3}$/, message: 'An MNC must consist of 2-3 digits.' }
                        })}
                        onInput={(e) => {
                          setValue('supi', '' + getValues('mcc') + e.target.value + getValues('msin').toString().padStart(10, '0'));
                          setValue('plmnId', '' + getValues('mcc') + e.target.value);
                        }}
                        className={`form-control ${errors.mnc ? 'is-invalid' : ''}`} />
                      <div className="invalid-feedback">{errors.mnc?.message}</div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>MSIN</label>
                    <input
                      name="msin"
                      type="number"
                      readOnly={!supiReadOnly || (!props.newSubscriber && !props.duplicateSubscriber)}
                      {...register('msin', {
                        required: 'Please enter an MSIN.',
                        min: { value: 1, message: 'The MSIN must be between 1 and 9999999999.' },
                        max: { value: 9999999999, message: 'The MSIN must be between 1 and 9999999999.' },
                      })}
                      onInput={(e) => setValue('supi', '' + getValues('mcc') + getValues('mnc') + e.target.value.toString().padStart(10, '0'))}
                      className={`form-control ${errors.msin ? 'is-invalid' : ''}`} />
                    <div className="invalid-feedback">{errors.msin?.message}</div>
                  </div>
                </div>
              }

              <div className="form-group">
                <label>Authentication Method</label>
                <select defaultValue="5G_AKA" {...register('authMethod')}>
                  <option value="5G_AKA">5G_AKA</option>
                  <option value="EAP_AKA_PRIME">EAP_AKA_PRIME</option>
                </select>
              </div>

              <div className="form-group">
                <label>Key</label>
                <input
                  name="key"
                  type="text"
                  {...register('key', {
                    required: 'Please enter a key. A key must consist of 32 characters in hexadecimal form (upper or lower case).',
                    pattern: { value: /^[A-Fa-f0-9]{32}$/, message: 'A key must consist of 32 characters in hexadecimal form (upper or lower case).' }
                  })}
                  className={`form-control ${errors.key ? 'is-invalid' : ''}`} />
                <div className="invalid-feedback">{errors.key?.message}</div>
              </div>

              <div className="form-group">
                <label>Authentication Management Field (AMF)</label>
                <input
                  name="amf"
                  type="text"
                  {...register('amf', {
                    required: 'Please enter an AMF. An AMF must consist of 4 characters in hexadecimal form (upper or lower case).',
                    pattern: { value: /^[A-Fa-f0-9]{4}$/, message: 'An AMF must consist of 4 characters in hexadecimal form (upper or lower case).' }
                  })}
                  className={`form-control ${errors.amf ? 'is-invalid' : ''}`} />
                <div className="invalid-feedback">{errors.amf?.message}</div>
              </div>

              <div className="form-group">
                <label>Sequence Number</label>
                <input
                  name="sqn"
                  type="text"
                  {...register('sqn', {
                    required: 'Please enter a sequence number. A sequence number must consist of 1-12 characters in hexadecimal form (upper or lower case).',
                    pattern: { value: /^[A-Fa-f0-9]{1,12}$/, message: 'A sequence number must consist of 1-12 characters in hexadecimal form (upper or lower case).' }
                  })}
                  className={`form-control ${errors.sqn ? 'is-invalid' : ''}`} />
                <div className="invalid-feedback">{errors.sqn?.message}</div>
              </div>

              <div className="form-group">
                <label>Operator Code Type</label>
                <select defaultValue="OP" {...register('opCodeType')}>
                  <option value="OP">OP</option>
                  <option value="OPc">OPc</option>
                </select>
              </div>

              <div className="form-group">
                <label>Operator Code</label>
                <input
                  name="opCode"
                  type="text"
                  {...register('opCode', {
                    required: 'Please enter an operator code. An operator code must consist of 32 characters in hexadecimal form (upper or lower case).',
                    pattern: { value: /^[A-Fa-f0-9]{32}$/, message: 'An operator code must consist of 32 characters in hexadecimal form (upper or lower case).' }
                  })}
                  className={`form-control ${errors.opCode ? 'is-invalid' : ''}`} />
                <div className="invalid-feedback">{errors.opCode?.message}</div>
              </div>
            </div>

            <div className="subscriber-config-block">
              <SlicesArray {...{ control, register, errors, watch }} />
            </div>

            <button disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting && <span className="spinner-border spinner-border-sm mr-1"></span>}
              Submit
            </button>
            <button type="button" className="btn btn-danger" onClick={() => {
              if (props.newSubscriber) {
                reset(defaultSubscriber);
              } else {
                reset(backendToFrontend(detailedSubscriber));
              }
            }}>
              Reset
            </button>
          </form>
        }
        {detailedSubscriber.loading && <div className="spinner-border spinner-border-sm"></div>}
        {subscriberError &&
          <div className="alert alert-danger mt-3 mb-0">Error loading subscriber details: {subscriberError.message}</div>
        }
      </Modal.Body>
    </Modal>
  );
}
