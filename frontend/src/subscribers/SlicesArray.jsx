import { Button } from 'react-bootstrap';
import { useFieldArray } from 'react-hook-form';


export { SlicesArray };

function DNNConfigArray({ nestIndex, control, register, errors, watch }) {
  const { fields, remove, append } = useFieldArray({
    control,
    name: `slices.${nestIndex}.dnns`,
    rules: {
      required: 'Please add at least one data network to this slice.',
      minLength: { value: 1, message: 'A slice must have at least one DNN.' }
    }
  });

  return (
    <div className="dnn-block">
      <h5>Data Network Configuration</h5>
      <Button variant="secondary" className="add-button" onClick={() => append({
        name: 'internet',
        uplinkAmbr: '1 Mbps',
        downlinkAmbr: '1 Mbps',
        default5qi: 9,
        flows: [
          {
            filter: '0.0.0.0/0',
            precedence: 128,
            fiveQi: 9,
            gbrUL: '100 Mbps',
            gbrDL: '100 Mbps',
            mbrUL: '1 Gbps',
            mbrDL: '1 Gbps'
          }
        ]
      })} >
        Add
      </Button>

      <div style={{ width: '100%', marginTop: '0.25rem', fontSize: '0.875em', color: '#dc3545' }}>{errors.slices?.[nestIndex]?.dnns?.root?.message}</div>
      {/*Note: this only works whhen 'display: none' is NOT in the style, which the invalid-feedback class unfortunately has, hence the inline style!*/}
      {fields.map((item, k) => {
        return (
          <div
            key={item.id}
            className="single-dnn" >

            <h6>Data Network {k}</h6>

            <Button variant="danger" onClick={() => remove(k)} >
              Remove
            </Button>

            <div className="form-group">
              <label>Data Network Name</label>
              <input
                type="text"
                name={`slices.${nestIndex}.dnns.${k}.name`}
                {...register(`slices.${nestIndex}.dnns.${k}.name`, {
                  required: true,
                })}
                className={`form-control ${errors.slices?.[nestIndex]?.dnns?.[k]?.name ? 'is-invalid' : ''}`} />
              <div className="invalid-feedback">{errors.slices?.[nestIndex]?.dnns?.[k]?.name?.message}</div>
            </div>

            <div className="form-group">
              <label>Uplink AMBR</label>
              <input
                type="text"
                name={`slices.${nestIndex}.dnns.${k}.uplinkAmbr`}
                {...register(`slices.${nestIndex}.dnns.${k}.uplinkAmbr`, {
                  required: 'Please enter an uplink AMBR.',
                  pattern: { value: /^[0-9]+(\\.[0-9]+)? (bps|Kbps|Mbps|Gbps|Tbps)$/, message: 'The uplink AMBR must have the form /^[0-9]+(\\.[0-9]+)? (bps|Kbps|Mbps|Gbps|Tbps)$/, e.g. \'1.0 Gbps\'.' }
                })}
                className={`form-control ${errors.slices?.[nestIndex]?.dnns?.[k]?.uplinkAmbr ? 'is-invalid' : ''}`} />
              <div className="invalid-feedback">{errors.slices?.[nestIndex]?.dnns?.[k]?.uplinkAmbr?.message}</div>
            </div>

            <div className="form-group">
              <label>Downlink AMBR</label>
              <input
                type="text"
                name={`slices.${nestIndex}.dnns.${k}.downlinkAmbr`}
                {...register(`slices.${nestIndex}.dnns.${k}.downlinkAmbr`, {
                  required: 'Please enter a downlink AMBR.',
                  pattern: { value: /^[0-9]+(\\.[0-9]+)? (bps|Kbps|Mbps|Gbps|Tbps)$/, message: 'The downlink AMBR must have the form /^[0-9]+(\\.[0-9]+)? (bps|Kbps|Mbps|Gbps|Tbps)$/, e.g. \'1.0 Gbps\'.' }
                })}
                className={`form-control ${errors.slices?.[nestIndex]?.dnns?.[k]?.downlinkAmbr ? 'is-invalid' : ''}`} />
              <div className="invalid-feedback">{errors.slices?.[nestIndex]?.dnns?.[k]?.downlinkAmbr?.message}</div>
            </div>

            <div className="form-group">
              <label>Default 5QI</label>
              <input
                type="number"
                name={`slices.${nestIndex}.dnns.${k}.default5qi`}
                {...register(`slices.${nestIndex}.dnns.${k}.default5qi`, {
                  required: 'Please enter a default 5QI.',
                  min: { value: 1, message: 'The default 5QI must be between 0 and 255.' },
                  max: { value: 255, message: 'The default 5QI must be between 0 and 255.' }
                })}
                className={`form-control ${errors.slices?.[nestIndex]?.dnns?.[k]?.default5qi ? 'is-invalid' : ''}`} />
              <div className="invalid-feedback">{errors.slices?.[nestIndex]?.dnns?.[k]?.default5qi?.message}</div>
            </div>

            <div className="form-group">
              <label>UP Security</label>
              <input
                name={`slices.${nestIndex}.dnns.${k}.upSecurity`}
                {...register(`slices.${nestIndex}.dnns.${k}.upSecurity`)}
                type="checkbox" />
            </div>

            {watch(`slices.${nestIndex}.dnns.${k}.upSecurity`) &&
              <div>
                <h5>UP Security Configuration</h5>
                <div className="form-group">
                  <label>Integrity</label>
                  <select
                    defaultValue="NOT_NEEDED"
                    {...register(`slices.${nestIndex}.dnns.${k}.upIntegrity`)}>
                    <option value="NOT_NEEDED">NOT_NEEDED</option>
                    <option value="PREFERRED">PREFERRED</option>
                    <option value="REQUIRED">REQUIRED</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Confidentiality</label>
                  <select
                    defaultValue="NOT_NEEDED"
                    {...register(`slices.${nestIndex}.dnns.${k}.upConfidentiality`)}>
                    <option value="NOT_NEEDED">NOT_NEEDED</option>
                    <option value="PREFERRED">PREFERRED</option>
                    <option value="REQUIRED">REQUIRED</option>
                  </select>
                </div>
              </div>
            }

            <FlowConfigArray sliceIndex={nestIndex} nestIndex={k} {...{ control, register, errors }} />
          </div>
        );
      })}
    </div>
  );
};

