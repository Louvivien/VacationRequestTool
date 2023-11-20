// /Users/vivien/Documents/Entreprisedufutur/src/components/OrderForm.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../utils/init-firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Table, Tbody, Tr, Td, Input, Button } from '@chakra-ui/react';


const OrderForm = () => {
  const { currentUser } = useAuth();
  const initialCustomerName = currentUser?.displayName || currentUser?.email || '';

  const [order, setOrder] = useState({
    productName: '',
    quantity: '',
    customerName: initialCustomerName
  });

  useEffect(() => {
    if (currentUser) {
      const nameToUse = currentUser.displayName || currentUser.email;
      setOrder(prevOrder => ({ ...prevOrder, customerName: nameToUse }));
    }
  }, [currentUser]);

  const handleSubmit = async () => {
    if (!order.productName || !order.quantity || !order.customerName) {
      alert('Please fill in all fields');
      return;
    }
  
    try {
      const docRef = await addDoc(collection(db, "orders"), order);
      console.log("Document written with ID: ", docRef.id);
      setOrder({
        productName: '',
        quantity: '',
        customerName: initialCustomerName
      });
      alert('Commande passé avec succés!');
    } catch (e) {
      console.error("Error adding document: ", e);
      alert('Error submitting order. Please try again.');
    }
  };

  return (
    <Table variant="simple" size="sm">
  <Tbody>
    <Tr>
      <Td minWidth="120px">
        <Input
          type="text"
          value={order.productName}
          onChange={(e) => setOrder({ ...order, productName: e.target.value })}
          placeholder="Nom du produit"
          minWidth="150px" // Set a minimum width for the input
        />
      </Td>
      <Td minWidth="50px">
        <Input
          type="number"
          value={order.quantity}
          onChange={(e) => setOrder({ ...order, quantity: e.target.value })}
          placeholder="Quantité"
          minWidth="100px" // Set a minimum width for the input
        />
      </Td>
      <Td minWidth="150px">
        <Input
          type="text"
          value={order.customerName || currentUser?.email || ''}
          readOnly
          placeholder="Nom du client"
          minWidth="150px"
        />
      </Td>
      <Td>
        <Button colorScheme="blue" onClick={handleSubmit}>
          Commander
        </Button>
      </Td>
    </Tr>
  </Tbody>
</Table>

  );
  
};

export default OrderForm;
