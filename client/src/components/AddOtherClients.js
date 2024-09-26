import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddOtherClients = () => {
  const [clients, setClients] = useState([]);
  const [newClient, setNewClient] = useState({ client_name: '', Address: '', GST_no: '' });
  const [rates, setRates] = useState([
    { region: 'Tamil Nadu & Pondicherry', amount250: '', amount1000: '' },
    { region: 'Kerala & Karnataka', amount250: '', amount1000: '' },
    { region: 'Andhra Pradesh & Telangana', amount250: '', amount1000: '' },
    { region: 'North', amount250: '', amount1000: '' },
    { region: 'West', amount250: '', amount1000: '' },
    { region: 'East', amount250: '', amount1000: '' },
    { region: 'North East', amount250: '', amount1000: '' },
    { region: 'Special Location', amount250: '', amount1000: '' },
    { region: 'Coimbatore & Local', amount250: '', amount1000: '' },
  ]);
  const [selectedClientId, setSelectedClientId] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleInputChange = (e) => {
    setNewClient({ ...newClient, [e.target.name]: e.target.value });
  };

  const handleRateChange = (index, field, value) => {
    const updatedRates = rates.map((rate, i) =>
      i === index ? { ...rate, [field]: value } : rate
    );
    setRates(updatedRates);
  };

  const handleAddOrUpdateClient = async () => {
    try {
      if (selectedClientId) {
        // Updating existing client
        await axios.put(`http://localhost:5000/api/clients/${selectedClientId}`, newClient);

        // Delete existing rates and then re-add them
        await axios.delete(`http://localhost:5000/api/other/rate/${selectedClientId}`);
        for (const rate of rates) {
          await axios.post('http://localhost:5000/api/other/rate', {
            region: rate.region,
            amount250: rate.amount250,
            amount1000: rate.amount1000,
            client_id: selectedClientId,
          });
        }
      } else {
        // Adding a new client
        const clientResponse = await axios.post('http://localhost:5000/api/clients', newClient);
        const clientId = clientResponse.data.insertId;

        // Add rates for the newly created client
        for (const rate of rates) {
          await axios.post('http://localhost:5000/api/other/rate', {
            region: rate.region,
            amount250: rate.amount250,
            amount1000: rate.amount1000,
            client_id: clientId,
          });
        }
      }

      // Reset state after operation
      setNewClient({ client_name: '', Address: '', GST_no: '' });
      setRates(rates.map(rate => ({ ...rate, amount250: '', amount1000: '' })));
      setSelectedClientId(null);
      fetchClients();
    } catch (error) {
      console.error('Error adding/updating client:', error);
    }
  };

  const handleEditClient = (client) => {
    // Populate the form with current client details
    setNewClient({
      client_name: client.client_name,
      Address: client.Address,
      GST_no: client.GST_no,
    });
    setSelectedClientId(client.id);
    fetchClientRates(client.id); // Fetch associated rates for the selected client
  };

  const fetchClientRates = async (clientId) => {
    try {
      const updatedRates = await Promise.all(rates.map(async (rate) => {
        const response = await axios.get(`http://localhost:5000/api/other/rate/${clientId}`, {
          params: { region: rate.region } // Pass the region as a query parameter
        });
        const clientRate = response.data[0]; // Assuming the response is an array
        return clientRate
          ? { ...rate, amount250: clientRate.amount250, amount1000: clientRate.amount1000 }
          : { ...rate, amount250: '', amount1000: '' }; // Reset if not found
      }));
  
      setRates(updatedRates);
    } catch (error) {
      console.error('Error fetching rates:', error);
      // Optional: Reset rates on error
      setRates(rates.map(rate => ({ ...rate, amount250: '', amount1000: '' })));
    }
  };

  const handleDeleteClient = async (clientId) => {
    try {
      await axios.delete(`http://localhost:5000/api/clients/${clientId}`);
      fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  return (
    <div className='main-content'>
      <div className='addcliend'>
      <h2>{selectedClientId ? 'Edit Client' : 'Create Client'} and Assign Rates</h2>
      <div className='add'>
        <input
          type="text"
          name="client_name"
          placeholder="Client Name"
          value={newClient.client_name}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="Address"
          placeholder="Address"
          value={newClient.Address}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="GST_no"
          placeholder="GST No"
          value={newClient.GST_no}
          onChange={handleInputChange}
        />
      </div>

      <div className='rate'>
        <h3>Assign Rates for Regions</h3>
        {rates.map((rate, index) => (
          <div key={index}>
            <h4>{rate.region}</h4>
            <input
              type="number"
              placeholder="Amount for 250g"
              value={rate.amount250}
              onChange={(e) => handleRateChange(index, 'amount250', e.target.value)}
            />
            <input
              type="number"
              placeholder="Amount for 1000g"
              value={rate.amount1000}
              onChange={(e) => handleRateChange(index, 'amount1000', e.target.value)}
            />
          </div>
           
        ))}
        <button onClick={handleAddOrUpdateClient}>
           {selectedClientId ? 'Update Client' : 'Add Client'}
         </button>
      </div>
        <div className='list'>
      <h3>Clients List</h3>
      <ul>
        {clients.map(client => (
          <li key={client.id}>
            {client.client_name} - {client.Address} - {client.GST_no}
            <button onClick={() => handleEditClient(client)}>Edit</button>
            <button onClick={() => handleDeleteClient(client.id)}>Delete</button>
          </li>
        ))}
      </ul>
      </div>
    </div>
    </div>
  );
};

export default AddOtherClients;