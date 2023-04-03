import React from 'react';
import { store } from "./Redux/store";
import { Provider } from "react-redux";
import AppNavigator from './Routes/AppNavigator';

function App() {
  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
}

export default App;
