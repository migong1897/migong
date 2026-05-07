import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DataEntry from './pages/DataEntry';
import DataList from './pages/DataList';
import DataImport from './pages/DataImport';
import HorizontalCompare from './pages/HorizontalCompare';
import VerticalTracking from './pages/VerticalTracking';
import Charts from './pages/Charts';
import Sidebar from './components/Sidebar';
import { isLoggedIn } from './utils/storage';

const Layout = ({ children }) => (
  <div className="main-layout">
    <Sidebar />
    <div className="main-content">{children}</div>
  </div>
);

function App() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, []);

  const handleLogin = () => {
    setLoggedIn(true);
  };

  const handleLogout = () => {
    setLoggedIn(false);
  };

  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={!loggedIn ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/*" element={loggedIn ? (
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/entry" element={<DataEntry />} />
                <Route path="/list" element={<DataList />} />
                <Route path="/import" element={<DataImport />} />
                <Route path="/horizontal" element={<HorizontalCompare />} />
                <Route path="/vertical" element={<VerticalTracking />} />
                <Route path="/charts" element={<Charts />} />
              </Routes>
            </Layout>
          ) : <Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
