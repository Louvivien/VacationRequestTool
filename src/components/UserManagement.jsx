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
    setFormMode('add');
  };


  const addUsersFromCSV = async () => {
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(';');
  
    const emailIndex = headers.indexOf('E-mail');
    const employeeNumberIndex = headers.indexOf('Nº salarié');
    const managerEmployeeNumberIndex = headers.indexOf('Cadre dirigeant'); // Ensure this matches your CSV header for manager employee number
    const nameIndex = headers.indexOf('Nom');
    const firstNameIndex = headers.indexOf('Prénom');
    const roleIndex = headers.indexOf('Role');
  
    // Prepare an array to batch add user creation requests
    const userCreationRequests = [];
  
    for (let i = 1; i < lines.length; i++) {
      const fields = lines[i].split(';');
  
      const email = fields[emailIndex];
      const employeeNumber = fields[employeeNumberIndex];
      const managerEmployeeNumber = fields[managerEmployeeNumberIndex];
      const firstName = fields[firstNameIndex].trim();
      const lastName = fields[nameIndex].trim();
      const name = `${firstName} ${lastName}`; // Correctly combining first name and last name
      const roleRaw = fields[roleIndex].trim().toUpperCase(); // Ensure case-insensitive comparison
      const role = roleRaw === 'UTILISATEUR' ? 'user' : (roleRaw === 'MANAGER' ? 'manager' : 'user'); // Default to 'user' if not matching
  
      const userData = {
        email,
        password: 'temporary_password', // Consider security implications and handling
        employeeNumber,
        managerEmployeeNumber,
        name,
        role,
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
  
    setCsvData('');
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
        handleSubmit={handleSubmit}
        resetForm={resetForm}
      />
      <UserList users={users} handleEdit={handleEdit} handleDelete={handleDelete} />
    </Container>
  );
};

export default UserManagement;