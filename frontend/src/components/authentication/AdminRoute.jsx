import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import { InlineMessage } from "../InlineMessage";
import SideMenu from "../SideMenu";
import { useLoginStatus } from "../OnLoginHandler";
import ModalMessage from "../ModalMessage";

const AdminLayout = ({ children }) => (

   <div id="--routes-wrapper" className="container-fluid sidebar p-0 d-flex" >
      <SideMenu />
      <div className="main-panel m-4 w-100">
         <InlineMessage />
         {children}
      </div>
      <ModalMessage />
   </div>
);

export function AdminRoute({ component: Component, ...rest }) {
   const location = useLocation(); 
   const { isAuthenticated, isAuthorized, redirectUrl } = useLoginStatus(rest.location, rest.roles);

   return (
      <Routes>
         <Route
            {...rest}
            render={props => isAuthenticated && isAuthorized ?
               (<AdminLayout><Component {...props} /></AdminLayout>) :
               (<Navigate to={redirectUrl} replace state={{ from: location }} />)
            }
         />
      </Routes>
   );
}
