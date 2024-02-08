import React, { useState, useEffect } from 'react';
import { db } from '../utils/init-firebase';
import { query, collection, getDocs } from 'firebase/firestore';
import { Table, Thead, Tbody, Tr, Th, Td, Button, Text, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';

const VacationRequestsListAdmin = () => {
  const [requests, setRequests] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        // Fetch all vacation requests for admin
        const q = query(collection(db, "vacationRequests"));
        const querySnapshot = await getDocs(q);
        const fetchedRequests = [];
        querySnapshot.forEach((doc) => {
          fetchedRequests.push({ id: doc.id, ...doc.data() });
        });
        setRequests(fetchedRequests);
      } catch (error) {
        console.error("Error fetching requests: ", error);
      }
    };
    
    fetchRequests();
  }, []);

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
              <Th>Nom du client</Th>
              <Th>Date de début</Th>
              <Th>Date de fin</Th>
              <Th>Statut</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {requests.map((request) => (
              <Tr key={request.id}>
                <Td>{request.customerName}</Td>
                <Td>{request.startDate}</Td>
                <Td>{request.endDate}</Td>
                <Td>{request.status}</Td>
                <Td>
                  <Button colorScheme='blue' onClick={() => handleOpenModal(request)}>Détails</Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : (
        <Text>Aucune demande trouvée.</Text>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Détails de la Demande</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedRequest && (
              <>
                <Text>Nom du client: {selectedRequest.customerName}</Text>
                <Text>Date de début: {selectedRequest.startDate}</Text>
                <Text>Date de fin: {selectedRequest.endDate}</Text>
                <Text>Solde congés payés (jours ouvrés): {selectedRequest.paidLeaveBalance}</Text>
                <Text>Type de congé: {selectedRequest.paidLeave ? "Congés Payés" : (selectedRequest.unpaidLeave ? "Sans solde" : "Autres")}</Text>
                <Text>Statut: {selectedRequest.status}</Text>
                <Text>Autres informations: {selectedRequest.otherLeave}</Text>
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default VacationRequestsListAdmin;
