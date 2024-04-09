import React from 'react';
import { Route, redirect, RouteProps } from 'react-router-dom';

interface PrivateRouteProps extends RouteProps {
    isAuthenticated: boolean;
    authenticationPath: string;
    component: React.ComponentType<any>; // Add this line if you intend to use the 'component' property
}


const PrivateRoute: React.FC<PrivateRouteProps> = ({
  isAuthenticated,
  authenticationPath,
  component: Component,
  ...rest
}) => {
  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: authenticationPath,
              state: { from: props.location }
            }}
          />
        )
      }
    />
  );
};

export default PrivateRoute;
