import { UeInfo } from './UEInfo';
//import { useRef } from 'react';

export { Dashboard };

function Dashboard() {

  return (
    <div className="content">
      <div className="dashboard-container">
        {/*<p>Rerenders: {renderCounter.current = renderCounter.current + 1}</p>*/}
        
        <UeInfo />
      </div>
    </div>
  );
}
