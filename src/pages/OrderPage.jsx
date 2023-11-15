// /Users/vivien/Documents/Entreprisedufutur/src/pages/OrderPage.jsx

import React from 'react';
import { Container, Heading, Text } from '@chakra-ui/react';
import { Layout } from '../components/Layout';
import OrderForm from '../components/OrderForm';

const OrderPage = () => {
  return (
    <Layout>
      <Container maxW='container.lg' py={4}>
        <Heading as="h1">Submit an Order</Heading>
        <Text mb={4}>Enter the details of the order you want to submit.</Text>
        <OrderForm />
      </Container>
    </Layout>
  );
};

export default OrderPage;
