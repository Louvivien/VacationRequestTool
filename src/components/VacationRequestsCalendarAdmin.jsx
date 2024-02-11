import React, { useState, useEffect } from 'react';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, addMonths, parseISO } from 'date-fns';
import { db } from '../utils/init-firebase';
import { collection, getDocs } from 'firebase/firestore';
import './VacationRequestsCalendar.css'; // Ensure this CSS file is created with the provided styles

const VacationRequestsCalendarAdmin = () => {
  const [requests, setRequests] = useState([]);
  const [currentMonthDays, setCurrentMonthDays] = useState([]);

  useEffect(() => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(addMonths(new Date(), 2)); // Displaying 3 months
    setCurrentMonthDays(eachDayOfInterval({ start, end }));

    // Fetch all vacation requests for admin
    const fetchRequests = async () => {
      const q = collection(db, "vacationRequests");
      const querySnapshot = await getDocs(q);
      const fetchedRequests = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Check if startDate and endDate need conversion
        const startDate = data.startDate instanceof Date ? data.startDate : 
                          typeof data.startDate === 'string' ? parseISO(data.startDate) : new Date();
        const endDate = data.endDate instanceof Date ? data.endDate : 
                        typeof data.endDate === 'string' ? parseISO(data.endDate) : new Date();
        return { ...data, startDate, endDate };
      });
      setRequests(fetchedRequests);
    };

    fetchRequests();
  }, []);

  const renderDay = (day) => {
    const formattedDate = format(day, 'yyyy-MM-dd');
    const dayName = format(day, 'EEE');
    const dateDisplay = format(day, 'd');
    const dayRequests = requests.filter(req => day >= req.startDate && day <= req.endDate);

    return (
      <div key={formattedDate} className="day-cell">
        <div className="date-header">
          {dayName}, {dateDisplay}
        </div>
        {dayRequests.length > 0 ? (
          dayRequests.map((request, index) => (
            <div key={index} className={`request ${request.status.replace(/\s+/g, '-')}`}>
              {request.customerName || 'No Name'}
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

export default VacationRequestsCalendarAdmin;
