import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OtherClientsTables = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [rows, setRows] = useState([
    { 
      S_No: 1, 
      Date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      Cannote_No: '', 
      Destination: '', 
      Weight: '', 
      RS_PS: '' 
    },
  ]);
  const [scannedCode, setScannedCode] = useState(''); // Store barcode scan value
  const [clientDetails, setClientDetails] = useState({ 
    client_name: '',
    Address: '',
    GST_no: ''
  });
  const [showUpdateWarning, setShowUpdateWarning] = useState(false);
  const [rowToUpdate, setRowToUpdate] = useState(null);

  // Fetch clients when component mounts
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/clients/');
        setClients(response.data);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };

    fetchClients();
  }, []);

  const handleClientChange = async (event) => {
    const clientId = event.target.value;
    setSelectedClient(clientId);

    if (clientId) {
      try {
        const response = await axios.get(`http://localhost:5000/api/clients/${clientId}`);
        setClientDetails(response.data);
      } catch (error) {
        console.error('Error fetching client details:', error);
      }
    } else {
      setClientDetails({
        client_name: '',
        Address: '',
        GST_no: ''
      });
    }
  };

  const handleDestinationChange = async (index, value) => {
    const newRows = [...rows];
    newRows[index].Destination = value;
  
    if (!selectedClient) {
      newRows[index].RS_PS = 'Select a client';
      setRows(newRows);
      return;
    }
  
    try {
      const regionResponse = await axios.get('http://localhost:5000/weights/region', {
        params: { destination_city: value },
      });
  
      const region = regionResponse.data.region;
  
      if (!region) {
        newRows[index].RS_PS = 'Region not found';
        setRows(newRows);
        return;
      }
  
      // Now include the region in the rate fetch
      const rateResponse = await axios.get(`http://localhost:5000/api/other/rate/${selectedClient}`, {
        params: { region }, // Add region here
      });
  
      const rateData = rateResponse.data[0];
  
      if (!rateData) {
        newRows[index].RS_PS = 'Rates not found';
        setRows(newRows);
        return;
      }
  
      const amount250 = parseFloat(rateData.amount250) || 0;
      const amount1000 = parseFloat(rateData.amount1000) || 0;
  
      // Calculate RS_PS as before
      const weight = parseFloat(newRows[index].Weight);
      let RS_PS = 'N/A';
  
      if (!isNaN(weight)) {
        if (weight > 0 && weight <= 250) {
          RS_PS = amount250.toFixed(2);
        } else if (weight > 250) {
          RS_PS = (Math.ceil(weight / 1000) * amount1000).toFixed(2);
        }
      }
  
      newRows[index].RS_PS = RS_PS;
    } catch (error) {
      console.error('Error fetching region or rate:', error.response?.data || error.message);
      newRows[index].RS_PS = 'N/A';
    }
  
    setRows(newRows);
  };
  
  const handleInputChange = (index, field, value) => {
    const newRows = [...rows];
  
    if (field === 'Date') {
      const dateParts = value.split('/');
      
      if (dateParts.length === 3) {
        const day = dateParts[1] ? dateParts[1].padStart(2, '0') : '';
        const month = dateParts[0] ? dateParts[0].padStart(2, '0') : '';
        const year = dateParts[2] ? dateParts[2] : '';
  
        if (day && month && year) {
          const formattedDate = `${year}-${month}-${day}`;
          newRows[index][field] = formattedDate;
        }
      }
    } else {
      newRows[index][field] = value;
    }
  
    if (field === 'Destination' || field === 'Weight') {
      handleDestinationChange(index, newRows[index].Destination);
    }
  
    setRows(newRows);
  };

  const addRows = () => {
    const currentCount = rows.length;
    const newRows = Array(1).fill().map((_, index) => ({
      S_No: currentCount + index + 1,
      Date: new Date().toLocaleDateString(),
      Cannote_No: '',
      Destination: '',
      Weight: '',
      RS_PS: '',
    }));
    setRows([...rows, ...newRows]);
  };

  const checkForExistingCannoteNo = async (cannoteNo) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/invoice_items/checkCannote/${cannoteNo}`);
      return response.data.exists;
    } catch (error) {
      console.error('Error checking Cannote No:', error);
      return false;
    }
  };

  const handleSave = async () => {
    for (const row of rows) {
      const exists = await checkForExistingCannoteNo(row.Cannote_No);
      if (exists) {
        setRowToUpdate(row); // Set the row to update
        setShowUpdateWarning(true); // Show the update warning
        return;
      }
    }

    // Save logic if no conflicts
    saveData();
  };

const saveData = async () => {
  const formattedRows = rows.map(row => ({
    ...row,
    Date: new Date(row.Date).toISOString().split('T')[0], // Format to YYYY-MM-DD
  }));

  const saveData = {
    clientId: selectedClient,
    clientName: clientDetails.client_name,
    clientAddress: clientDetails.Address,
    gstNumber: clientDetails.GST_no,
    tableData: formattedRows,
  };

  try {
    const response = await axios.post('http://localhost:5000/api/saveData', saveData);

    if (response.status === 200) {
      const { insertedRecords = [], duplicateRecords = [] } = response.data;

      // Ensure there's always some content in the alert
      let message = '';

      if (insertedRecords.length > 0) {
        message += `Inserted Records:\n${insertedRecords.map((row, i) => `S.No: ${row.S_No}, Cannote No: ${row.Cannote_No}`).join('\n')}\n\n`;
      }

      if (duplicateRecords.length > 0) {
        message += `Duplicate Records (Not Inserted):\n${duplicateRecords.map((row, i) => `S.No: ${row.S_No}, Cannote No: ${row.Cannote_No}`).join('\n')}`;
      }

      if (!message) {
        message = 'Data saved successfully';
      }

      alert(message);

      // Reset form only if there are no duplicate records
      if (duplicateRecords.length === 0) {
        setSelectedClient('');
        setClientDetails({ client_name: '', Address: '', GST_no: '' });
        setRows([{ S_No: 1, Date: new Date().toISOString().split('T')[0], Cannote_No: '', Destination: '', Weight: '', RS_PS: '' }]);
      }
    } else {
      alert('Failed to save data');
    }
  } catch (error) {
    console.error('Error saving data:', error);
    alert('Error saving data');
  }
};

  

  const handleUpdate = async () => {
    // Logic to update the row if Cannote_No already exists
    const updatedRows = rows.map((row) => {
      if (row.Cannote_No === rowToUpdate.Cannote_No) {
        return rowToUpdate; // Update with new data
      }
      return row;
    });

    setRows(updatedRows);
    setShowUpdateWarning(false); // Hide update warning
    saveData(); // Proceed with save after update
  };

  const handleCancelUpdate = () => {
    setShowUpdateWarning(false); // Hide update warning without saving
    setRowToUpdate(null);
  };

  // Capture barcode scanning
  useEffect(() => {
    const handleBarcodeScan = (event) => {
      if (event.key === 'Enter') {
        const newRows = [...rows];
        newRows[rows.length - 1].Cannote_No = scannedCode;
        setRows(newRows);
        setScannedCode(''); // Clear the scanned code
      } else {
        setScannedCode((prev) => prev + event.key); // Append characters to the scanned code
      }
    };
  
    window.addEventListener('keydown', handleBarcodeScan);
    return () => {
      window.removeEventListener('keydown', handleBarcodeScan);
    };
  }, [scannedCode, rows]);

  return (
    <div className='main-content'>
      {showUpdateWarning && (
        <div className='update-warning'>
          <p>Cannote No already exists. Do you want to update the existing record?</p>
          <button onClick={handleUpdate}>Update</button>
          <button onClick={handleCancelUpdate}>Cancel</button>
        </div>
      )}

      <div className='selectedclient'>
        <div className='select'>
          <label>Select Client: </label>
          <select value={selectedClient} onChange={handleClientChange}>
            <option value="">-- Select a Client --</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.client_name}
              </option>
            ))}
          </select>
        </div>

         <div className='table'>
          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Date</th>
                <th>Cannote No</th>
                <th>Destination</th>
                <th>Weight</th>
                <th>RS/PS</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  <td>
                    <input 
                      type='text' 
                      value={row.S_No} 
                      onChange={(e) => handleInputChange(index, 'S_No', e.target.value)} 
                      disabled
                    />
                  </td>
                  <td>
                    <input 
                      type='text' 
                      value={row.Date} 
                      onChange={(e) => handleInputChange(index, 'Date', e.target.value)} 
                      placeholder="MM/DD/YYYY"
                    />
                  </td>
                  <td>
                    <input 
                      type='text' 
                      value={row.Cannote_No} 
                      onChange={(e) => handleInputChange(index, 'Cannote_No', e.target.value)} 
                    />
                  </td>
                  <td>
                    <input 
                      type='text' 
                      value={row.Destination} 
                      onChange={(e) => handleInputChange(index, 'Destination', e.target.value)} 
                    />
                  </td>
                  <td>
                    <input 
                      type='number' 
                      value={row.Weight} 
                      onChange={(e) => handleInputChange(index, 'Weight', e.target.value)} 
                    />
                  </td>
                  <td>
                    <input 
                      type='text' 
                      value={row.RS_PS} 
                      disabled 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button onClick={addRows}>Add Row</button>
        <button onClick={handleSave}>Save</button>
      </div>
    </div>
  );
};

export default OtherClientsTables;