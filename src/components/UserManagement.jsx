import React, { useState, useEffect } from 'react';
import { db, auth } from '../utils/init-firebase';
import { collection, getDocs, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from "firebase/auth";
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
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const fetchedUsers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setUsers(fetchedUsers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      if (formMode === 'add') {
        // Create the user with Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;
        console.log('User created with ID:', userId);
  
        // Store the user data in Firestore with formSubmission flag for new users
        const userData = {
          email,
          employeeNumber,
          managerEmployeeNumber,
          name,
          role,
          formSubmission: true // Indicate this user is created through the form submission
        };
        console.log('User data to be saved:', userData);
        await setDoc(doc(db, "users", userId), userData);
        console.log('User data saved in Firestore for user:', userId);
  
        toast({
          title: "Utilisateur ajouté",
          description: "L'utilisateur a été ajouté avec succès.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } else if (formMode === 'edit' && currentUser) {
        // Update the user data in Firestore with formSubmission flag for edited users
        const userData = {
          email,
          employeeNumber,
          managerEmployeeNumber,
          name,
          role,
          formSubmission: true // Also indicate this for edited users to prevent Cloud Function interference
        };
        console.log('User data to be updated:', userData);
        await updateDoc(doc(db, "users", currentUser.id), userData);
        console.log('User data updated in Firestore for user:', currentUser.id);
  
        toast({
          title: "Utilisateur mis à jour",
          description: "L'utilisateur a été mis à jour avec succès.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error saving user data:', error);
      toast({
        title: "Erreur",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  
    resetForm();
    fetchUsers();
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
    await deleteDoc(doc(db, "users", userId));
    fetchUsers();
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
        employeeNumber,
        managerEmployeeNumber,
        name,
        role,
        csvImport: true // Indicate this user is imported from CSV
      };
      
  
      console.log(`Creating user from CSV data: ${JSON.stringify(userData)}`);
  
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, 'temporary_password');
        const userId = userCredential.user.uid;
        console.log('User created with ID:', userId);
  
        await setDoc(doc(db, "users", userId), userData);
        console.log('User data saved in Firestore for user:', userId);
  
        toast({
          title: "Utilisateur ajouté",
          description: `L'utilisateur ${name} a été ajouté avec succès.`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Error saving user data:', error);
        toast({
          title: "Erreur",
          description: `Erreur lors de l'ajout de l'utilisateur ${name}: ${error.message}`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  
    setCsvData('');
    fetchUsers();
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