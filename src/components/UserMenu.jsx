import React, { useState, useEffect } from 'react';
import { Menu, MenuButton, MenuList, MenuItem, Button } from '@chakra-ui/react';
import { FaChevronDown } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../utils/init-firebase';
import { doc, getDoc } from 'firebase/firestore';

const UserMenu = () => {
  const { currentUser } = useAuth();
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const fetchUserRole = async () => {
      if (currentUser) {
        // Assuming user roles are stored in a document in the 'users' collection with the same ID as the user
        const userRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          // Assuming the role is stored in the 'role' field
          setUserRole(docSnap.data().role);
        }
      }
    };

    fetchUserRole();
  }, [currentUser]);

  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<FaChevronDown />} minW="fit-content">
        Actions
      </MenuButton>
      <MenuList>
        <MenuItem as={Link} to="/">Accueil</MenuItem>
        <MenuItem as={Link} to="/orders">Mes demandes</MenuItem>
        <MenuItem as={Link} to="/order">Faire une demande</MenuItem>
        <MenuItem as={Link} to="/calendar">Consulter le calendrier</MenuItem>
        <MenuItem as={Link} to="/profile">Mon profil</MenuItem>
        {userRole === 'admin' && (
          <MenuItem as={Link} to="/users">Gestion des utilisateurs</MenuItem>
        )}
        {userRole === 'admin' && (
          <MenuItem as={Link} to="/organizational">Organigramme</MenuItem>
        )}
        {currentUser?.displayName == null && (
          <MenuItem as={Link} to="/forgot-password">Mot de passe oublié</MenuItem>
        )}
      </MenuList>
    </Menu>
  );
};

export default UserMenu;
