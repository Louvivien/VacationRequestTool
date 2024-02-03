// /Users/vivien/Documents/Entreprisedufutur/src/components/VacationRequestsList.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../utils/init-firebase';
import { query, collection, where, getDocs } from 'firebase/firestore';
import { Table, Thead, Tbody, Tr, Th, Td, Button, Text, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';

const VacationRequestsList = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchRequests = async () => {
      if (currentUser && isMounted) {
        try {
          const customerIdentifier = currentUser.displayName || currentUser.email;
          const q = query(collection(db, "vacationRequests"), where("customerName", "==", customerIdentifier));
          const querySnapshot = await getDocs(q);
          const fetchedRequests = [];
          querySnapshot.forEach((doc) => {
            fetchedRequests.push({ id: doc.id, ...doc.data() });
          });
          if (isMounted) {
            setRequests(fetchedRequests);
          }
        } catch (error) {
          console.error("Error fetching requests: ", error);
        }
      }
    };
    
    fetchRequests();

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const handleOpenModal = (request) => {
    setSelectedRequest(request);
    onOpen();
  };

  return (
    <>
      {requests.length > 0 ? (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Date de début</Th>
              <Th>Date de fin</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {requests.map((request) => (
              <Tr key={request.id}>
                <Td>{request.startDate}</Td>
                <Td>{request.endDate}</Td>
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
                <Text>Nom du client: {selectedRequest.customerName}</Text>
                <Text>Date de début: {selectedRequest.startDate}</Text>
                <Text>Date de fin: {selectedRequest.endDate}</Text>
                <Text>Solde congés payés (jours ouvrés): {selectedRequest.paidLeaveBalance}</Text>
                <Text>Type de congé: {selectedRequest.paidLeave ? "Congés Payés" : (selectedRequest.unpaidLeave ? "Sans solde" : "Autres")}</Text>
                <Text>Autres informations: {selectedRequest.otherLeave}</Text>
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

    </>
  );
};

export default VacationRequestsList;
