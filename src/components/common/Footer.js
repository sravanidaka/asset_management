import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-3 mt-auto w-100">
      <div className="text-center">
        &copy; {new Date().getFullYear()} Asset Management System. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
