
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const RateEditor = () => {
  

//   const [rates, setRates] = useState({});
//   const [selectedRegion, setSelectedRegion] = useState('');
//   const [formValues, setFormValues] = useState({ amount250: '', amount1000: '', additional500: '' });

//   useEffect(() => {
//     // Fetch the current rates from the server when the component loads
//     axios.get('http://localhost:5000/rates')
//       .then(response => setRates(response.data))
//       .catch(error => console.error('Error fetching rates:', error));
//   }, []);

//   const handleRegionChange = (event) => {
//     const region = event.target.value;
//     setSelectedRegion(region);
//     setFormValues(rates[region] || { amount250: '', amount1000: '', additional500: '' });
//   };

//   const handleInputChange = (event) => {
//     const { name, value } = event.target;
//     setFormValues({ ...formValues, [name]: value });
//   };

//   const handleSubmit = (event) => {
//     event.preventDefault();
//     if (selectedRegion) {
//       const updatedRates = { ...rates, [selectedRegion]: formValues };
//       setRates(updatedRates);

//       // Send the updated rates to the server
//       axios.put('http://localhost:5000/rates', updatedRates)
//         .then(() => alert('Rates updated successfully'))
//         .catch(error => console.error('Error updating rates:', error));
//     } else {
//       alert('Please select a region');
//     }
//   };

//   return (
//     <div 
//     className="rate-editor-main"
//     style={{
//       marginTop:'30px',
//       display: "flex",
//       justifyContent: "center",
//       alignItems: "center",
//       height: "100vh", 
//       backgroundColor: "var(--bg-color)"
//     }}
//   >
//     <div className="rate-editor-content" style={{
//       width: "100%",
//       maxWidth: "500px", // Set a max-width for the form container
//       padding: "20px",
//       backgroundColor: "#fff",
//       borderRadius: "8px",
//       boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
//     }}>
//       <h2 className="rate-editor-title" style={{ marginBottom: "20px" }}>Edit Rates</h2>
//       <form onSubmit={handleSubmit} className="rate-editor-form" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
//         <div className="rate-editor-form-group" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
//           <label className="rate-editor-label">Select Region:</label>
//           <select 
//             value={selectedRegion} 
//             onChange={handleRegionChange} 
//             className="rate-editor-input-select"
//             style={{
//               width: "100%",
//               height: "40px",
//               padding: "8px",
//               borderRadius: "4px",
//               border: "1px solid #ccc",
//               backgroundColor: "var(--bg-color)",
//               color: "var(--color-text)",
//               boxSizing: "border-box", // Include padding and border in the element's total width and height
//             }}
//           >
//             <option value="">--Select Region--</option>
//             {Object.keys(rates).map((region) => (
//               <option key={region} value={region}>
//                 {region}
//               </option>
//             ))}
//           </select>
//         </div>
//         <div className="rate-editor-form-group">
//           <label className="rate-editor-label">Amount for 250g:</label>
//           <input
//             type="number"
//             name="amount250"
//             value={formValues.amount250}
//             onChange={handleInputChange}
//             className="rate-editor-input-field"
//             style={{
//               width: "100%",
//               height: "40px",
//               padding: "8px",
//               borderRadius: "4px",
//               border: "1px solid #ccc",
//               backgroundColor: "var(--bg-color)",
//               color: "var(--color-text)",
//               boxSizing: "border-box",
//             }}
//           />
//         </div>
//         <div className="rate-editor-form-group">
//           <label className="rate-editor-label">Amount for 1000g:</label>
//           <input
//             type="number"
//             name="amount1000"
//             value={formValues.amount1000}
//             onChange={handleInputChange}
//             className="rate-editor-input-field"
//             style={{
//               width: "100%",
//               height: "40px",
//               padding: "8px",
//               borderRadius: "4px",
//               border: "1px solid #ccc",
//               backgroundColor: "var(--bg-color)",
//               color: "var(--color-text)",
//               boxSizing: "border-box",
//             }}
//           />
//         </div>
//         <div className="rate-editor-form-group">
//           <label className="rate-editor-label">Amount for additional 500g:</label>
//           <input
//             type="number"
//             name="additional500"
//             value={formValues.additional500}
//             onChange={handleInputChange}
//             className="rate-editor-input-field"
//             style={{
//               width: "100%",
//               height: "40px",
//               padding: "8px",
//               borderRadius: "4px",
//               border: "1px solid #ccc",
//               backgroundColor: "var(--bg-color)",
//               color: "var(--color-text)",
//               boxSizing: "border-box",
//             }}
//           />
//         </div>
//         <button 
//           type="submit" 
//           className="rate-editor-submit-button"
//           style={{
//             width: "100%",
//             height: "40px",
//             padding: "8px",
//             border: "none",
//             borderRadius: "4px",
//             backgroundColor: "var(--header-bg-color)",
//             color: "var(--color-text-btn)",
//             fontSize: "16px",
//             cursor: "pointer",
//             transition: "background-color 0.3s ease",
//           }}
//           onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--active-color)'} // Hover effect
//           onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--header-bg-color)'} // Reset on hover out
//         >
//           Update Rates
//         </button>
//       </form>
//     </div>
//   </div>
  
//   );
// };

// export default RateEditor;
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RateEditor = () => {
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch current rates from the server
    axios.get('http://localhost:5000/api/rates')
      .then(response => {
        setRates(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching rates:', error);
        setLoading(false);
      });
  }, []);

  const handleChange = (region, key, value) => {
    setRates(prevRates => ({
      ...prevRates,
      [region]: {
        ...prevRates[region],
        [key]: parseFloat(value)
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5000/api/rates', rates, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(response => {
        setMessage(response.data.message);
        alert('Rates updated successfully!');  // Alert after successful update
      })
      .catch(error => {
        console.error('Error updating rates:', error);
        setMessage('Error updating rates');
      });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='main-content'>
      <div className='rates'>
      <h2>Update Shipping Rates</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        {Object.keys(rates).map(region => (
          <div key={region} style={{ marginBottom: '20px' }}>
            <h3>{region}</h3><br/>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ marginRight: '10px' }}>Up to 250g:</label>
                <input
                  type="number"
                  value={rates[region].amount250}
                  onChange={(e) => handleChange(region, 'amount250', e.target.value)}
                  style={{ padding: '5px', width: '100px' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ marginRight: '10px' }}>Up to 1000g:</label>
                <input
                  type="number"
                  value={rates[region].amount1000}
                  onChange={(e) => handleChange(region, 'amount1000', e.target.value)}
                  style={{ padding: '5px', width: '100px' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ marginRight: '10px' }}>Additional per 500g:</label>
                <input
                  type="number"
                  value={rates[region].additional500}
                  onChange={(e) => handleChange(region, 'additional500', e.target.value)}
                  style={{ padding: '5px', width: '100px' }}
                />
              </div>
            </div>
          </div>
        ))}
        <button type="submit">Update Rates</button>
      </form>
    </div>
    </div>
  );
};

export default RateEditor;