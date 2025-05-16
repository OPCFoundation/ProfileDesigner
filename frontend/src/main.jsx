import { StrictMode } from 'react'
import './index.css'
import App from './App.jsx'

import { MsalProvider } from "@azure/msal-react";
import { LoadingContextProvider } from "./components/contexts/LoadingContext";
import React from 'react';
import ReactDOM from 'react-dom/client';
import { EventType } from "@azure/msal-browser";

import { Msal_Instance } from "./Msal_Instance";

Msal_Instance.initialize().then(() => {
   // Default to using the first account if no account is active on page load
   if (!Msal_Instance.getActiveAccount() && Msal_Instance.getAllAccounts().length > 0) {
      // Account selection logic is app dependent. Adjust as needed for different use cases.
      Msal_Instance.setActiveAccount(Msal_Instance.getAllAccounts()[0]);
   }

   // Optional - This will update account state if a user signs in from another tab or window
   Msal_Instance.enableAccountStorageEvents();

   Msal_Instance.addEventCallback((event) => {
      if (event.eventType === EventType.LOGIN_SUCCESS && event.payload.account) {
         const account = event.payload.account;
         Msal_Instance.setActiveAccount(account);
      }
   });

   const container = document.getElementById("root");
   const root = ReactDOM.createRoot(container);

   root.render(
      <StrictMode>
         <MsalProvider instance={Msal_Instance}>
            <LoadingContextProvider>
               <App />
            </LoadingContextProvider>
         </MsalProvider>
      </StrictMode>
   );
});