function FlowConfigArray({ sliceIndex, nestIndex, control, register, errors }) {
  const { fields, remove, append } = useFieldArray({
    control,
    name: `slices.${sliceIndex}.dnns.${nestIndex}.flows`,
  });

  return (
    <div className="flow-block">
      <h5>Flow Configuration</h5>
      <Button variant="secondary" className="add-button" onClick={() => append({
        filter: '0.0.0.0/0',
        precedence: 128,
        fiveQi: 9,
        gbrUL: '100 Mbps',
        gbrDL: '100 Mbps',
        mbrUL: '1 Gbps',
        mbrDL: '1 Gbps'
      })} >
        Add
      </Button>

      {fields.map((item, k) => {
        return (
          <div
            key={item.id}
            className="single-flow" >

            <h6>Flow {k}</h6>

            <Button variant="danger" onClick={() => remove(k)} >
              Remove
            </Button>

            <div className="form-group">
              <label>IP Filter</label>
              <input
                type="text"
                name={`slices.${sliceIndex}.dnns.${nestIndex}.flows.${k}.filter`}
                {...register(`slices.${sliceIndex}.dnns.${nestIndex}.flows.${k}.filter`, {
                  required: 'Please enter an IP filter.',
                  //TODO: what does such a filter look like?
                })}
                className={`form-control ${errors.slices?.[sliceIndex]?.dnns?.[nestIndex].flows?.[k]?.filter ? 'is-invalid' : ''}`} />
              <div className="invalid-feedback">{errors.slices?.[sliceIndex]?.dnns?.[nestIndex]?.flows?.[k]?.filter?.message}</div>
            </div>

            <div className="form-group">
              <label>Precedence</label>
              <input
                type="number"
                name={`slices.${sliceIndex}.dnns.${nestIndex}.flows.${k}.precedence`}
                {...register(`slices.${sliceIndex}.dnns.${nestIndex}.flows.${k}.precedence`, {
                  required: 'Please enter a precedence.',
                  min: { value: 1, message: 'The precedence must be between 1 and 256.' },
                  max: { value: 256, message: 'The precedence must be between 1 and 256.' }
                })}
                className={`form-control ${errors.slices?.[sliceIndex]?.dnns?.[nestIndex].flows?.[k]?.precedence ? 'is-invalid' : ''}`} />
              <div className="invalid-feedback">{errors.slices?.[sliceIndex]?.dnns?.[nestIndex]?.flows?.[k]?.precedence?.message}</div>
            </div>

            <div className="form-group">
              <label>5QI</label>
              <input
                type="number"
                name={`slices.${sliceIndex}.dnns.${nestIndex}.flows.${k}.fiveQi`}
                {...register(`slices.${sliceIndex}.dnns.${nestIndex}.flows.${k}.fiveQi`, {
                  required: 'Please enter a 5QI.',
                  min: { value: 0, message: 'The 5QI must be between 0 and 255.' },
                  max: { value: 255, message: 'The 5QI must be between 0 and 255.' }
                })}
                className={`form-control ${errors.slices?.[sliceIndex]?.dnns?.[nestIndex].flows?.[k]?.fiveQi ? 'is-invalid' : ''}`} />
              <div className="invalid-feedback">{errors.slices?.[sliceIndex]?.dnns?.[nestIndex]?.flows?.[k]?.fiveQi?.message}</div>
            </div>

            <div className="form-group">
              <label>Uplink Guaranteed Bitrate (UL GBR)</label>
              <input
                type="text"
                name={`slices.${sliceIndex}.dnns.${nestIndex}.flows.${k}.gbrUL`}
                {...register(`slices.${sliceIndex}.dnns.${nestIndex}.flows.${k}.gbrUL`, {
                  required: 'Please enter a UL GBR.',
                  pattern: { value: /^[0-9]+(\\.[0-9]+)? (bps|Kbps|Mbps|Gbps|Tbps)$/, message: 'The UL GBR must have the form /^[0-9]+(\\.[0-9]+)? (bps|Kbps|Mbps|Gbps|Tbps)$/, e.g. \'1.0 Gbps\'.' }
                })}
                className={`form-control ${errors.slices?.[sliceIndex]?.dnns?.[nestIndex].flows?.[k]?.gbrUL ? 'is-invalid' : ''}`} />
              <div className="invalid-feedback">{errors.slices?.[sliceIndex]?.dnns?.[nestIndex]?.flows?.[k]?.gbrUL?.message}</div>
            </div>

            <div className="form-group">
              <label>Downlink Guaranteed Bitrate (DL GBR)</label>
              <input
                type="text"
                name={`slices.${sliceIndex}.dnns.${nestIndex}.flows.${k}.gbrDL`}
                {...register(`slices.${sliceIndex}.dnns.${nestIndex}.flows.${k}.gbrDL`, {
                  required: 'Please enter a DL GBR.',
                  pattern: { value: /^[0-9]+(\\.[0-9]+)? (bps|Kbps|Mbps|Gbps|Tbps)$/, message: 'The DL GBR must have the form /^[0-9]+(\\.[0-9]+)? (bps|Kbps|Mbps|Gbps|Tbps)$/, e.g. \'1.0 Gbps\'.' }
                })}
                className={`form-control ${errors.slices?.[sliceIndex]?.dnns?.[nestIndex].flows?.[k]?.gbrDL ? 'is-invalid' : ''}`} />
              <div className="invalid-feedback">{errors.slices?.[sliceIndex]?.dnns?.[nestIndex]?.flows?.[k]?.gbrDL?.message}</div>
            </div>

            <div className="form-group">
              <label>Uplink Maximum Bitrate (UL MBR)</label>
              <input
                type="text"
                name={`slices.${sliceIndex}.dnns.${nestIndex}.flows.${k}.mbrUL`}
                {...register(`slices.${sliceIndex}.dnns.${nestIndex}.flows.${k}.mbrUL`, {
                  required: 'Please enter a UL MBR.',
                  pattern: { value: /^[0-9]+(\\.[0-9]+)? (bps|Kbps|Mbps|Gbps|Tbps)$/, message: 'The UL MBR must have the form /^[0-9]+(\\.[0-9]+)? (bps|Kbps|Mbps|Gbps|Tbps)$/, e.g. \'1.0 Gbps\'.' }
                })}
                className={`form-control ${errors.slices?.[sliceIndex]?.dnns?.[nestIndex].flows?.[k]?.mbrUL ? 'is-invalid' : ''}`} />
              <div className="invalid-feedback">{errors.slices?.[sliceIndex]?.dnns?.[nestIndex]?.flows?.[k]?.mbrUL?.message}</div>
            </div>

            <div className="form-group">
              <label>Downlink Maximum Bitrate (DL MBR)</label>
              <input
                type="text"
                name={`slices.${sliceIndex}.dnns.${nestIndex}.flows.${k}.mbrDL`}
                {...register(`slices.${sliceIndex}.dnns.${nestIndex}.flows.${k}.mbrDL`, {
                  required: 'Please enter a DL MBR.',
                  pattern: { value: /^[0-9]+(\\.[0-9]+)? (bps|Kbps|Mbps|Gbps|Tbps)$/, message: 'The DL MBR must have the form /^[0-9]+(\\.[0-9]+)? (bps|Kbps|Mbps|Gbps|Tbps)$/, e.g. \'1.0 Gbps\'.' }
                })}
                className={`form-control ${errors.slices?.[sliceIndex]?.dnns?.[nestIndex].flows?.[k]?.mbrDL ? 'is-invalid' : ''}`} />
              <div className="invalid-feedback">{errors.slices?.[sliceIndex]?.dnns?.[nestIndex]?.flows?.[k]?.mbrDL?.message}</div>
            </div>

          </div>
        );
      })}
    </div>
  );
};

