import React, { useState, useCallback, useEffect } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Slide, CircularProgress } from '@mui/material';
import axios from 'axios';
import FileUpload from './FileUpload';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return format(date, 'yyyy-MM-dd');
};

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} timeout={20} />
));

const sortByDate = (order) => (a, b) => {
  const dateA = new Date(a.order_date);
  const dateB = new Date(b.order_date);
  return order === 'asc' ? dateA - dateB : dateB - dateA;
};

const DataTable = () => {
  const [data, setData] = useState([]);
  const [editingData, setEditingData] = useState([]);
  const [deleting, setDeleting] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    setEditingData([...data].sort(sortByDate(sortOrder)));
  }, [data, sortOrder]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/waybills');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = useCallback((waybill_no) => {
    setDeleting(waybill_no);
    setOpenDeleteDialog(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    try {
      await fetch(`http://localhost:5000/waybills/${deleting}`, { method: 'DELETE' });
      setData(prevData => prevData.filter(item => item.waybill_no !== deleting));
      setOpenDeleteDialog(false);
      setDeleting(null);
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  }, [deleting]);

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDeleting(null);
  };

  const handleInputChange = (index, field, value) => {
    const newData = [...editingData];
    newData[index][field] = value;
    setEditingData(newData);
  };

  


  const handleSaveChanges = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all(editingData.map(item => 
        fetch(`http://localhost:5000/waybills/${item.waybill_no}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        })
      ));
      alert('Update successful');
      fetchData(); // Refresh the table data after update
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error updating data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [editingData, fetchData]);

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  
  const handleSave = async () => {
    const exportData = editingData.map((item, index) => ({
      S_No: index + 1,
      Date: formatDate(item.order_date),
      Order_ID: item.order_id,
      Cannote_No: item.waybill_no,
      Destination: item.destination_city,
      Weight: item.weight,
      RS_PS: item.amount,
    }));
  
    try {
      const response = await axios.post('http://localhost:5000/api/save-exported-data', { exportData });
  
      if (response.data.duplicates && response.data.duplicates.length > 0) {
        // Show an alert with duplicate Cannote Numbers
        alert(`Duplicate Cannote Numbers found: ${response.data.duplicates.join(', ')}`);
      } else if (response.data.message === 'Data saved successfully') {
        // If all data saved successfully, show success message
        window.alert('All data saved successfully.');
        setData([]); // Clear the data after saving
        fetchData(); // Refresh the table data
      }
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving data. Please try again.');
    }
  };
  
  return (
    <div className="datatable">
      <FileUpload onDataFetched={fetchData} />
      {loading ? (
        <CircularProgress />
      ) : (
        <div className="table-container">
          {editingData.length === 0 ? (
            <p className='error'>No data available</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th onClick={toggleSortOrder} style={{ cursor: 'pointer' }}>
                    Date {sortOrder === 'asc' ? '▲' : '▼'}
                  </th>
                  <th>Order_ID</th>
                  <th>Cannote_No</th>
                  <th>Destination City</th>
                  <th>Weight</th>
                  <th>RS/PS</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {editingData.map((row, index) => (
                  <tr key={row.waybill_no}>
                    <td>{index + 1}</td>
                    <td>
                      <input
                        type="date"
                        value={formatDate(row.order_date)}
                        onChange={(e) => handleInputChange(index, 'order_date', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.order_id}
                        onChange={(e) => handleInputChange(index, 'order_id', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.waybill_no}
                        onChange={(e) => handleInputChange(index, 'waybill_no', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.destination_city}
                        onChange={(e) => handleInputChange(index, 'destination_city', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={Math.floor(row.weight)}
                        onChange={(e) => handleInputChange(index, 'weight', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={Math.floor(row.amount)}
                        onChange={(e) => handleInputChange(index, 'amount', e.target.value)}
                      />
                    </td>
                    <td>
                      <button onClick={() => handleDelete(row.waybill_no)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      <button onClick={handleSave}>Save Data</button>
      <button onClick={handleSaveChanges}>Update</button>
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog} TransitionComponent={Transition}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to delete this record?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={confirmDelete} color="secondary">Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DataTable;