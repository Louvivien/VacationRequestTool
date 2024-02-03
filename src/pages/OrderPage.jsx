// /Users/vivien/Documents/Entreprisedufutur/src/pages/OrderPage.jsx

import React from 'react';
import { Container, Heading, Text } from '@chakra-ui/react';
import { Layout } from '../components/Layout';
import VacationRequestForm from '../components/VacationRequestForm';

const OrderPage = () => {
  return (
    <Layout>
      <Container maxW='container.lg' py={4}>
        <Heading as="h1">Faire une demande de congés</Heading>
        <Text mb={4}>Saisissez les détails de la demande que vous souhaitez faire.</Text>
        <VacationRequestForm />
      </Container>
    </Layout>
  );
};

export default OrderPage;
