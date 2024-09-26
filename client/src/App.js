import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidemenubar from './components/Sidemenubar';
import FileUploadAndDataTable from './components/FileUploadAndDataTable';
import Weight from './components/WeightManager';
import Login from './components/Login';
import Rate from './components/RatesComponent';
import PrivateRoute from './components/PrivateRoute';
import ReportFilter from './components/ReportFilter';
import Otherclient from './components/Otherclient';
import OtherClientsTables from './components/OtherClientsTables';
import OtherClientsData from './components/OtherClientsData';
import AddOtherClients from './components/AddOtherClients';
import { Navigate } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Sidemenubar /> 
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/Rate"
              element={
                <PrivateRoute>
                  <Rate />
                </PrivateRoute>
              }
            />
            <Route
              path="/Weight"
              element={
                <PrivateRoute>
                  <Weight />
                </PrivateRoute>
              }
            />
            <Route
              path="/FileUploadAndDataTable"
              element={
                <PrivateRoute>
                  <FileUploadAndDataTable />
                </PrivateRoute>
              }
            />
            <Route
              path="/ReportFilter"
              element={
                <PrivateRoute>
                  <ReportFilter />
                </PrivateRoute>
              }
            />
            <Route
              path="/Otherclient"
              element={
                <PrivateRoute>
                  <Otherclient />
                </PrivateRoute>
              }
            />
            <Route
              path="/Otherclient/OtherClientsTables"
              element={
                <PrivateRoute>
                  <OtherClientsTables />
                </PrivateRoute>
              }
            />
            <Route
              path="/Otherclient/OtherClientsData"
              element={
                <PrivateRoute>
                  <OtherClientsData />
                </PrivateRoute>
              }
            />
            <Route
              path="/Otherclient/AddOtherClients"
              element={
                <PrivateRoute>
                  <AddOtherClients />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
    </Router>
  );
}

export default App;
