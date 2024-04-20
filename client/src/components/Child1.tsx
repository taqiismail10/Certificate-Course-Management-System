import React from 'react';
import { useLocation, useParams } from 'react-router-dom';

interface RouteParams {
    studentid: string;
}

interface LocationState {
    studentName: string;
}

const Child1: React.FC = () => {
    const { studentid } = useParams<RouteParams>();
//     Type 'RouteParams' does not satisfy the constraint 'string | Record<string, string | undefined>'.
//   Type 'RouteParams' is not assignable to type 'Record<string, string | undefined>'.
//     Index signature for type 'string' is missing in type 'RouteParams'.ts(2344)
// Codeium: Explain Problem

// interface RouteParams
    const location = useLocation<LocationState>();
    //   Expected 0 type arguments, but got 1.ts(2558)
    // Codeium: Explain Problem

    // interface LocationState
    const { studentName } = location.state || { studentName: '' };

    return (
        <div>
            <h1>Child1 Component</h1>
            <p>Received studentid: {studentid}</p>
            <p>Received studentName: {studentName}</p>
        </div>
    );
};

export default Child1;