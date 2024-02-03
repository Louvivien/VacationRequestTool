// /Users/vivien/Documents/Entreprisedufutur/src/pages/CustomerOrdersPage.jsx

import React from 'react';
import { Container, Heading, Text } from '@chakra-ui/react';
import { Layout } from '../components/Layout';
import VacationRequestsList from '../components/VacationRequestsList';

const CustomerOrdersPage = () => {
  return (
    <Layout>
      <Container maxW='container.lg' py={4}>
        <Heading as="h1">Vos demandes</Heading>
        <Text mb={4}>Liste de toutes les demandes que vous avez faites.</Text>
        <VacationRequestsList />
      </Container>
    </Layout>
  );
};

export default CustomerOrdersPage;
