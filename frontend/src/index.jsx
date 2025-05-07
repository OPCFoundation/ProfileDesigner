import React from 'react';
import ReactDOM from 'react-dom/client'; 

import { MsalProvider } from "@azure/msal-react";

import { LoadingContextProvider } from "./components/contexts/LoadingContext";
import reportWebVitals from './reportWebVitals';

import './index.css';
import App from './App';
import { Msal_Instance } from './Msal_Instance';

//var express = require('express');
//var server = express();
//var options = {
//    index: 'index.html'
//};
//server.use('/', express.static('/home/site/wwwroot', options));
//server.listen(process.env.PORT);

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
   <React.StrictMode>
      <MsalProvider instance={Msal_Instance}>
         <LoadingContextProvider>
            <App />
         </LoadingContextProvider>
      </MsalProvider>
   </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

