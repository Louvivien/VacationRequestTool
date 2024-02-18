import React from 'react';
import { Container, Heading, Text } from '@chakra-ui/react'; // Ensure Text is imported

import { Layout } from '../components/Layout';
import UserManagement from '../components/UserManagement';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth to access the user's role

const UsersPage = () => {
  const { userRole } = useAuth(); // Ensure your context provides userRole directly

  return (
    <Layout>
      <Container maxW='container.lg' py={4}>
        <Heading as="h1">Gestion des utilisateurs</Heading>

        {
          // Conditionally render based on the user's role
          userRole === 'admin' ? <UserManagement /> : 
          <Text mb={4}>Vous n'avez pas les droits pour accéder à cette page.</Text>
        }

      </Container>
    </Layout>
  );
};

export default UsersPage;