function SlicesArray({ control, register, errors, watch }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'slices',
    rules: {
      required: 'Please add at least one slice.',
      minLength: { value: 1, message: 'A subscriber must have at least one supported slice.' }
    }
  });

  return (
    <div>
      <div style={{ display: 'flex' }}>
        <h3>Slice Configuration (S-NSSAI)</h3>
        <Button variant="primary" className="add-button" onClick={() => append({
          sst: 1,
          sd: '010203',
          isDefault: true,
          dnns: [
            {
              name: 'internet',
              uplinkAmbr: '1 Mbps',
              downlinkAmbr: '1 Mbps',
              default5qi: 9,
              flows: [
                {
                  filter: '0.0.0.0/0',
                  precedence: 128,
                  fiveQi: 9,
                  gbrUL: '100 Mbps',
                  gbrDL: '100 Mbps',
                  mbrUL: '1 Gbps',
                  mbrDL: '1 Gbps'
                }
              ]
            }
          ]
        })} >
          Add
        </Button>
      </div>

      <div style={{ width: '100%', marginTop: '0.25rem', fontSize: '0.875em', color: '#dc3545' }}>{errors.slices?.root?.message}</div> {/*Note: this only works whhen 'display: none' is NOT in the style, which the invalid-feedback class unfortunately has, hence the inline style!*/}

      {fields.map((item, index) => {
        return (
          <div key={item.id}>
            <div className="slice-block">
              <h4>Slice {index}</h4>

              <Button variant="danger" onClick={() => remove(index)} >
                Remove
              </Button>

              <div className="form-group">
                <label>SST</label>

                <input
                  name={`slices.${index}sst`}
                  {...register(`slices.${index}.sst`, {
                    required: 'Please enter an SST.',
                    min: { value: 0, message: 'An SST must be between 0 and 255.' },
                    max: { value: 255, message: 'An SST must be between 0 and 255.' }
                  })}
                  type="number"
                  className={`form-control ${errors.slices?.[index]?.sst ? 'is-invalid' : ''}`} />

                <div className="invalid-feedback">{errors.slices?.[index]?.sst?.message}</div>
              </div>

              <div className="form-group">
                <label>SD (hex)</label>
                <input
                  name={`slices.${index}sd`}
                  {...register(`slices.${index}.sd`, {
                    pattern: { value: /^$|^[A-Fa-f0-9]{6}$/, message: 'An SD can be empty or must consist of 6 characters in hexadecimal form (upper and lower case).' }
                  })}
                  type="text"
                  className={`form-control ${errors.slices?.[index]?.sd ? 'is-invalid' : ''}`} />
                <div className="invalid-feedback">{errors.slices?.[index]?.sd?.message}</div>
              </div>

              <div className="form-group">
                <label>Is default</label>
                <input
                  name={`slices.${index}isDefault`}
                  {...register(`slices.${index}.isDefault`)}
                  type="checkbox" />
              </div>

              <DNNConfigArray nestIndex={index} {...{ control, register, errors, watch }} />

            </div>
          </div>
        );
      })}
    </div>
  );
};
