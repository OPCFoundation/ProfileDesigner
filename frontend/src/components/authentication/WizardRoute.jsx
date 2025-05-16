import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import { InlineMessage } from "../InlineMessage";
import SideMenu from "../SideMenu";
import { ImportMessage } from "../ImportMessage";
import DownloadMessage from "../DownloadMessage";
import { WizardContextProvider } from "../contexts/WizardContext";
import WizardMaster from "../../views/shared/WizardMaster";
import { useLoginStatus } from "../OnLoginHandler";
import ModalMessage from "../ModalMessage";

const WizardLayout = ({ children }) => (

   <div id="--routes-wrapper" className="container-fluid sidebar p-0 d-flex" >
      <SideMenu />
      <div className="main-panel m-4 w-100">
         <InlineMessage />
         <ImportMessage />
         <DownloadMessage />
         <WizardContextProvider>
            <WizardMaster>
               {children}
            </WizardMaster>
         </WizardContextProvider>
      </div>
      <ModalMessage />
   </div>
);

function WizardRoute({ element: Element, ...rest }) {
   const location = useLocation();
   const { isAuthenticated, isAuthorized, redirectUrl } = useLoginStatus(rest.location, rest.roles);

   return (
      (isAuthenticated && isAuthorized) ?
      (<WizardLayout>{Element}</WizardLayout>) :
      (<Navigate to={redirectUrl} replace state={{ from: location }} />)
   );
}

export default WizardRoute;