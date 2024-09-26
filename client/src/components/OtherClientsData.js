import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import Select from 'react-select'; 
import { Dialog, DialogContent, DialogActions, Button, TextField } from '@material-ui/core';

function numberToWords(num) {
  const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  
  if (num === 0) return "Zero Only";

  // Split the number into groups following the Indian numbering system
  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = Math.floor((num % 1000) / 100);
  const tensAndUnits = num % 100;

  let result = "";

  // Handle crores
  if (crore > 0) {
    result += convertGroupToWords(crore, units, teens, tens) + " Crore ";
  }

  // Handle lakhs
  if (lakh > 0) {
    result += convertGroupToWords(lakh, units, teens, tens) + " Lakh ";
  }

  // Handle thousands
  if (thousand > 0) {
    result += convertGroupToWords(thousand, units, teens, tens) + " Thousand ";
  }

  // Handle hundreds
  if (hundred > 0) {
    result += units[hundred] + " Hundred ";
  }

  // Handle tens and units
  if (tensAndUnits > 0) {
    if (tensAndUnits < 10) {
      result += units[tensAndUnits] + " ";
    } else if (tensAndUnits < 20) {
      result += teens[tensAndUnits - 10] + " ";
    } else {
      const tensValue = Math.floor(tensAndUnits / 10);
      const unitsValue = tensAndUnits % 10;
      result += tens[tensValue] + " " + units[unitsValue] + " ";
    }
  }

  return result.trim() + " Only";
}

// Helper function to convert groups to words (for crores, lakhs, and thousands)
function convertGroupToWords(group, units, teens, tens) {
  if (group === 0) return "";

  let groupWord = "";
  if (group < 10) {
    groupWord += units[group];
  } else if (group < 20) {
    groupWord += teens[group - 10];
  } else {
    const tensValue = Math.floor(group / 10);
    const unitsValue = group % 10;
    groupWord += tens[tensValue] + " " + units[unitsValue];
  }

  return groupWord.trim();
}

function OtherClientsData() {
  const [data, setData] = useState([]);
  const [options, setOptions] = useState([]);
  const [clientId, setClientId] = useState(null); // Updated to use client ID
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [open, setOpen] = useState(false);
  const [cgstRate, setCgstRate] = useState(0.09);
  const [sgstRate, setSgstRate] = useState(0.09);
  const [fuelExpense, setFuelExpense] = useState(0);
  const [billNo, setBillNo] = useState(''); // Create state for Bill No
  const [period, setPeriod] = useState(''); // State to store the PERIOD text
  
  useEffect(() => {
    axios.get('http://localhost:5000/api/getClientOptions')
      .then((response) => {
        console.log('Client options response:', response.data); 
        setOptions(response.data.map(client => ({ label: client.name, value: client.id })));
      })
      .catch((error) => {
        console.error('Error fetching client options:', error);
      });
  }, []);

  const fetchFilteredData = (filters) => {
    axios.post('http://localhost:5000/api/getFilteredData', filters)
    .then((response) => {
      console.log('Filtered data response:', response.data); 
      setData(response.data);
    })
    .catch((error) => {
      console.error('Error fetching filtered data:', error);
    });
  };

  const handleDateRange = (range) => {
    if (!clientId || !month || !year) {
      alert('Please select a client, month, and year.');
      return;
    }

    const start = new Date(year, month - 1, range === '1-15' ? 1 : 16);
    const end = new Date(year, month - 1, range === '1-15' ? 15 : new Date(year, month, 0).getDate());

    fetchFilteredData({
      clientId,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    });

    // Set the period text when a date range button is clicked
    const monthNames = [
      'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 
      'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
    ];

    const selectedMonth = monthNames[month - 1]; // Convert the month number to name

    const periodText = `${selectedMonth}${year}-${range === '1-15'?'1':'2'}`;
    setPeriod(periodText);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!clientId || !startDate || !endDate) {
      alert('Please select a client and date range.');
      return;
    }

    fetchFilteredData({
      clientId,
      startDate,
      endDate
    });
  };

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handlePrint = () => window.print();
  const handleDownloadPDF = () => {
    // Handle PDF download logic
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB');
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    let years = [];
    for (let i = 0; i < 100; i++) {
      years.push(currentYear + i);
    }
    return years.map(year => <option key={year} value={year}>{year}</option>);
  };

  // Calculate totals
  const totalRSPS = useMemo(() => {
    return data.reduce((total, row) => total + parseFloat(row.RS_PS || 0), 0);
}, [data]);

