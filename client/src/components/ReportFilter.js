import React, { useState, useMemo} from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Dialog, DialogContent, DialogActions, Button, TextField } from '@mui/material';

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
  
function ReportFilter() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [data, setData] = useState([]);
    const [open, setOpen] = useState(false);
    const [cgstRate, setCgstRate] = useState(0.09); // Define cgstRate state
    const [sgstRate, setSgstRate] = useState(0.09); // Define sgstRate state
    const [fuelExpense, setFuelExpense] = useState(0); // Define fuelExpense state
    const [period, setPeriod] = useState(''); // State to store the PERIOD text
    const [billNo, setBillNo] = useState('');

    const handleMonthChange = (e) => {
        setMonth(e.target.value);
    };

    const handleYearChange = (e) => {
        setYear(e.target.value);
    };


    const handleDateRange = (range) => {
        if (month && year) {
            let startDay, endDay;
            let periodSuffix = '';
    
            if (range === '1-15') {
                startDay = '01';
                endDay = '15';
                periodSuffix = '-1'; // For 1 to 15 days
            } else if (range === '16-31') {
                startDay = '16';
                endDay = '31';
                periodSuffix = '-2'; // For 16 to 31 days
            }
    
            const start = `${year}-${month}-${startDay}`;
            const end = `${year}-${month}-${endDay}`;
    
            // Get the selected month's name from the month state
            const monthNames = [      'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 
                'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
            const selectedMonthName = monthNames[parseInt(month) - 1];
            
            // Set the period text in the format "MONTHYEAR-1" or "MONTHYEAR-2"
            setPeriod(`${selectedMonthName}${year}${periodSuffix}`);
    
            // Fetch the data
            axios.get('http://localhost:5000/api/get-exported-data', { params: { startDate: start, endDate: end } })
                .then(response => {
                    console.log('Data fetched successfully:', response.data);
                    setData(response.data); // Update the data state
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        } else {
            alert('Please select both month and year');
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Fetch filtered data based on start and end dates
        try {
            const response = await fetch(`http://localhost:5000/api/get-exported-data?startDate=${startDate}&endDate=${endDate}`);
            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const generateYearOptions = () => {
        const options = [];
        for (let i = 2024; i <= 3000; i++) {
            options.push(<option key={i} value={i}>{i}</option>);
        }
        return options;
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = () => {
    const input = document.querySelector('.exportData');
    const printHiddenElements = document.querySelectorAll('.print-hidden');
    
    // Hide print-hidden elements
    printHiddenElements.forEach(element => {
        element.style.display = 'none';
    });
    
    html2canvas(input, { scale: 2 }).then((canvas) => {
        const pdf = new jsPDF('p', 'mm', 'a4'); // Use millimeters as unit for a4 page size
        const pageWidth = pdf.internal.pageSize.width;
        const pageHeight = pdf.internal.pageSize.height;
        const imgWidth = pageWidth - 20; // Set width with some margin
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const imgData = canvas.toDataURL('image/png');

        let heightLeft = imgHeight;
        let position = 0;

        // Add the first page
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Add more pages if necessary
        while (heightLeft > 0) {
            position -= pageHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save('data_table_with_styles.pdf');

        // Restore print-hidden elements
        printHiddenElements.forEach(element => {
            element.style.display = '';
        });
    });
};


    const totalRSPS = useMemo(() => {
        return data.reduce((total, row) => total + parseFloat(row.RS_PS || 0), 0);
    }, [data]);

    const superTotal = totalRSPS + (totalRSPS * fuelExpense);
    const grandTotal = superTotal + (superTotal * cgstRate) + (superTotal * sgstRate);
    const CGST = superTotal * cgstRate;
    const SGST = superTotal * sgstRate;
    const FUEL = totalRSPS * fuelExpense;
    

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };



    const grandTotalInWords = numberToWords(Math.floor(grandTotal));


    return (
        <div className="main-content">
            <div className="filter">
                <h2>Report Filter</h2>
                <select value={month} onChange={handleMonthChange}>
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

                <select value={year} onChange={handleYearChange}>
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
                            <th>Order_ID</th>
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
                                <td>{item.Order_ID}</td>
                                <td>{item.Cannote_No}</td>
                                <td>{item.Destination}</td>
                                <td>{Math.floor(item.Weight)}</td>
                                <td>{item.RS_PS}</td>
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
                                <p>M/s. PREETHI DESIGNERS</p>
                                <p>132/3-B, AM COLONY</p>
                                <p>VOC STREET, ANNUR-641653</p>
                                <p>GSTIN: 33GQDPPS510D1ZR</p>
                            </div>
                            <div>
                            <p>Date: {new Date(Date.now()).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    })}
                                </p>                                
                                <p><strong>BILL NO:</strong>{billNo}</p>
                                <p className="print-hidden"><input
                                value={billNo}
                                onChange={(e) => setBillNo(e.target.value)}
                                 style={{padding:"6px",fontSize:"15px",color:"red"}} 
                                 type='number' 
                                 placeholder='Enter the Bill No'></input></p>
                                <p><strong>PERIOD:</strong> {period}</p>
                                </div>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={{ border: '1px solid #000', padding: '8px' }}>S.No</th>
                                    <th style={{ border: '1px solid #000', padding: '8px' }}>Date</th>
                                    <th style={{ border: '1px solid #000', padding: '8px' }}>Order_ID</th>
                                    <th style={{ border: '1px solid #000', padding: '8px' }}>Cannote_No</th>
                                    <th style={{ border: '1px solid #000', padding: '8px' }}>Destination</th>
                                    <th style={{ border: '1px solid #000', padding: '8px' }}>Weight</th>
                                    <th style={{ border: '1px solid #000', padding: '8px' }}>RS_PS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item, index) => (
                                    <tr key={index}>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}>{index + 1}</td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}>{formatDate(item.Date)}</td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}>{item.Order_ID}</td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}>{item.Cannote_No}</td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}>{item.Destination}</td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}>{item.Weight}</td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}>{item.RS_PS}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        <div style={{ marginTop: '20px', textAlign: 'right' }}>
                            <p><strong>TOTAL: </strong>{Math.floor(totalRSPS.toFixed(2))}</p>
                            <p><strong>FUEL EXPENSE {fuelExpense * 100}%: </strong>{Math.floor(FUEL.toFixed(2))}</p>
                            <p className='supertotal'><strong>SUPER TOTAL: </strong>{Math.floor(superTotal.toFixed(2))}</p>
                            <p><strong>CGST {cgstRate * 100}%: </strong>{Math.floor(CGST.toFixed(2))}</p>
                            <p><strong>SGST {sgstRate * 100}%: </strong>{Math.floor(SGST.toFixed(2))}</p>
                            <p><strong>GRAND TOTAL: </strong>{Math.floor(grandTotal.toFixed(2))}</p>
                            <p style={{color:"black",fontSize:"20px"}}>{grandTotalInWords}</p>
                        </div>

                        <div style={{ marginTop: '40px',textAlign:"center" }}>
                            <p>Issues cheque's or dd's SENTHUR AGENCIES, BANK OF BARODA, ANNUR br.</p>
                            <p>ACC NO: 55060200000292, IFSC: BARB0ANNURX.</p>
                            <p>FOR SENTHUR AGENCIES</p>
                            <p style={{ textAlign: 'right' }}>PROPRIETOR</p>
                            <h6 style={{textAlign:"center",color:"black",fontSize:"15px"}}>THANK U FOR USING FRANCH EXPRESS</h6>
                        </div>

                        <div className="print-hidden" style={{ marginTop: '20px' }}>
                        <TextField
                                label="Fuel Expense (%)"
                                type="number"
                                variant="outlined"
                                value={fuelExpense * 100}
                                onChange={(e) => setFuelExpense(e.target.value / 100)}
                                style={{ marginRight: '10px', width: '200px', marginLeft: '40px' }}
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

export default ReportFilter;