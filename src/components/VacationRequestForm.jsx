// /Users/vivien/Documents/Entreprisedufutur/src/components/VacationRequestForm.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../utils/init-firebase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Input, Button, Checkbox, VStack, Text } from '@chakra-ui/react';

const VacationRequestForm = () => {
  const { currentUser, userRole } = useAuth(); // Assuming `userRole` is available from `useAuth`
  const initialCustomerName = currentUser?.displayName || currentUser?.email || '';
  const [userDetails, setUserDetails] = useState({
    employeeNumber: '',
    managerEmployeeNumber: ''
  });

  const [request, setRequest] = useState({
    customerName: initialCustomerName,
    startDate: '',
    endDate: '',
    totalDays: '',
    paidLeave: false,
    unpaidLeave: false,
    otherLeave: '',
    status: 'en attente',
    // Additional fields for admin
    nonWorkingDay: false,
    training: false,
    sickness: false,
    medicalVisit: false,
    unjustifiedAbsence: false,
    specialLeave: false,
  });

  useEffect(() => {
    if (currentUser) {
      const userDocRef = doc(db, "users", currentUser.uid);
      getDoc(userDocRef).then(userDoc => {
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserDetails({
            employeeNumber: userData.employeeNumber,
            managerEmployeeNumber: userData.managerEmployeeNumber
          });
          // Update request with user details, if necessary
          setRequest(prevRequest => ({
            ...prevRequest,
            customerName: userData.name || userData.displayName || userData.email || initialCustomerName,
          }));
        }
      });
    }
  }, [currentUser, initialCustomerName]);
  

  const handleSubmit = async () => {
    if (!request.startDate || !request.endDate || !request.totalDays) {
      alert('Merci de remplir tous les champs nécessaires');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "vacationRequests"), {
        ...request,
        ...userDetails, // Include employeeNumber and managerEmployeeNumber
        status: 'en attente'
      });
      console.log("Document written with ID: ", docRef.id);
      alert('Demande de congés envoyée avec succès!');
      setRequest({
        customerName: initialCustomerName,
        startDate: '',
        endDate: '',
        totalDays: '',
        paidLeave: false,
        unpaidLeave: false,
        otherLeave: '',
        status: 'en attente'
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

      {/* Admin-specific fields, rendered based on the user role */}
      {userRole === 'admin' && (
        <VStack spacing={3}>
          <Text fontWeight="bold">Options réservées à l'admin :</Text>
          <Checkbox isChecked={request.nonWorkingDay} onChange={(e) => setRequest({...request, nonWorkingDay: e.target.checked})}>Jour non travaillé</Checkbox>
          <Checkbox isChecked={request.training} onChange={(e) => setRequest({...request, training: e.target.checked})}>Formation</Checkbox>
          <Checkbox isChecked={request.sickness} onChange={(e) => setRequest({...request, sickness: e.target.checked})}>Maladie</Checkbox>
          <Checkbox isChecked={request.medicalVisit} onChange={(e) => setRequest({...request, medicalVisit: e.target.checked})}>Visite médicale</Checkbox>
          <Checkbox isChecked={request.unjustifiedAbsence} onChange={(e) => setRequest({...request, unjustifiedAbsence: e.target.checked})}>Absence non justifiée</Checkbox>
          <Checkbox isChecked={request.specialLeave} onChange={(e) => setRequest({...request, specialLeave: e.target.checked})}>Congé spécial</Checkbox>
        </VStack>
      )}


      <Button colorScheme="blue" onClick={handleSubmit}>
        Demander
      </Button>
    </VStack>
  );
};

export default VacationRequestForm;