const superTotal = totalRSPS + (totalRSPS * fuelExpense);
const grandTotal = superTotal + (superTotal * cgstRate) + (superTotal * sgstRate);
const CGST = superTotal * cgstRate;
const SGST = superTotal * sgstRate;
const FUEL = totalRSPS * fuelExpense;



const handleClientSelection = (selectedOption) => {
  const selectedClientId = selectedOption?.value;
  setClientId(selectedClientId);

  // Fetch client details if a client is selected
  if (selectedClientId) {
      axios.post('http://localhost:5000/api/getClientDetails', { clientId: selectedClientId })
          .then((response) => {
              const { client_name, Address, GST_no } = response.data;
              
              // Set client details in the state
              setClientDetails({
                  name: client_name,
                  address: Address,
                  gst: GST_no
              });
          })
          .catch((error) => {
              console.error('Error fetching client details:', error);
          });
  }
};

// Example state to hold client details
const [clientDetails, setClientDetails] = useState({
  name: '',
  address: '',
  gst: ''
});

  

const grandTotalInWords = numberToWords(Math.floor(grandTotal));


  return (
    <div className="main-content">
      <div className="filter">
        <h2>Report Filter</h2>
        <Select
          options={options}
          label="Select client name"
          onChange={handleClientSelection}
        />
        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          <option value="">Select Month</option>
          <option value="01">January</option>
          <option value="02">February</option>
          <option value="03">March</option>
          <option value="04">April</option>
          <option value="05">May</option>
          <option value="06">June</option>
          <option value="07">July</option>
          <option value="08">August</option>
          <option value="09">September</option>
          <option value="10">October</option>
          <option value="11">November</option>
          <option value="12">December</option>
        </select>

        <select value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="">Select Year</option>
          {generateYearOptions()}
        </select>

        <button onClick={() => handleDateRange('1-15')}>1 to 15 days</button>
        <button onClick={() => handleDateRange('16-31')}>16 to 31 days</button>
      </div>
      <div className='filter'>
        <div className="filter2">
          <form onSubmit={handleSubmit}>
            <h2>Report Filter</h2>
            <Select
              options={options}
              label="Select client name"
              onChange={handleClientSelection}
              />
            <label>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <label>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <button type="submit">Get Data</button>
          </form>
        </div>
      </div>
      <div style={{ marginTop: "40px" }} className="table">
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Date</th>
              <th>Cannote_No</th>
              <th>Destination</th>
              <th>Weight</th>
              <th>RS_PS</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
                <tr key={index}>
                <td>{index + 1}</td>
                <td>{formatDate(item.Date)}</td>
                <td>{item.Cannote_No}</td>
                <td>{item.Destination}</td>
                <td>{Math.floor(item.Weight)}</td>
                <td>{Math.floor(item.RS_PS)}</td>
                </tr>
                ))}
            </tbody>

        </table>
      </div>

      <button onClick={handleClickOpen} className='Exported'>
        Show Exported Data
      </button>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
        <DialogContent>
          <div className='exportData' style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h1 style={{ fontSize: '24px' }}>
                <span style={{ color: 'orange' }}>FRANCH</span><span style={{ color: 'blue' }}>EXPRESS</span>
              </h1>
              <p>SENTHUR AGENCIES</p>
              <p>96/114, SAMPATH MILL, THENNAMPALAYAM ROAD, ANNUR-641653</p>
              <p>CELL: 9042088099, 9942788520</p>
              <p>PAN No: BNKPS4314M, GSTIN: 33BNKPS4314M1ZO</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
              <p><strong>TO:</strong></p>
              <h3>Client Name: {clientDetails.name}</h3>
               <p>Address: {clientDetails.address}</p>
               <p>GST No: {clientDetails.gst}</p>
              </div>
              <div>
              <p>Date: {new Date(Date.now()).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                })}
              </p>                 
              <p><strong>Bill No:</strong>{billNo}</p>
              <p className="print-hidden"><input style={{padding:"6px",fontSize:"15px",color:"red"}} 
               type='number'
                placeholder='Enter the Bill No'
                value={billNo}
                onChange={(e) => setBillNo(e.target.value)}
                ></input></p>
              <p><strong>PERIOD:</strong>{period}</p>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Date</th>
                  <th>Cannote_No</th>
                  <th>Destination</th>
                  <th>Weight</th>
                  <th>RS_PS</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{formatDate(item.Date)}</td>
                    <td>{item.Cannote_No}</td>
                    <td>{item.Destination}</td>
                    <td>{Math.floor(item.Weight)}</td>
                    <td>{Math.floor(item.RS_PS)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div>
            <div style={{ marginTop: '20px', textAlign: 'right',}}>
            <p><strong>TOTAL: </strong>{Math.floor(totalRSPS.toFixed(2))}</p>
            <p><strong>FUEL EXPENSE {fuelExpense * 100}%: </strong>{Math.floor(FUEL.toFixed(2))}</p>
            <p className='supertotal'><strong>SUPER TOTAL: </strong>{Math.floor(superTotal.toFixed(2))}</p>
            <p><strong>CGST {cgstRate * 100}%: </strong>{Math.floor(CGST.toFixed(2))}</p>
            <p><strong>SGST {sgstRate * 100}%: </strong>{Math.floor(SGST.toFixed(2))}</p>
            <p><strong>GRAND TOTAL: </strong>{Math.floor(grandTotal.toFixed(2))}</p>
            <p style={{color:"black",fontSize:"20px"}}>{grandTotalInWords}</p>
          </div>
            <div style={{ marginTop: '10px', textAlign:"center"}}>
              <p>Issues cheque's or dd's SENTHUR AGENCIES, BANK OF BARODA, ANNUR br.</p>
              <p>ACC NO: 55060200000292, IFSC: BARB0ANNURX.</p>
              <p>FOR SENTHUR AGENCIES</p>
              <p style={{ textAlign: 'right' }}>PROPRIETOR</p>
            </div>
            </div>
            <div className="print-hidden" style={{ marginTop: '40px' }}>
            <TextField
              label="Fuel Expense (%)"
              type="number"
              variant="outlined"
              value={fuelExpense * 100}
              onChange={(e) => setFuelExpense(e.target.value / 100)}
              tyle={{ marginRight: '10px', width: '200px', marginLeft: '40px' }}
              />
              <TextField
                label="CGST Rate (%)"
                type="number"
                variant="outlined"
                value={cgstRate * 100}
                onChange={(e) => setCgstRate(e.target.value / 100)}
                style={{ marginRight: '10px', width: '200px', marginLeft: '40px' }}
              />
              <TextField
                label="SGST Rate (%)"
                type="number"
                variant="outlined"
                value={sgstRate * 100}
                onChange={(e) => setSgstRate(e.target.value / 100)}
                style={{ marginRight: '10px', width: '200px', marginLeft: '40px' }}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions className="print-hidden">
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
          <Button onClick={handlePrint} color="primary" className='my'>
            Print
          </Button>
          <Button onClick={handleDownloadPDF} variant="contained" color="secondary">
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>
      <style>
        {`
          @media print {
            @page {
              size: A4 portrait;
              scale: 100;
            }
            body {
              margin: none;
            }
            table {
              width: 100%;
              margin: 0;
              border-collapse: collapse;
              marginTop: 10px;
            }
            th, td {
              border: 1px solid black;
              padding: 5px;
              font-size: 12px;
              word-wrap: break-word;
            }
            .print-hidden {
              display: none;
            }
          }
        `}
      </style>
    </div>
  );
}

