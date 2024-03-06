import React, { useState, useEffect } from 'react';
import { db } from '../utils/init-firebase';
import { query, collection, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { Table, Thead, Tbody, Tr, Th, Td, Button, Text, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalCloseButton, ModalBody, Box } from '@chakra-ui/react';
import { format } from 'date-fns';

const VacationRequestsListAdmin = () => {
  const [requests, setRequests] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        // Query that includes orderBy to sort by startDate
        const q = query(collection(db, "vacationRequests"), orderBy("startDate", "asc"));
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

  const updateRequestStatus = async (id, newStatus) => {
    const requestRef = doc(db, "vacationRequests", id);
    await updateDoc(requestRef, { status: newStatus });
    setRequests(requests.map(request => request.id === id ? { ...request, status: newStatus } : request));
    onClose(); // Close the modal after updating
  };

  const handleOpenModal = (request) => {
    setSelectedRequest(request);
    onOpen();
  };

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
              <Th>Nom de l'employé</Th>
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
                <Td>{format(new Date(request.startDate), 'dd/MM/yyyy')}</Td>
                <Td>{format(new Date(request.endDate), 'dd/MM/yyyy')}</Td>
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
                <Text>Nom: {selectedRequest.customerName}</Text>
                <Text>Date de début: {format(new Date(selectedRequest.startDate), 'dd/MM/yyyy')}</Text>
                <Text>Date de fin: {format(new Date(selectedRequest.endDate), 'dd/MM/yyyy')}</Text>
                <Text>Solde congés payés (jours ouvrés): {selectedRequest.paidLeaveBalance}</Text>
                <Text>Type de congé: {selectedRequest.paidLeave ? "Congés Payés" : (selectedRequest.unpaidLeave ? "Sans solde" : "Autres")}</Text>
                <Text>Statut: {selectedRequest.status}</Text>
                <Text>Autres informations: {selectedRequest.otherLeave}</Text>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" mr={3} onClick={() => updateRequestStatus(selectedRequest.id, "accepté")}>Accepter</Button>
            <Button colorScheme="red" onClick={() => updateRequestStatus(selectedRequest.id, "refusé")}>Refuser</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default VacationRequestsListAdmin;
