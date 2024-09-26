import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = ({ onDataFetched }) => {
  const [files, setFiles] = useState([]);

  // Handle file selection
  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  // Handle file upload
  const handleUpload = () => {
    if (files.length === 0) {
      alert('Please select files to upload.');
      return;
    }

    const uploadPromises = files.map((file) => {
      const formData = new FormData();
      formData.append('file', file);

      return axios
        .post('http://localhost:5000/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((response) => {
          console.log(`File ${file.name} uploaded successfully.`);
        })
        .catch((error) => {
          console.error(`Error uploading file ${file.name}:`, error);
        });
    });

    Promise.all(uploadPromises)
      .then(() => {
        onDataFetched(); // Call onDataFetched to refresh data
        alert('All files uploaded and data fetched successfully!');
      })
      .catch(() => {
        alert('Error uploading files. Please try again.');
      });
  };

  return (
    <div className="file-upload">
      <input type="file" multiple onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default FileUpload;