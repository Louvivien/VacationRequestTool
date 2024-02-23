import React, { useState, useEffect } from 'react';
import { Container, Heading, Text, VStack, Box } from '@chakra-ui/react';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/init-firebase'; // Ensure you import your initialized Firestore instance

export default function ProfilePage() {
  const { currentUser } = useAuth();
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (currentUser && currentUser.uid) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserInfo(docSnap.data());
        } else {
          console.log("No such document!");
        }
      }
    };

    fetchUserInfo();
  }, [currentUser]);

  return (
    <Layout>
      <Container maxW='container.lg' py={4}>
        <Heading mb={4}>Page de profil</Heading>
        {userInfo ? (
          <VStack spacing={4} alignItems="flex-start">
            <Box>
              <Text fontWeight="bold">Nom :</Text>
              <Text>{userInfo.name}</Text>
            </Box>
            <Box>
              <Text fontWeight="bold">Rôle :</Text>
              <Text>{userInfo.role}</Text>
            </Box>
            <Box>
              <Text fontWeight="bold">Email :</Text>
              <Text>{userInfo.email}</Text>
            </Box>
            <Box>
              <Text fontWeight="bold">Numéro d'employé :</Text>
              <Text>{userInfo.employeeNumber}</Text>
            </Box>
            <Box>
              <Text fontWeight="bold">Numéro du manager :</Text>
              <Text>{userInfo.managerEmployeeNumber}</Text>
            </Box>

          </VStack>
        ) : (
          <Text>Chargement des informations de profile...</Text>
        )}
      </Container>
    </Layout>
  );
}
