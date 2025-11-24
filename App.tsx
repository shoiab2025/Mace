// App.js
import React from 'react';
import { StatusBar } from 'react-native';
import RootNavigator from './navigation/Rootnavigator';
import {AuthProvider} from './navigation/AuthContext'
const App = () => {
  return (
    <AuthProvider>      
      <StatusBar barStyle="light-content" backgroundColor="#6200ee" />
      <RootNavigator />
    </AuthProvider>
  );
};

export default App;