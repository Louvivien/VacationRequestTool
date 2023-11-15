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
        <Heading as="h6">Your Orders</Heading>
        <Text mb={4}>List of all orders you've submitted.</Text>
        <CustomerOrdersList />
      </Container>
          <br></br>
          <Container maxW='container.lg' py={4}>
        <Heading as="h6">Submit an Order</Heading>
        <Text mb={4}>Enter the details of the order you want to submit.</Text>
        <OrderForm />
      </Container>
        </>
      ) : (
        <>
          <Heading>
            Customer account
          </Heading>
          <OrderedList fontSize='1xl' my={4}>
            <ListItem>Find your orders</ListItem>
            <ListItem>Renew your orders</ListItem>
          </OrderedList>
        </>
      )}


    </Layout>
  );
}
