import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Child1 from './Child1';

const Parent = () => {
  const [studentid, setStudentid] = useState('12345'); // example studentid
  const [studentName, setStudentName] = useState('John Doe'); // example studentName

  return (
    <div>
      <Link 
        to={{
          pathname: `/child1/${studentid}`,
          state: { studentName }
        }}
      >
        Go to Child1
      </Link>
      {/* Or you can use button and useHistory from react-router-dom to navigate */}
      {/* <button onClick={() => history.push(`/child1/${studentid}`)}>Go to Child1</button> */}
    </div>
  );
};

export default Parent;