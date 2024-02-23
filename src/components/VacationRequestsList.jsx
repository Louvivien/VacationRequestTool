// /Users/vivien/Documents/Entreprisedufutur/src/components/VacationRequestsList.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../utils/init-firebase';
import { query, collection, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { Table, Thead, Tbody, Tr, Th, Td, Button, Text, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Box } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';

const VacationRequestsList = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedRequest, setSelectedRequest] = useState(null);


  useEffect(() => {
    const fetchUserAndRequests = async () => {
      if (currentUser) {
        // Fetch the current user's name from the 'users' collection
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userName = userSnap.data().name;
          
          // Use the fetched name to query the 'vacationRequests' collection
          const q = query(collection(db, "vacationRequests"), where("customerName", "==", userName));
          const querySnapshot = await getDocs(q);
          const fetchedRequests = [];
          querySnapshot.forEach((doc) => {
            fetchedRequests.push({ id: doc.id, ...doc.data() });
          });
          setRequests(fetchedRequests);
        } else {
          console.log("User document not found");
        }
      }
    };

    fetchUserAndRequests();
  }, [currentUser]);


  const handleOpenModal = (request) => {
    setSelectedRequest(request);
    onOpen();
  };

    // Function to determine the background color based on the request status
    const getStatusBgColor = (status) => {
      switch (status) {
        case "en attente":
          return "gray.200"; // Grey
        case "accepté":
          return "green.100"; // Light green
        case "refusé":
          return "red.100"; // Light red
        default:
          return "transparent";
      }
    };

  return (
    <>
      {requests.length > 0 ? (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Date de début</Th>
              <Th>Date de fin</Th>
              <Th>Statut</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {requests.map((request) => (
              <Tr key={request.id}>
                <Td>{request.startDate}</Td>
                <Td>{request.endDate}</Td>
                <Td>
                  <Box as="span" p={1} bg={getStatusBgColor(request.status)} borderRadius="md">
                    {request.status}
                  </Box>
                </Td>
                <Td>
                  <Button colorScheme='blue' onClick={() => handleOpenModal(request)}>Détails</Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : (
        <Text>Pas de demande trouvée.</Text>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Details de la Demande</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedRequest && (
              <>
                <Text>Nom: {selectedRequest.customerName}</Text>
                <Text>Date de début: {selectedRequest.startDate}</Text>
                <Text>Date de fin: {selectedRequest.endDate}</Text>
                <Text>Solde congés payés (jours ouvrés): {selectedRequest.paidLeaveBalance}</Text>
                <Text>Type de congé: {selectedRequest.paidLeave ? "Congés Payés" : (selectedRequest.unpaidLeave ? "Sans solde" : "Autres")}</Text>
                <Text>Autres informations: {selectedRequest.otherLeave}</Text>
                <Text>Statut: {selectedRequest.status}</Text>
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

    </>
  );
};

export default VacationRequestsList;
