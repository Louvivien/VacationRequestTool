import React, { useState, useEffect } from 'react';
import { db } from '../utils/init-firebase';
import { query, collection, getDocs, doc, updateDoc, where, getDoc } from 'firebase/firestore';
import { Table, Thead, Tbody, Tr, Th, Td, Button, Text, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalCloseButton, ModalBody, Box } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { format, parseISO, subWeeks, isAfter } from 'date-fns';

const VacationRequestsListManager = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const fetchManagerAndRequests = async () => {
      if (currentUser) {
        // Fetch manager's employee number
        const userRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const managerEmployeeNumber = docSnap.data().employeeNumber;
          const twoWeeksAgo = subWeeks(new Date(), 2);
          // Query for vacation requests
          const q = query(collection(db, "vacationRequests"), where("managerEmployeeNumber", "==", managerEmployeeNumber));
          const querySnapshot = await getDocs(q);
          const fetchedRequests = querySnapshot.docs.map(doc => {
            const data = doc.data();
            data.startDate = parseISO(data.startDate);
            data.endDate = parseISO(data.endDate);
            return { id: doc.id, ...data };
          }).filter(request => isAfter(request.startDate, twoWeeksAgo));
          setRequests(fetchedRequests);
        }
      }
    };

    fetchManagerAndRequests();
  }, [currentUser]);

  const updateRequestStatus = async (id, newStatus) => {
    const requestRef = doc(db, "vacationRequests", id);
    await updateDoc(requestRef, { status: newStatus });
    setRequests(requests.map(request => request.id === id ? { ...request, status: newStatus } : request));
    onClose();
  };

  const handleOpenModal = (request) => {
    setSelectedRequest(request);
    onOpen();
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case "en attente": return "gray.200";
      case "accepté": return "green.100";
      case "refusé": return "red.100";
      default: return "transparent";
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
                <Td>{format(request.startDate, 'dd/MM/yyyy')}</Td>
                <Td>{format(request.endDate, 'dd/MM/yyyy')}</Td>
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
      ) : <Text>Aucune demande trouvée.</Text>}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Détails de la Demande</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedRequest && (
              <>
                <Text>Nom: {selectedRequest.customerName}</Text>
                <Text>Date de début: {format(selectedRequest.startDate, 'dd/MM/yyyy')}</Text>
                <Text>Date de fin: {format(selectedRequest.endDate, 'dd/MM/yyyy')}</Text>
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

export default VacationRequestsListManager;
