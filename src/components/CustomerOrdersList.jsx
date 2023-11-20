// /Users/vivien/Documents/Entreprisedufutur/src/components/CustomerOrdersList.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../utils/init-firebase';
import { query, collection, where, getDocs, addDoc } from 'firebase/firestore';
// import { query, collection, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

import { Table, Thead, Tbody, Tr, Th, Td, Button, Text } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';

const CustomerOrdersList = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchOrders = async () => {
      if (currentUser && isMounted) {
        try {
          // Use displayName if it exists, otherwise fallback to email
          const customerIdentifier = currentUser.displayName || currentUser.email;
          const q = query(collection(db, "orders"), where("customerName", "==", customerIdentifier));
          const querySnapshot = await getDocs(q);
          const fetchedOrders = [];
          querySnapshot.forEach((doc) => {
            fetchedOrders.push({ id: doc.id, ...doc.data() });
          });
          if (isMounted) {
            setOrders(fetchedOrders);
          }
        } catch (error) {
          console.error("Error fetching orders: ", error);
        }
      }
    };
    
    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const handleRenewOrder = async (order) => {
    try {
      const { productName, quantity, customerName } = order;
      await addDoc(collection(db, "orders"), {
        productName,
        quantity,
        customerName
      });
      alert('Commande renouvellée avec succès !');
    } catch (error) {
      console.error("Error renewing order: ", error);
      alert('Error renewing order. Please try again.');
    }
  };

  // const handleDeleteOrder = async (orderId) => {
  //   try {
  //     await deleteDoc(doc(db, "orders", orderId));
  //     alert('Commande supprimée avec succès !');
  //     setOrders(orders.filter(order => order.id !== orderId)); // Update the state to reflect the deletion
  //   } catch (error) {
  //     console.error("Error deleting order: ", error);
  //     alert('Error deleting order. Please try again.');
  //   }
  // };

  return (
    <>
{orders.length > 0 ? (
  <Table variant="simple">
    <Thead>
      <Tr>
        <Th>Nom du produit</Th>
        <Th>Quantité</Th>
        <Th>Nom du client</Th>
        <Th>Actions</Th>
      </Tr>
    </Thead>
    <Tbody>
      {orders.map((order) => (
        <Tr key={order.id}>
          <Td minWidth="150px">
            {order.productName}</Td>
          <Td minWidth="100px">
            {order.quantity}</Td>
          <Td minWidth="150px">
            {order.customerName || currentUser.email}</Td>
          <Td>
            <Button colorScheme='blue'  minWidth="100px" onClick={() => handleRenewOrder(order)}>Renouveller</Button>
            {/* <Button colorScheme='gray' onClick={() => handleDeleteOrder(order.id)} ml={2}>Supprimer</Button> */}
            </Td>
        </Tr>
      ))}
    </Tbody>
  </Table>
) : (
  <Text>Pas de commande trouvée.</Text>
)}



    </>
  );
};

export default CustomerOrdersList;
