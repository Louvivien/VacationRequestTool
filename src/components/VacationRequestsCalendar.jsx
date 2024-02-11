import React, { useState, useEffect } from 'react';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, addMonths } from 'date-fns';
import { db } from '../utils/init-firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import './VacationRequestsCalendar.css'; // Ensure this CSS file is created with the provided styles

const VacationRequestsCalendar = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [currentMonthDays, setCurrentMonthDays] = useState([]);
  const [employeeNumber, setEmployeeNumber] = useState('');

  useEffect(() => {
    // Fetch the current user's employeeNumber first
    const fetchEmployeeNumber = async () => {
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setEmployeeNumber(userSnap.data().employeeNumber);
        }
      }
    };

    fetchEmployeeNumber();
  }, [currentUser]);

  useEffect(() => {
    // Once we have the employeeNumber, fetch the corresponding vacation requests
    const fetchRequests = async () => {
      if (employeeNumber) {
        const q = query(collection(db, "vacationRequests"), 
                         where("employeeNumber", "==", employeeNumber));
        const querySnapshot = await getDocs(q);
        const fetchedRequests = querySnapshot.docs.map(doc => {
          const data = doc.data();
          // Check and convert startDate and endDate if they are not Date objects
          const startDate = data.startDate instanceof Date ? data.startDate : new Date(data.startDate);
          const endDate = data.endDate instanceof Date ? data.endDate : new Date(data.endDate);
          return { ...data, startDate, endDate };
        });
        setRequests(fetchedRequests);
      }
    };

    fetchRequests();
  }, [employeeNumber]);

  useEffect(() => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(addMonths(new Date(), 2)); // Displaying 3 months
    setCurrentMonthDays(eachDayOfInterval({ start, end }));
  }, []);

  const renderDay = (day) => {
    const formattedDate = format(day, 'yyyy-MM-dd');
    const dayName = format(day, 'EEE');
    const dateDisplay = format(day, 'd');
    const request = requests.find(req => day >= req.startDate && day <= req.endDate);

    return (
      <div key={formattedDate} className="day-cell">
        <div className="date-header">
          {dayName}, {dateDisplay}
        </div>
        {request ? (
          <div className={`request ${request.status.replace(/\s+/g, '-')}`}>
            {request.customerName || currentUser.email}
          </div>
        ) : <div className="no-request"></div>}
      </div>
    );
  };

  return (
    <div className="calendar-line">
      {currentMonthDays.map(day => renderDay(day))}
    </div>
  );
};

export default VacationRequestsCalendar;
