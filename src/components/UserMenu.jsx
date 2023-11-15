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
        <MenuItem as={Link} to="/orders">My orders</MenuItem>
        <MenuItem as={Link} to="/order">Create an order</MenuItem>
        <MenuItem as={Link} to="/profile">Profile page</MenuItem>
        <MenuItem as={Link} to="/reset-password">Reset my password</MenuItem>
        <MenuItem as={Link} to="/forgot-password">Forgot my password</MenuItem>
        <MenuItem as={Link} to="/test">Test Page</MenuItem>
      </MenuList>
    </Menu>
  );
};

export default UserMenu;
