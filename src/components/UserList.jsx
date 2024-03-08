import React from 'react';
import { List, ListItem, IconButton, HStack } from '@chakra-ui/react';
import { FaEdit, FaTrash } from 'react-icons/fa';

const UserList = ({ users, handleEdit, handleDelete }) => {
  return (
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
  );
};

export default UserList;