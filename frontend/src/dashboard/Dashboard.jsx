import { useSelector } from 'react-redux';

import { UeInfo } from './UEInfo';
//import { useRef } from 'react';

export { Dashboard };

function Dashboard() {
  const { user: authUser } = useSelector(x => x.auth);
  //const renderCounter = useRef(0);

  // only show when logged in
  if (!authUser) return null;

  return (
    <div className="content">
      <div className="dashboard-container">
        {/*<p>Rerenders: {renderCounter.current = renderCounter.current + 1}</p>*/}
        
        <UeInfo />
      </div>
    </div>
  );
}
