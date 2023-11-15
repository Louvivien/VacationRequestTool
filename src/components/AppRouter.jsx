import React from 'react'
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ForgotPasswordPage from '../pages/ForgotPasswordPage'
import Homepage from '../pages/Homepage'
import Loginpage from '../pages/Loginpage'
import NotfoundPage from '../pages/NotfoundPage'
import Profilepage from '../pages/Profilepage'
import Registerpage from '../pages/Registerpage'
import ResetPasswordPage from '../pages/ResetPasswordPage'
import TestPage from '../pages/TestPage'
import OrderPage from '../pages/OrderPage';
import CustomerOrdersPage from '../pages/CustomerOrdersPage';




export default function AppRouter(props) {
  return (
    <>
      <Router>
        <Switch>
          <Route exact path='/' component={Homepage} />
          <ProtectedRoute exact path='/login' component={Loginpage} />
          <ProtectedRoute exact path='/register' component={Registerpage} />
          <ProtectedRoute exact path='/profile' component={Profilepage} />
          <ProtectedRoute exact path='/test' component={TestPage} />
          <ProtectedRoute exact path='/order' component={OrderPage} />
          <ProtectedRoute exact path='/orders' component={CustomerOrdersPage} />

          <ProtectedRoute
            exact
            path='/forgot-password'
            component={ForgotPasswordPage}
          />
          <ProtectedRoute
            exact
            path='/reset-password'
            component={ResetPasswordPage}
          />
          <Route exact path='*' component={NotfoundPage} />
        </Switch>
      </Router>
    </>
  )
}
function ProtectedRoute(props) {
  const { currentUser } = useAuth();
  const { path } = props;

  // Redirect to /orders after login
  if (path === '/login') {
    return currentUser ? <Redirect to="/" /> : <Route {...props} />;
  }

  // Redirect to /order after registration
  if (path === '/register') {
    return currentUser ? <Redirect to="/" /> : <Route {...props} />;
  }

  // For other public routes like forgot-password and reset-password
  if (path === '/forgot-password' || path === '/reset-password') {
    return currentUser ? <Redirect to="/profile" /> : <Route {...props} />;
  }

  // Protected Routes for Authenticated Users
  return currentUser ? <Route {...props} /> : <Redirect to="/login" />;
}

