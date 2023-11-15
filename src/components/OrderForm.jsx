// /Users/vivien/Documents/Entreprisedufutur/src/components/OrderForm.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../utils/init-firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@chakra-ui/react';


const OrderForm = () => {
  const { currentUser } = useAuth();
  const initialCustomerName = currentUser?.displayName || '';

  const [order, setOrder] = useState({
    productName: '',
    quantity: '',
    customerName: initialCustomerName
  });

  useEffect(() => {
    if (currentUser && currentUser.displayName) {
      setOrder(prevOrder => ({ ...prevOrder, customerName: currentUser.displayName }));
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
      alert('Order submitted successfully!');
    } catch (e) {
      console.error("Error adding document: ", e);
      alert('Error submitting order. Please try again.');
    }
  };

  return (
    <div>
      <input 
        type="text" 
        value={order.productName} 
        onChange={(e) => setOrder({ ...order, productName: e.target.value })} 
        placeholder="Product Name"
      />
      <input 
        type="number" 
        value={order.quantity} 
        onChange={(e) => setOrder({ ...order, quantity: e.target.value })} 
        placeholder="Quantity"
      />
      <input 
        type="text" 
        value={order.customerName} 
        readOnly 
        placeholder="Customer Name"
      />
      <Button colorScheme='blue' onClick={handleSubmit}>Submit Order</Button>

    </div>
  );
};

export default OrderForm;
