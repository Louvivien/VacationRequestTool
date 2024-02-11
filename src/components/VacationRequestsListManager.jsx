import React, { useState, useEffect } from 'react';
import { db } from '../utils/init-firebase';
import { query, collection, getDocs, doc, updateDoc, where, getDoc } from 'firebase/firestore'; // Added getDoc here
import { Table, Thead, Tbody, Tr, Th, Td, Button, Text, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Box, ModalFooter } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';

const VacationRequestsListAdmin = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [managerEmployeeNumber, setManagerEmployeeNumber] = useState('');

  useEffect(() => {
    const fetchManagerInfo = async () => {
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid); // Correct reference to a single document
        const docSnap = await getDoc(userRef); // Correct use of getDoc for a single document
        if (docSnap.exists()) {
          setManagerEmployeeNumber(docSnap.data().employeeNumber);
        } else {
          console.log("No such document!");
        }
      }
    };
  
    fetchManagerInfo();
  }, [currentUser]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        let q;
        if (managerEmployeeNumber) {
          q = query(collection(db, "vacationRequests"), where("managerEmployeeNumber", "==", managerEmployeeNumber));
        } else {
          // Fallback to a default query if no managerEmployeeNumber is set
          q = query(collection(db, "vacationRequests"));
        }
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

    if (managerEmployeeNumber) {
      fetchRequests();
    }
  }, [managerEmployeeNumber]);


  const updateRequestStatus = async (id, newStatus) => {
    const requestRef = doc(db, "vacationRequests", id);
    await updateDoc(requestRef, {
      status: newStatus
    });
    // Update UI after status change
    setRequests(requests.map(request => request.id === id ? { ...request, status: newStatus } : request));
    onClose(); // Close the modal after updating
  };

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
                <Text>Date de début: {selectedRequest.startDate}</Text>
                <Text>Date de fin: {selectedRequest.endDate}</Text>
                <Text>Solde congés payés (jours ouvrés): {selectedRequest.paidLeaveBalance}</Text>
                <Text>Type de congé: {selectedRequest.paidLeave ? "Congés Payés" : (selectedRequest.unpaidLeave ? "Sans solde" : "Autres")}</Text>
                <Text>Statut: {selectedRequest.status}</Text>
                <Text>Autres informations: {selectedRequest.otherLeave}</Text>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" mr={3} onClick={() => updateRequestStatus(selectedRequest.id, "accepté")}>
              Accepter
            </Button>
            <Button colorScheme="red" onClick={() => updateRequestStatus(selectedRequest.id, "refusé")}>
              Refuser
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default VacationRequestsListAdmin;





