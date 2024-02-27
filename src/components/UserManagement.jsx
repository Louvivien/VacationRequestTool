import React, { useState, useEffect } from 'react';
import { db } from '../utils/init-firebase';
import { collection, getDocs, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore'; // Ensure setDoc is imported
import { createUserWithEmailAndPassword } from "firebase/auth"; // Import Firebase auth functions
import { auth } from '../utils/init-firebase'; // Ensure you import your Firebase auth instance
import {
  Input,
  Button,
  Select,
  FormControl,
  FormLabel,
  Container,
  VStack,
  HStack,
  List,
  ListItem,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { FaEdit, FaTrash } from 'react-icons/fa';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [formMode, setFormMode] = useState('add');
  const toast = useToast();

  // Form fields
  const [email, setEmail] = useState('');
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [managerEmployeeNumber, setManagerEmployeeNumber] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');

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
  
    // Immediately capture form data to ensure it's not affected by async operations
    const capturedData = { 
      email, 
      employeeNumber, 
      managerEmployeeNumber, 
      name, 
      role 
    };
  
    try {
      if (formMode === 'add') {
        // Create the user with Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, capturedData.email, "test123");
  
        // Ensure capturedData is used here directly
        await setDoc(doc(db, "users", userCredential.user.uid), capturedData);
  
        toast({
          title: "Utilisateur ajouté",
          description: "L'utilisateur a été ajouté avec succès.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } else if (formMode === 'edit' && currentUser) {
        // Use capturedData for consistency
        await updateDoc(doc(db, "users", currentUser.id), capturedData);
  
        toast({
          title: "Utilisateur mis à jour",
          description: "L'utilisateur a été mis à jour avec succès.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
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
    setEmployeeNumber(user.employeeNumber);
    setManagerEmployeeNumber(user.managerEmployeeNumber);
    setName(user.name);
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
    setFormMode('add');
  };

  return (
    <Container maxW="container.xl">
      <VStack as="form" onSubmit={handleSubmit} spacing={4} p={4} borderWidth="1px" borderRadius="lg">
        <FormControl isRequired>
          <FormLabel>Nom</FormLabel>
          <Input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom" />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Email</FormLabel>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Numéro d'employé</FormLabel>
          <Input type="text" value={employeeNumber} onChange={(e) => setEmployeeNumber(e.target.value)} placeholder="Numéro d'employé" />
        </FormControl>
        <FormControl>
          <FormLabel>Numéro manager</FormLabel>
          <Input type="text" value={managerEmployeeNumber} onChange={(e) => setManagerEmployeeNumber(e.target.value)} placeholder="Numéro manager" />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Rôle</FormLabel>
          <Select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">Utilisateur</option>
            <option value="admin">Administrateur</option>
            <option value="manager">Manager</option>
          </Select>
        </FormControl>
        <Button type="submit" colorScheme={formMode === 'add' ? "blue" : "orange"}>
          {formMode === 'add' ? 'Ajouter' : 'Mettre à jour'}
        </Button>
        {formMode === 'edit' && <Button onClick={resetForm} colorScheme="gray">Annuler</Button>}
      </VStack>
      <List spacing={3} my={4}>
        {users.map((user) => (
          <ListItem key={user.id} d="flex" justifyContent="space-between" alignItems="center">
            {`${user.name} (${user.email}) - ${user.role}`}
            <HStack>
              <IconButton icon={<FaEdit />} aria-label="Edit" onClick={() => handleEdit(user)} colorScheme="yellow" />
              <IconButton icon={<FaTrash />} aria-label="Delete" onClick={() => handleDelete(user.id)} colorScheme="red" />
            </HStack>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default UserManagement;