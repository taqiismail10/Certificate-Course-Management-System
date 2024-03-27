import React from "react";

const Hero: React.FC = () => {
  return (
    <div className="container mt-5"> {/* Add margin top */}
      <div className="row justify-content-center">
        <div className="col-md-6 text-center">
          <h1 style={{fontWeight:'bold', fontSize:'50px', color:'#005a5a'}}>Welcome to CCMS</h1>
          <p className="lead mt-3 mb-3" style={{color:'#005a5a'}}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Hero;