export default OtherClientsData;
// import React, { useEffect, useState, useMemo } from 'react';
// import axios from 'axios';
// import Select from 'react-select'; 
// import { Dialog, DialogContent, DialogActions, Button, TextField } from '@material-ui/core';

// function OtherClientsData() {
//   const [data, setData] = useState([]);
//   const [options, setOptions] = useState([]);
//   const [clientId, setClientId] = useState(null); // Updated to use client ID
//   const [month, setMonth] = useState('');
//   const [year, setYear] = useState('');
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');
//   const [open, setOpen] = useState(false);
//   const [cgstRate, setCgstRate] = useState(0.09);
//   const [sgstRate, setSgstRate] = useState(0.09);
//   const [fuelExpense, setFuelExpense] = useState(0);
//   const [clientDetails, setClientDetails] = useState({
//     clientName: '',
//     clientAddress: '',
//     gstNumber: '',
//   });

//   useEffect(() => {
//     axios.get('http://localhost:5000/api/getClientOptions')
//       .then((response) => {
//         setOptions(response.data.map(client => ({ label: client.name, value: client.id })));
//       })
//       .catch((error) => {
//         console.error('Error fetching client options:', error);
//       });
//   }, []);

//   const fetchFilteredData = (filters) => {
//     axios.post('http://localhost:5000/api/getFilteredData', filters)
//       .then((response) => {
//         setData(response.data);
//       })
//       .catch((error) => {
//         console.error('Error fetching filtered data:', error);
//       });
//   };

