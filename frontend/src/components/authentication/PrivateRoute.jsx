import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import { InlineMessage } from "../InlineMessage";
import SideMenu from "../SideMenu";
import { ImportMessage } from "../ImportMessage";
import DownloadMessage from "../DownloadMessage";
import { useLoginStatus } from "../OnLoginHandler";
import ModalMessage from "../ModalMessage";

const PrivateLayout = ({ children }) => (

   <div id="--routes-wrapper" className="container-fluid sidebar p-0 d-flex" >
      <SideMenu />
      <div className="main-panel m-4 w-100">
         <InlineMessage />
         <ImportMessage />
         <DownloadMessage />
         {children}
      </div>
      <ModalMessage />
   </div>
);

function PrivateRoute({ element: Element, ...rest }) {
   const location = useLocation();
   const { isAuthenticated, isAuthorized, redirectUrl } = useLoginStatus(rest.location, rest.roles);
   return (
      (isAuthenticated && isAuthorized) ?
         (<PrivateLayout>{Element}</PrivateLayout>) :
         (<Navigate to={redirectUrl} replace state={{ from: location }} />)
   );
}

export default PrivateRoute;