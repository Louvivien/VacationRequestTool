import React, { useState, useEffect } from 'react';
import { db } from '../utils/init-firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null); // For add/edit form
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'

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
    const userData = { email, employeeNumber, managerEmployeeNumber, name, role };

    if (formMode === 'add') {
      await addDoc(collection(db, "users"), userData);
    } else if (formMode === 'edit' && currentUser) {
      await updateDoc(doc(db, "users", currentUser.id), userData);
    }

    resetForm();
    fetchUsers(); // Refresh the list
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
    fetchUsers(); // Refresh the list
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
    <div>
      <h2>User Management</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input type="text" value={employeeNumber} onChange={(e) => setEmployeeNumber(e.target.value)} placeholder="Employee Number" required />
        <input type="text" value={managerEmployeeNumber} onChange={(e) => setManagerEmployeeNumber(e.target.value)} placeholder="Manager Employee Number" />
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
        </select>
        <button type="submit">{formMode === 'add' ? 'Add User' : 'Update User'}</button>
        {formMode === 'edit' && <button type="button" onClick={resetForm}>Cancel Edit</button>}
      </form>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name} ({user.email}) - {user.role}
            <button onClick={() => handleEdit(user)}>Edit</button>
            <button onClick={() => handleDelete(user.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserManagement;
