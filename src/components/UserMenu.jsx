// /Users/vivien/Documents/Entreprisedufutur/src/components/UserMenu.jsx

import React from 'react';
import { Menu, MenuButton, MenuList, MenuItem, Button } from '@chakra-ui/react';
import { FaChevronDown } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const UserMenu = () => {
  return (
    <Menu>
    <MenuButton as={Button} rightIcon={<FaChevronDown />}>
    Actions
    </MenuButton>
      <MenuList>
        <MenuItem as={Link} to="/orders">Mes commandes</MenuItem>
        <MenuItem as={Link} to="/order">Créer une commande</MenuItem>
        <MenuItem as={Link} to="/profile">Mon profil</MenuItem>
        <MenuItem as={Link} to="/reset-password">Changer de mot de passe</MenuItem>
        <MenuItem as={Link} to="/forgot-password">Mot de passe oublié</MenuItem>
        {/* <MenuItem as={Link} to="/test">Test Page</MenuItem> */}
      </MenuList>
    </Menu>
  );
};

export default UserMenu;
