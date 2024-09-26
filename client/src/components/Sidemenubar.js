import React, { useState, useEffect } from 'react';
import { Nav } from 'react-bootstrap';
import Logo from '../image/logo.png';
import { FaCalculator, FaFileInvoiceDollar, FaUserFriends ,  FaGlobeAmericas} from "react-icons/fa";
import { MdFilterList } from "react-icons/md";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LuLogOut } from "react-icons/lu";

function Sidemenubar() {
  const [activeLink, setActiveLink] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location]);

  const token = localStorage.getItem('token');

  if (!token || location.pathname === '/login') {
    return null; // Don't show sidebar on login page
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div>
      <div className='header'>
        <img src={Logo} alt='logo' />
        <button onClick={handleLogout}><LuLogOut /> Logout</button>
      </div>
      <div className="side-menu">
        <Nav className="flex-column">
          <Nav.Item>
            <Nav.Link
              as={Link}
              to="/Rate"
              className={activeLink === '/Rate' ? 'active' : ''}
              onClick={() => setActiveLink('/Rate')}
            >
              <FaCalculator />
              <span className="link-text">Calculation</span>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              as={Link}
              to="/Weight"
              className={activeLink === '/Weight' ? 'active' : ''}
              onClick={() => setActiveLink('/Weight')}
            >
              <FaGlobeAmericas />
              <span className="link-text">Region</span>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              as={Link}
              to="/FileUploadAndDataTable"
              className={activeLink === '/FileUploadAndDataTable' ? 'active' : ''}
              onClick={() => setActiveLink('/FileUploadAndDataTable')}
            >
              <FaFileInvoiceDollar />
              <span className="link-text">File Upload</span>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              as={Link}
              to="/ReportFilter"
              className={activeLink === '/ReportFilter' ? 'active' : ''}
              onClick={() => setActiveLink('/ReportFilter')}
            >
              <MdFilterList />
              <span className="link-text">Report And Filter</span>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              as={Link}
              to="/Otherclient"
              className={activeLink === '/Otherclient' ? 'active' : ''}
              onClick={() => setActiveLink('/Otherclient')}
            >
              <FaUserFriends   />
              <span className="link-text">Otherclient</span>
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </div>
    </div>
  );
}

export default Sidemenubar;
