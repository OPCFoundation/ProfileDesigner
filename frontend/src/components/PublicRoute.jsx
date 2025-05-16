import React from "react";
import { Routes, Route } from "react-router-dom";
import { InlineMessage } from "./InlineMessage";
import ModalMessage from "./ModalMessage";


const SimpleLayout = ({ children }) => (

   <div id="--routes-wrapper" className="container-fluid" >
      <div className="main-panel m-4">
         <InlineMessage />
         {children}
      </div>
      <ModalMessage />
   </div>
);

export const SimpleFixedLayout = ({ children }) => (

   <div id="--routes-wrapper" className="container" >
      <div className="main-panel m-4">
         <InlineMessage />
         {children}
      </div>
      <ModalMessage />
   </div>
);

export function PublicRoute({ element: Element, ...rest }) {
   return (
      <SimpleLayout>{Element}</SimpleLayout>
   );
}

///fixed means the width is fixed rather than comsuming the entire width
export function PublicFixedRoute({ element: Element, ...rest }) {

   return (
      <SimpleFixedLayout>{Element}</SimpleFixedLayout>
   );
}


