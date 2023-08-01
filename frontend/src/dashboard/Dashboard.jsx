import { UeInfo } from './UEInfo';
//import { useRef } from 'react';

export { Dashboard };

function Dashboard() {

  return (
    <div className="content">
      <div className="dashboard-container">
        {/*<p>Rerenders: {renderCounter.current = renderCounter.current + 1}</p>*/}
        <h2 style={{ color: '#116fb3' }}>Dashboard</h2>
        <UeInfo />
      </div>
    </div>
  );
}
