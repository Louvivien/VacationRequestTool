import React from 'react';
import { Input, Button, Select, FormControl, FormLabel, VStack } from '@chakra-ui/react';

const UserForm = ({ formMode, email, setEmail, employeeNumber, setEmployeeNumber, managerEmployeeNumber, setManagerEmployeeNumber, name, setName, role, setRole, password, setPassword, handleSubmit, resetForm }) => {
  return (
    <VStack as="form" onSubmit={handleSubmit} spacing={4} p={4} borderWidth="1px" borderRadius="lg" mt={4}>
      <FormControl isRequired>
        <FormLabel>Nom</FormLabel>
        <Input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom" />
      </FormControl>
      <FormControl isRequired>
        <FormLabel>Email</FormLabel>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      </FormControl>
      {formMode === 'add' && (
        <FormControl isRequired>
          <FormLabel>Mot de passe</FormLabel>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" />
        </FormControl>
      )}
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
  );
};

export default UserForm;