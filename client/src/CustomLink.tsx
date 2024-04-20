import React from "react";
import { Link } from "react-router-dom";

interface CustomLinkProps {
  to: string;
  state?: {
    studentId: string;
  };
  style?: React.CSSProperties;
}

const CustomLink: React.FC<CustomLinkProps> = ({
  to,
  state,
  style,
  children,
}) => {
  return (
    <Link
      to={{
        pathname: to,
        state: state,
      }}
      style={style}
    >
      {children}
    </Link>
  );
};

export default CustomLink;
