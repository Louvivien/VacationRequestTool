// /Users/vivien/Documents/Entreprisedufutur/src/pages/CustomerOrdersPage.jsx

import React from 'react';
import { Container, Heading, Text } from '@chakra-ui/react';
import { Layout } from '../components/Layout';
import CustomerOrdersList from '../components/CustomerOrdersList';

const CustomerOrdersPage = () => {
  return (
    <Layout>
      <Container maxW='container.lg' py={4}>
        <Heading as="h1">Your Orders</Heading>
        <Text mb={4}>List of all orders you've submitted.</Text>
        <CustomerOrdersList />
      </Container>
    </Layout>
  );
};

export default CustomerOrdersPage;
