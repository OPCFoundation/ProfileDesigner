import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { MsalProvider } from "@azure/msal-react";
import { LoadingContextProvider } from "./components/contexts/LoadingContext";
import { Msal_Instance } from './Msal_Instance';

createRoot(document.getElementById('root')).render(
   <StrictMode>
      <MsalProvider instance={Msal_Instance}>
         <LoadingContextProvider>
            <App />
         </LoadingContextProvider>
      </MsalProvider>
   </StrictMode>
)
