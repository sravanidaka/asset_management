import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Footer = () => {
  return (
    <footer className="bg-white text-dark py-3 mt-auto border-top" style={{ 
      width: '100vw', 
      marginLeft: 'calc(-50vw + 50%)',
      marginRight: 'calc(-50vw + 50%)',
      position: 'relative',
      left: 0,
      right: 0,
      marginBottom: 0,
      backgroundColor: '#ffffff'
    }}>
      <div className="container-fluid text-center" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <span style={{ color: '#495057' }}>
          &copy; {new Date().getFullYear()} Asset Management System. All rights reserved.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
