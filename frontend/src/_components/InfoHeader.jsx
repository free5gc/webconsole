import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import { useDispatch } from 'react-redux';

export { InfoHeader };

// the header for various pages, containing an automatic refresh functionality
function InfoHeader({ refreshAction, headline }) {
  const dispatch = useDispatch();
  const [ time, setTime ] = useState(Date.now());
  const [ refreshInterval, setRefreshInterval ] = useState(0);

  // execute every time the refreshInterval changes to set the interval correctly
  // update the time value every x ms, which triggers refresh (see below)
  useEffect(() => {
    console.log(`refresh interval changed to ${refreshInterval}`);
    if (refreshInterval === 0)
      return;
    const interval = setInterval(() => setTime(Date.now()), refreshInterval);
    return () => {
      clearInterval(interval);
    };
  }, [ refreshInterval ]);

  // refresh every time the 'time' value changes
  useEffect(() => {
    console.log(`dispatch refresh action for time ${time}`);
    dispatch(refreshAction());
    // eslint-disable-next-line
  }, [ time, dispatch ]);

  return (
    <div className="header subscribers__header">
      <h4>{headline}</h4>
      <div style={{ display: 'flex', float: 'right', flexDirection: 'column' }}>
        <Button
          variant="primary"
          className="subscribers__button"
          onClick={() => {
            dispatch(refreshAction());
          }}>
          Refresh
        </Button>
        <Form.Select variant="primary" onChange={e => setRefreshInterval(parseInt(e.currentTarget.value))}>
          <option value="0">manual</option>
          <option value="1000">1s</option>
          <option value="5000">5s</option>
          <option value="10000">10s</option>
          <option value="30000">30s</option>
          <option value="60000">1m</option>
        </Form.Select>
      </div>
    </div>
  );
}