//   const handleDateRange = (range) => {
//     if (!clientId || !month || !year) {
//       alert('Please select a client, month, and year.');
//       return;
//     }

//     const start = new Date(year, month - 1, range === '1-15' ? 1 : 16);
//     const end = new Date(year, month - 1, range === '1-15' ? 15 : new Date(year, month, 0).getDate());

//     fetchFilteredData({
//       clientId, // Use client ID for filtering
//       startDate: start.toISOString().split('T')[0],
//       endDate: end.toISOString().split('T')[0]
//     });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     if (!clientId || !startDate || !endDate) {
//       alert('Please select a client and date range.');
//       return;
//     }

//     fetchFilteredData({
//       clientId, // Use client ID for filtering
//       startDate,
//       endDate
//     });
//   };

//   const handleClickOpen = () => setOpen(true);
//   const handleClose = () => setOpen(false);
//   const handlePrint = () => window.print();
//   const handleDownloadPDF = () => {
//     // Handle PDF download logic
//   };

//   const formatDate = (dateStr) => {
//     const date = new Date(dateStr);
//     return date.toLocaleDateString('en-GB');
//   };

//   const generateYearOptions = () => {
//     const currentYear = new Date().getFullYear();
//     let years = [];
//     for (let i = 0; i < 100; i++) {
//       years.push(currentYear + i);
//     }
//     return years.map(year => <option key={year} value={year}>{year}</option>);
//   };

//   // Calculate totals
//   const totalRSPS = useMemo(() => {
//     return data.reduce((total, row) => total + parseFloat(row.RS_PS || 0), 0);
//   }, [data]);

//   const superTotal = totalRSPS + (totalRSPS * fuelExpense);
//   const grandTotal = superTotal + (superTotal * cgstRate) + (superTotal * sgstRate);
//   const CGST = superTotal * cgstRate;
//   const SGST = superTotal * sgstRate;
//   const FUEL = totalRSPS * fuelExpense;

//   const handleClientSelection = (selectedOption) => {
//     const selectedClientId = selectedOption?.value;
//     setClientId(selectedClientId); // Save client ID

