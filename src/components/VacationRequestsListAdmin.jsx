import React, { useState, useEffect } from 'react';
import { db } from '../utils/init-firebase';
import { query, collection, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { Table, Thead, Tbody, Tr, Th, Td, Button, Text, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalCloseButton, ModalBody, Box, Icon } from '@chakra-ui/react';
import { FaCalendarAlt } from 'react-icons/fa';
import { format } from 'date-fns';

const VacationRequestsListAdmin = () => {
  const [requests, setRequests] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const q = query(collection(db, "vacationRequests"), orderBy("startDate"));
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
    await updateDoc(requestRef, {
      status: newStatus
    });
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
        return "gray.200";
      case "accepté":
        return "green.100";
      case "refusé":
        return "red.100";
      default:
        return "transparent";
    }
  };

  const generateIcsFile = (request) => {
    const startDate = format(new Date(request.startDate), 'yyyyMMdd');
    const endDate = format(new Date(request.endDate), 'yyyyMMdd');
    const summary = `Congé de ${request.customerName}`;
    let description = `Type de congé: ${getLeaveTypeDescription(request)}`;
    description += `\nAutres informations: ${request.otherLeave || "N/A"}`;

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//hacksw/handcal//NONSGML v1.0//EN
BEGIN:VEVENT
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${summary}
DESCRIPTION:${description.replace(/\n/g, "\\n")}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${summary}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getLeaveTypeDescription = (request) => {
    const types = [];
    if (request.paidLeave) types.push("Congés Payés");
    if (request.unpaidLeave) types.push("Sans solde");
    if (request.nonWorkingDay) types.push("Jour non travaillé");
    if (request.training) types.push("Formation");
    if (request.sickness) types.push("Maladie");
    if (request.medicalVisit) types.push("Visite médicale");
    if (request.unjustifiedAbsence) types.push("Absence non justifiée");
    if (request.specialLeave) types.push("Congé spécial");
    return types.join(", ") || "Autres";
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
              <Th>Calendrier</Th>
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
                <Td>
                  <Icon as={FaCalendarAlt} boxSize={6} cursor="pointer" onClick={() => generateIcsFile(request)} />
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
                <Text>Nombre jours ouvrés: {selectedRequest.totalDays || "N/A"}</Text>
                <Text>Type de congé: {getLeaveTypeDescription(selectedRequest)}</Text>
                <Text>Autres informations: {selectedRequest.otherLeave || "N/A"}</Text>
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
