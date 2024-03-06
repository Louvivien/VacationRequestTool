import React from 'react';
import { Container, Heading, Text } from '@chakra-ui/react';
import { Layout } from '../components/Layout';
import VacationRequestsList from '../components/VacationRequestsList';
import VacationRequestsListAdmin from '../components/VacationRequestsListAdmin'; 
import VacationRequestsListManager from '../components/VacationRequestsListManager';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth to access the user's role

const CustomerOrdersPage = () => {
  const { userRole } = useAuth(); // Destructure to get userRole from the context

  return (
    <Layout>
      <Container maxW='container.lg' py={4}>
        <Heading as="h1">Vos demandes</Heading>
        {
            userRole === 'admin' ? 
            <Text mb={4}>Liste de toutes les demandes</Text> : 
            (userRole === 'manager' ? 
            <Text mb={4}>Liste des dernières demandes</Text> : 
            <Text mb={4}>Liste des dernières demandes que vous avez faites</Text>)
          }


        {
            // Conditionally render based on the user's role
            userRole === 'admin' ? <VacationRequestsListAdmin /> : 
            userRole === 'manager' ? <VacationRequestsListManager /> : 
            <VacationRequestsList />
          }
      </Container>
    </Layout>
  );
};

export default CustomerOrdersPage;
