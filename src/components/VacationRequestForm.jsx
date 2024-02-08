// /Users/vivien/Documents/Entreprisedufutur/src/components/VacationRequestForm.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../utils/init-firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Input, Button, Checkbox, VStack, Text } from '@chakra-ui/react';

const VacationRequestForm = () => {
  const { currentUser } = useAuth();
  const initialCustomerName = currentUser?.displayName || currentUser?.email || '';

  const [request, setRequest] = useState({
    customerName: initialCustomerName,
    entryDate: '',
    paidLeaveBalance: '',
    startDate: '',
    endDate: '',
    totalDays: '',
    paidLeave: false,
    unpaidLeave: false,
    otherLeave: '',
    status: 'en attente' // Initialize status with 'en attente'
  });

  useEffect(() => {
    if (currentUser) {
      const nameToUse = currentUser.displayName || currentUser.email;
      setRequest(prevRequest => ({ ...prevRequest, customerName: nameToUse }));
    }
  }, [currentUser]);

  const handleSubmit = async () => {
    // Validation checks
    if (!request.entryDate || !request.startDate || !request.endDate || !request.totalDays) {
      alert('Merci de remplir tous les champs nécessaires');
      return;
    }

    try {
      // Include the status field when adding the document
      const docRef = await addDoc(collection(db, "vacationRequests"), {
        ...request,
        status: 'en attente' // Ensure status is set to 'en attente' when creating the document
      });
      console.log("Document written with ID: ", docRef.id);
      alert('Demande de congés envoyée avec succès!');
      // Reset form after successful submission, including resetting status if needed
      setRequest({
        customerName: initialCustomerName,
        entryDate: '',
        paidLeaveBalance: '',
        startDate: '',
        endDate: '',
        totalDays: '',
        paidLeave: false,
        unpaidLeave: false,
        otherLeave: '',
        status: 'en attente' // Reset status to 'en attente'
      });
    } catch (e) {
      console.error("Error adding document: ", e);
      alert('Erreur lors de la soumission de la demande. Veuillez réessayer.');
    }
  };

  return (
    <VStack spacing={4}>
      <Input
        type="text"
        value={request.customerName}
        readOnly
        placeholder="Nom du client"
      />
      <Text>Date d'entrée dans l'entreprise :</Text>
      <Input
        type="date"
        value={request.entryDate}
        onChange={(e) => setRequest({ ...request, entryDate: e.target.value })}
        placeholder="Date entrée"
      />

      <Input
        type="number"
        value={request.paidLeaveBalance}
        onChange={(e) => setRequest({ ...request, paidLeaveBalance: e.target.value })}
        placeholder="Solde congés payés (jours ouvrés)"
      />

      <h3>Dates des congés demandés :</h3>
      <Text>Date de début (au matin) :</Text>
      <Input
        type="date"
        value={request.startDate}
        onChange={(e) => setRequest({ ...request, startDate: e.target.value })}
        placeholder="Date de début"
      />
      <Text>Date de fin (au soir) :</Text>
      <Input
        type="date"
        value={request.endDate}
        onChange={(e) => setRequest({ ...request, endDate: e.target.value })}
        placeholder="Date de fin"
      />
      <Input
        type="number"
        value={request.totalDays}
        onChange={(e) => setRequest({ ...request, totalDays: e.target.value })}
        placeholder="Soit un nombre de jour(s) ouvré(s) de :"
      />

      <h3>Nature des congés demandés :</h3>
      <Checkbox
        isChecked={request.paidLeave}
        onChange={(e) => setRequest({ ...request, paidLeave: e.target.checked })}
      >
        Congés Payés
      </Checkbox>
      <Checkbox
        isChecked={request.unpaidLeave}
        onChange={(e) => setRequest({ ...request, unpaidLeave: e.target.checked })}
      >
        Sans solde
      </Checkbox>
      <Input
        type="text"
        value={request.otherLeave}
        onChange={(e) => setRequest({ ...request, otherLeave: e.target.value })}
        placeholder="Autres"
      />

      <Button colorScheme="blue" onClick={handleSubmit}>
        Demander
      </Button>
    </VStack>
  );
};

export default VacationRequestForm;