//     if (selectedClientId) {
//       axios.post('http://localhost:5000/api/getClientDetails', { clientId: selectedClientId })
//         .then((response) => {
//           const { client_name, client_address, gst_number } = response.data;
//           setClientDetails({
//             clientName: client_name,
//             clientAddress: client_address,
//             gstNumber: gst_number,
//           });
//         })
//         .catch((error) => {
//           console.error('Error fetching client details:', error);
//         });
//     }
//   };

//   return (
//     <div className="main-content">
//       <div className="filter">
//         <h2>Report Filter</h2>
//         <Select
//           options={options}
//           label="Select client name"
//           onChange={handleClientSelection}
//         />
//         <select value={month} onChange={(e) => setMonth(e.target.value)}>
//           <option value="">Select Month</option>
//           <option value="01">January</option>
//           <option value="02">February</option>
//           <option value="03">March</option>
//           <option value="04">April</option>
//           <option value="05">May</option>
//           <option value="06">June</option>
//           <option value="07">July</option>
//           <option value="08">August</option>
//           <option value="09">September</option>
//           <option value="10">October</option>
//           <option value="11">November</option>
//           <option value="12">December</option>
//         </select>

//         <select value={year} onChange={(e) => setYear(e.target.value)}>
//           <option value="">Select Year</option>
//           {generateYearOptions()}
//         </select>

//         <button onClick={() => handleDateRange('1-15')}>1 to 15 days</button>
//         <button onClick={() => handleDateRange('16-31')}>16 to 31 days</button>
//       </div>
//       <div className='filter'>
//         <div className="filter2">
//           <form onSubmit={handleSubmit}>
//             <h2>Report Filter</h2>
//             <Select
//               options={options}
//               label="Select client name"
//               onChange={handleClientSelection}
//             />
//             <label>Start Date</label>
//             <input
//               type="date"
//               value={startDate}
//               onChange={(e) => setStartDate(e.target.value)}
//             />
//             <label>End Date</label>
//             <input
//               type="date"
//               value={endDate}
//               onChange={(e) => setEndDate(e.target.value)}
//             />
//             <button type="submit">Get Data</button>
//           </form>
//         </div>
//       </div>
//       <div style={{ marginTop: "40px" }} className="table">
//         <table>
//           <thead>
//             <tr>
//               <th>S.No</th>
//               <th>Date</th>
//               <th>Cannote_No</th>
//               <th>Destination</th>
//               <th>Weight</th>
//               <th>RS_PS</th>
//             </tr>
//           </thead>
//           <tbody>
//             {data.map((item, index) => (
//               <tr key={index}>
//                 <td>{index + 1}</td>
//                 <td>{formatDate(item.Date)}</td>
//                 <td>{item.Cannote_No}</td>
//                 <td>{item.Destination}</td>
//                 <td>{Math.floor(item.Weight)}</td>
//                 <td>{item.RS_PS}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       <button onClick={handleClickOpen} className='Exported'>
//         Show Exported Data
//       </button>
//       <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
//         <DialogContent>
//          <div className='exportData' style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
//            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
//               <h1 style={{ fontSize: '24px' }}>
//                <span style={{ color: 'orange' }}>FRANCH</span><span style={{ color: 'blue' }}>EXPRESS</span>
//             </h1>
//                <p>SENTHUR AGENCIES</p>
//              <p>96/114, SAMPATH MILL, THENNAMPALAYAM ROAD, ANNUR-641653</p>
//                <p>CELL: 9042088099, 9942788520</p>
//               <p>PAN No: BNKPS4314M, GSTIN: 33BNKPS4314M1ZO</p>
//              </div>

//              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
//                <div>
//                <p><strong>TO:</strong></p>
//                <p>M/s. {clientDetails.clientName}</p>
//                <p>{clientDetails.clientAddress}</p>              <p>GSTIN: {clientDetails.gstNumber}</p>
// /              </div>
//                <div>
//                  <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
//                  <p><strong>Bill No:</strong> 12345</p>
//                </div>
//              </div>

