import React from 'react';
import { Container, Text, Heading, ListItem, OrderedList } from '@chakra-ui/react';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import VacationRequestForm from '../components/VacationRequestForm';
import VacationRequestsList from '../components/VacationRequestsList';
import VacationRequestsListAdmin from '../components/VacationRequestsListAdmin'; 
import VacationRequestsListManager from '../components/VacationRequestsListManager';


export default function Homepage() {
  const { currentUser } = useAuth();
  const { userRole } = useAuth();


  return (
    <Layout>
      {currentUser ? (
        <>
            <div>
      {userRole === 'admin' && (
        <div>
          {/* Admin-specific components */}
          <p>Welcome, Admin!</p>
        </div>
      )}
      {userRole === 'manager' && (
        <div>
          {/* Manager-specific components */}
          <p>Welcome, Manager!</p>
        </div>
      )}
        </div>
              <Container maxW='container.lg' py={4}>
        <Heading as="h6">Vos demandes</Heading>
        


          {
            // Conditionally render based on the user's role
            userRole === 'admin' || userRole === 'manager' ? 
            <Text mb={4}>Liste de toutes les demandes</Text> : 
            <Text mb={4}>Liste de toutes les demandes que vous avez faites</Text>
          }

          {
            // Conditionally render based on the user's role
            userRole === 'admin' ? <VacationRequestsListAdmin /> : 
            userRole === 'manager' ? <VacationRequestsListManager /> : 
            <VacationRequestsList />
          }

      </Container>
          <br></br>
          <Container maxW='container.lg' py={4}>
        <Heading as="h6">Nouvelle demande</Heading>
        <Text mb={4}>Saisir le détail de la demande que vous souhaitez faire</Text>
        <VacationRequestForm />
      </Container>
        </>
      ) : (
        <>
          <Heading>
            Margaron RH
          </Heading>
          <OrderedList fontSize='1xl' my={4}>
            <ListItem>Faites vos demandes de congés</ListItem>
            {/* <ListItem>Renouveller vos commandes</ListItem> */}
          </OrderedList>
        </>
      )}


    </Layout>
  );
}
