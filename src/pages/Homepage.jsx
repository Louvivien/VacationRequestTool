import React from 'react';
import { Container, Text, Heading, ListItem, OrderedList } from '@chakra-ui/react';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import CustomerOrdersList from '../components/CustomerOrdersList';
import OrderForm from '../components/OrderForm';

export default function Homepage() {
  const { currentUser } = useAuth();

  return (
    <Layout>
      {currentUser ? (
        <>
              <Container maxW='container.lg' py={4}>
        <Heading as="h6">Vos commandes</Heading>
        <Text mb={4}>Liste de toutes les commandes que vous avez passées</Text>
        <CustomerOrdersList />
      </Container>
          <br></br>
          <Container maxW='container.lg' py={4}>
        <Heading as="h6">Nouvelle commande</Heading>
        <Text mb={4}>Saisir le détail de la commande que vous souhaitez passer</Text>
        <OrderForm />
      </Container>
        </>
      ) : (
        <>
          <Heading>
            Compte client Margaron
          </Heading>
          <OrderedList fontSize='1xl' my={4}>
            <ListItem>Suivre vos commandes</ListItem>
            <ListItem>Renouveller vos commandes</ListItem>
          </OrderedList>
        </>
      )}


    </Layout>
  );
}