//              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//                <thead>
//                  <tr>
//                    <th>S.No</th>
//                    <th>Date</th>
// /                  <th>Cannote_No</th>
// /                  <th>Destination</th>
// /                  <th>Weight</th>
//                  <th>RS_PS</th>
//                 </tr>
//                </thead>
//               <tbody>
//                  {data.map((item, index) => (
//                   <tr key={index}>
//                     <td>{index + 1}</td>
//                     <td>{formatDate(item.Date)}</td>
//                     <td>{item.Cannote_No}</td>
//                     <td>{item.Destination}</td>
//                     <td>{Math.floor(item.Weight)}</td>
//                     <td>{item.RS_PS}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           <div style={{ marginTop: '20px', textAlign: 'right' }}>
//             <p><strong>TOTAL: </strong>{totalRSPS.toFixed(2)}</p>
//             <p><strong>FUEL EXPENSE {fuelExpense * 100}%: </strong>{FUEL.toFixed(2)}</p>
//             <p className='supertotal'><strong>SUPER TOTAL: </strong>{superTotal.toFixed(2)}</p>
//             <p><strong>CGST {cgstRate * 100}%: </strong>{CGST.toFixed(2)}</p>
//             <p><strong>SGST {sgstRate * 100}%: </strong>{SGST.toFixed(2)}</p>
//             <p><strong>GRAND TOTAL: </strong>{grandTotal.toFixed(2)}</p>
//           </div>
//             <div style={{ marginTop: '20px' }}>
//               <p>Issues cheque's or dd's SENTHUR AGENCIES, BANK OF BARODA, ANNUR br.</p>
//               <p>ACC NO: 55060200000292, IFSC: BARB0ANNURX.</p>
//               <p>FOR SENTHUR AGENCIES</p>
//               <p style={{ textAlign: 'right' }}>PROPRIETOR</p>
//             </div>

//             <div className="print-hidden" style={{ marginTop: '20px' }}>
//             <TextField
//               label="Fuel Expense (%)"
//               type="number"
//               variant="outlined"
//               value={fuelExpense * 100}
//               onChange={(e) => setFuelExpense(e.target.value / 100)}
//               tyle={{ marginRight: '10px', width: '200px', marginLeft: '40px' }}
//               />
//               <TextField
//                 label="CGST Rate (%)"
//                 type="number"
//                 variant="outlined"
//                 value={cgstRate * 100}
//                 onChange={(e) => setCgstRate(e.target.value / 100)}
//                 style={{ marginRight: '10px', width: '200px', marginLeft: '40px' }}
//               />
//               <TextField
//                 label="SGST Rate (%)"
//                 type="number"
//                 variant="outlined"
//                 value={sgstRate * 100}
//                 onChange={(e) => setSgstRate(e.target.value / 100)}
//                 style={{ marginRight: '10px', width: '200px', marginLeft: '40px' }}
//               />
//             </div>
//           </div>
//         </DialogContent>
//         <DialogActions className="print-hidden">
//           <Button onClick={handleClose} color="primary">
//             Close
//           </Button>
//           <Button onClick={handlePrint} color="primary" className='my'>
//             Print
//           </Button>
//           <Button onClick={handleDownloadPDF} variant="contained" color="secondary">
//             Download PDF
//           </Button>
//         </DialogActions>
//       </Dialog>
//       <style>
//         {`
//           @media print {
//             @page {
//               size: A4 portrait;
//               scale: 100;
//             }
//             body {
//               margin: none;
//             }
//             table {
//               width: 100%;
//               margin: 0;
//               border-collapse: collapse;
//               marginTop: 10px;
//             }
//             th, td {
//               border: 1px solid black;
//               padding: 5px;
//               font-size: 12px;
//               word-wrap: break-word;
//             }
//             .print-hidden {
//               display: none;
//             }
//           }
//         `}
//       </style>
//     </div>
//   );
// }

// export default OtherClientsData;