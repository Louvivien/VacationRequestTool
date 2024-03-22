import React, { useState, useEffect } from 'react';
import { db } from '../utils/init-firebase';
import { collection, updateDoc, doc, setDoc, addDoc, onSnapshot } from 'firebase/firestore';
import { Container, useToast } from '@chakra-ui/react';
import UserList from './UserList';
import UserForm from './UserForm';
import CSVImporter from './CSVImporter';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [formMode, setFormMode] = useState('add');
  const toast = useToast();
  const [csvData, setCsvData] = useState('');

  // Form fields
  const [email, setEmail] = useState('');
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [managerEmployeeNumber, setManagerEmployeeNumber] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');
  const [password, setPassword] = useState('');
  const [service, setService] = useState(''); // Add service state

  useEffect(() => {
    // Set up a real-time listener for the users collection
    const unsubscribe = onSnapshot(collection(db, "users"), (querySnapshot) => {
      const fetchedUsers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(fetchedUsers);
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formMode === 'add') {
      // Prepare the user data for the Firestore collection
      const userCreationRequest = {
        email,
        password, // Note: Be cautious with storing passwords in Firestore
        employeeNumber,
        managerEmployeeNumber,
        name,
        role,
        service, // Include the service field
        formSubmission: true // Indicate this user is created through the form submission
      };

      try {
        // Add a document to `userCreationRequests` collection instead of creating the user directly
        await addDoc(collection(db, "userCreationRequests"), userCreationRequest);
        console.log('User creation request added');

        toast({
          title: "Demande de création d'utilisateur ajoutée",
          description: "La demande de création de l'utilisateur a été ajoutée avec succès.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Error submitting user creation request:', error);
        toast({
          title: "Erreur",
          description: `Erreur lors de l'ajout de la demande de création de l'utilisateur: ${error.message}`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } else if (formMode === 'edit' && currentUser) {
      // Handle user data update for edited users
      const userData = {
        email,
        employeeNumber,
        managerEmployeeNumber,
        name,
        role,
        service, // Include the service field
        formSubmission: true // Also indicate this for edited users to prevent Cloud Function interference
      };
      try {
        await updateDoc(doc(db, "users", currentUser.id), userData);
        console.log('User data updated in Firestore for user:', currentUser.id);

        toast({
          title: "Utilisateur mis à jour",
          description: "L'utilisateur a été mis à jour avec succès.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Error updating user data:', error);
        toast({
          title: "Erreur",
          description: `Erreur lors de la mise à jour de l'utilisateur: ${error.message}`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }

    resetForm();
  };

  const handleEdit = (user) => {
    setCurrentUser(user);
    setEmail(user.email);
    setEmployeeNumber(user.employeeNumber || '');
    setManagerEmployeeNumber(user.managerEmployeeNumber || '');
    setName(user.name || '');
    setRole(user.role);
    setService(user.service || ''); // Set the service field
    setFormMode('edit');
  };

  const handleDelete = async (userId) => {
    try {
      // Add a document to `userDeletionRequests` collection with the userId as the document ID
      await setDoc(doc(db, "userDeletionRequests", userId), { timestamp: new Date() });
      console.log(`Deletion request for user ${userId} added.`);

      toast({
        title: "Demande de suppression envoyée",
        description: "La demande de suppression de l'utilisateur a été envoyée avec succès.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error(`Error requesting deletion for user ${userId}:`, error);
      toast({
        title: "Erreur",
        description: `Erreur lors de la demande de suppression de l'utilisateur: ${error.message}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const resetForm = () => {
    setCurrentUser(null);
    setEmail('');
    setEmployeeNumber('');
    setManagerEmployeeNumber('');
    setName('');
    setRole('user');
    setPassword('');
    setService(''); // Reset the service field
    setFormMode('add');
  };

  const addUsersFromCSV = async () => {
    const lines = csvData.trim().split('\n');
    if (lines.length === 0) {
      toast({
        title: "Erreur de chargement CSV",
        description: "Le fichier CSV est vide.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const headers = lines[0].split(';');
    // Define the expected headers
    const expectedHeaders = [
      "Nº salarié", "Nom", "Prénom", "Code salarié", "Cadre Dirigeant", "Equipe",
      "Service", "Agence", "Cadre dirigeant", "E-mail", "Secteur Cial", "Role"
    ];

    // Check if the headers match the expected headers
    const isValidFormat = expectedHeaders.every((header, index) => headers[index] === header);

    if (!isValidFormat) {
      toast({
        title: "Erreur de format CSV",
        description: "Le format du fichier CSV est invalide. Assurez-vous d'utiliser le format correct: " + expectedHeaders.join("; "),
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      return; // Stop execution if the format is invalid
    }

    // Prepare an array to batch add user creation requests
    const userCreationRequests = [];

    for (let i = 1; i < lines.length; i++) {
      const fields = lines[i].split(';');

      // Extracting fields based on expected headers
      const email = fields[headers.indexOf('E-mail')];
      const employeeNumber = fields[headers.indexOf('Nº salarié')];
      const managerEmployeeNumber = fields[headers.indexOf('Cadre dirigeant')];
      const firstName = fields[headers.indexOf('Prénom')].trim();
      const lastName = fields[headers.indexOf('Nom')].trim();
      const name = `${firstName} ${lastName}`; // Correctly combining first name and last name
      const roleRaw = fields[headers.indexOf('Role')].trim().toUpperCase(); // Ensure case-insensitive comparison
      const role = roleRaw === 'UTILISATEUR' ? 'user' : (roleRaw === 'MANAGER' ? 'manager' : 'user'); // Default to 'user' if not matching
      const service = fields[headers.indexOf('Service')]; // Get the service field

      const userData = {
        email,
        password: 'temporary_password', // Consider security implications and handling
        employeeNumber,
        managerEmployeeNumber,
        name,
        role,
        service, // Include the service field
        csvImport: true // Indicate this user is imported from CSV
      };

      userCreationRequests.push(userData);
    }

    // Add user creation requests to Firestore
    try {
      const userCreationRequestsCollection = collection(db, "userCreationRequests");
      for (const userData of userCreationRequests) {
        await addDoc(userCreationRequestsCollection, userData);
      }
      console.log('User creation requests added for CSV import');

      toast({
        title: "Importation CSV",
        description: "Les demandes de création d'utilisateur pour l'importation CSV ont été ajoutées avec succès.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error submitting user creation requests from CSV:', error);
      toast({
        title: "Erreur",
        description: `Erreur lors de l'ajout des demandes de création d'utilisateur pour l'importation CSV: ${error.message}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }

    setCsvData(''); // Clear the CSV data after processing
  };

  return (
    <Container maxW="container.xl">
      <CSVImporter csvData={csvData} setCsvData={setCsvData} addUsersFromCSV={addUsersFromCSV} />
      <UserForm
        formMode={formMode}
        email={email}
        setEmail={setEmail}
        employeeNumber={employeeNumber}
        setEmployeeNumber={setEmployeeNumber}
        managerEmployeeNumber={managerEmployeeNumber}
        setManagerEmployeeNumber={setManagerEmployeeNumber}
        name={name}
        setName={setName}
        role={role}
        setRole={setRole}
        password={password}
        setPassword={setPassword}
        service={service} // Add the service field
        setService={setService} // Add the setService function
        handleSubmit={handleSubmit}
        resetForm={resetForm}
      />
      <UserList users={users} handleEdit={handleEdit} handleDelete={handleDelete} />
    </Container>
  );
};

export default UserManagement;