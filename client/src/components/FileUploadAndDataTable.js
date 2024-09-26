import React, { useState, useCallback, useEffect } from 'react';
import DataTable from './DataTable';

const FileUploadAndDataTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('token'); // Retrieve the token

    if (!token) {
      console.error('No token found, please log in.');
      setLoading(false);
      return; // Prevent further execution
    }

    try {
      const response = await fetch('http://localhost:5000/waybills', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // Include the token in the header
        },
      });

      if (response.status === 401) {
        alert('Unauthorized access. Please log in again.');
        // Optionally, redirect to login
        return;
      }

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="main-content">
      <div className='container'>
        <DataTable data={data} fetchData={fetchData} loading={loading} />
      </div>
      </div>
  );
};

export default FileUploadAndDataTable;
