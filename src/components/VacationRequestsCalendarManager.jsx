import React, { useState, useEffect } from 'react';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, addMonths, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale'; // Import French locale
import { db } from '../utils/init-firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import './VacationRequestsCalendar.css'; // Reuse the same CSS as the admin version

const VacationRequestsCalendarManager = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [currentMonthDays, setCurrentMonthDays] = useState([]);
  const [employeeNumber, setEmployeeNumber] = useState('');

  useEffect(() => {
    const fetchManagerDetails = async () => {
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setEmployeeNumber(userSnap.data().employeeNumber);
        }
      }
    };

    fetchManagerDetails();
  }, [currentUser]);

  useEffect(() => {
    const fetchRequests = async () => {
      if (employeeNumber) {
        // Fetch requests where the user is the manager or the employee
        const requestsQuery = query(collection(db, "vacationRequests"), 
          where("managerEmployeeNumber", "==", employeeNumber));
        const querySnapshot = await getDocs(requestsQuery);
        const fetchedRequests = querySnapshot.docs.map(doc => {
          const data = doc.data();
          const startDate = data.startDate instanceof Date ? data.startDate : 
                            typeof data.startDate === 'string' ? parseISO(data.startDate) : new Date();
          const endDate = data.endDate instanceof Date ? data.endDate : 
                          typeof data.endDate === 'string' ? parseISO(data.endDate) : new Date();
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
    const dayName = format(day, 'EEE', { locale: fr }); // Use French locale for day names
    const dateDisplay = format(day, 'd', { locale: fr }); // Use French locale for date
    const dayRequests = requests.filter(req => day >= req.startDate && day <= req.endDate);

    return (
      <div key={formattedDate} className="day-cell">
        <div className="date-header">
          {dayName}, {dateDisplay}
        </div>
        {dayRequests.length > 0 ? (
          dayRequests.map((request, index) => (
            <div key={index} className={`request ${request.status.replace(/\s+/g, '-')}`}>
              {request.customerName || request.email || 'No Name'}
            </div>
          ))
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

export default VacationRequestsCalendarManager;
