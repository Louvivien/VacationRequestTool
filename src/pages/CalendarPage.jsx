// /Users/vivien/Documents/Entreprisedufutur/src/pages/CalendarPage.jsx

import React from 'react';
import { Container, Heading, Text } from '@chakra-ui/react';
import { Layout } from '../components/Layout';
import VacationRequestsCalendar from '../components/VacationRequestsCalendar';
import VacationRequestsCalendarAdmin from '../components/VacationRequestsCalendarAdmin';
import VacationRequestsCalendarManager from '../components/VacationRequestsCalendarManager';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth to access the user's role


const CalendarPage = () => {
  const { userRole } = useAuth(); // Destructure to get userRole from the context

  return (
    <Layout>
      <Container maxW='container.lg' py={4}>
        <Heading as="h1">Consulter le calendrier</Heading>


        {
            // Conditionally render based on the user's role
            userRole === 'admin' || userRole === 'manager' ? 
            <Text mb={4}>Visualiser les demandes de congés.</Text> : 
            <Text mb={4}>Visualiser vos demandes de congés.</Text>
          }

        {
            // Conditionally render based on the user's role
            userRole === 'admin' ? <VacationRequestsCalendarAdmin /> : 
            userRole === 'manager' ? <VacationRequestsCalendarManager /> : 
            <VacationRequestsCalendar />
          }


      </Container>
    </Layout>
  );
};

export default CalendarPage;
