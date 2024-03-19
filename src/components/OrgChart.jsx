// /Users/vivien/Documents/MargaRH/src/components/OrgChart.jsx

import React, { useEffect, useState } from 'react';
import { db } from '../utils/init-firebase';
import { collection, getDocs } from 'firebase/firestore';
import html2canvas from 'html2canvas'; // Import html2canvas
import './OrgChart.css'; // Assuming you have an OrgChart.css file for styles

const OrgChart = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData.filter(user => !user.name.toLowerCase().includes('vivien')));
    };

    fetchUsers();
  }, []);

  // Filter out managers and admins, treating both as managers, and exclude "vivien"
  const managers = users.filter(user => (user.role === 'manager' || user.role === 'admin') && !user.name.toLowerCase().includes('vivien')).sort((a, b) => a.name.localeCompare(b.name));

  // Map users to their managers, excluding self-managed scenarios and "vivien"
  const usersByManager = users.reduce((acc, user) => {
    if (user.managerEmployeeNumber !== "00" && user.employeeNumber !== user.managerEmployeeNumber && !user.name.toLowerCase().includes('vivien')) {
      if (!acc[user.managerEmployeeNumber]) {
        acc[user.managerEmployeeNumber] = [];
      }
      acc[user.managerEmployeeNumber].push(user);
    }
    return acc;
  }, {});

  const exportChartAsPNG = () => {
    const chartElement = document.querySelector('.org-chart'); // Make sure this class name matches your chart container
    if (chartElement) {
      html2canvas(chartElement, { scale: 1 }).then((canvas) => {
        // Create an a element to trigger download
        const link = document.createElement('a');
        link.download = 'organizational-chart.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  return (
    <div>
      <button onClick={exportChartAsPNG} style={{ marginBottom: '20px' }}>Exporter en PNG</button>
      <div className="org-chart">
        <div className="manager-row">
          {managers.map(manager => (
            <div key={manager.employeeNumber} className="manager-container">
              <div className="manager">{manager.name}</div>
              <div className="subordinates">
                {usersByManager[manager.employeeNumber]?.map(subordinate => (
                  <div key={subordinate.employeeNumber} className="subordinate">{subordinate.name}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrgChart;
