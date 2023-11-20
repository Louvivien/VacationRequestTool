// /Users/vivien/Documents/Entreprisedufutur/src/pages/OrderPage.jsx

import React from 'react';
import { Container, Heading, Text } from '@chakra-ui/react';
import { Layout } from '../components/Layout';
import OrderForm from '../components/OrderForm';

const OrderPage = () => {
  return (
    <Layout>
      <Container maxW='container.lg' py={4}>
        <Heading as="h1">Passer une commande</Heading>
        <Text mb={4}>Saississez les détails de la commande que vous souhaitez passer.</Text>
        <OrderForm />
      </Container>
    </Layout>
  );
};

export default OrderPage;
