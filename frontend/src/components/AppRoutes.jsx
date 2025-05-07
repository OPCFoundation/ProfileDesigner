import React from 'react'
import { Routes, Route } from 'react-router-dom';

//common components
import PrivateRoute from './authentication/PrivateRoute'
import WizardRoute from './authentication/WizardRoute'
import { AdminRoute } from './authentication/AdminRoute'
import { PublicFixedRoute } from './PublicRoute'
//import LoginSuccessRoute from './authentication/LoginSuccessRoute'

//page level imports
import ProfileTypeDefinitionList from "../views/ProfileTypeDefinitionList"
import ProfileTypeDefinitionEntity from "../views/ProfileTypeDefinitionEntity"
//wizard pages
import WizardWelcome from "../views/WizardWelcome"
import WizardNewProfile from "../views/WizardNewProfile"
import WizardImportProfile from '../views/WizardImportProfile'
import WizardSelectProfile from "../views/WizardSelectProfile"
import WizardSelectBaseType from "../views/WizardSelectBaseType"
import WizardFilterProfile from '../views/WizardFilterProfile'

import PageNotFound from "../views/PageNotFound"
import ProfileList from '../views/ProfileList'
import ProfileEntity from '../views/ProfileEntity'
import CloudLibList from '../views/CloudLibList'
import CloudLibViewer from '../views/CloudLibViewer'
import AdminUserEntity from '../views/admin/AdminUserEntity'
import AdminUserList from '../views/admin/AdminUserList'
import AdminCloudLibApprovalList from '../views/admin/AdminCloudLibApprovalList'
import Login from '../views/Login'
import NotAuthorized from '../views/NotAuthorized'
import LoginSuccess from '../views/LoginSuccess'
import { AppSettings } from '../utils/appsettings'
//import LoginSuccess from '../views/LoginSuccess'

//const CLASS_NAME = "Routes";

function AppRoutes() {
   return (
      <Routes>
         <Route path="/*" element={<WizardRoute element={<WizardWelcome />} />} />
         <Route path="/login/success/*" element={<PublicFixedRoute element={<LoginSuccess />} />} />
         <Route path="/login/returnUrl=:returnUrl/*" element={<PublicFixedRoute element={<Login />} />} />
         <Route path="/login" element={<PublicFixedRoute element={<Login />} />} />

         <Route path="/profiles/library/*" element={<PrivateRoute element={<ProfileList />} />} />
         <Route path="/profile/:id/*" element={<PrivateRoute element={<ProfileEntity />} />} />
         <Route path="/cloudlibrary/search/*" element={<PrivateRoute element={<CloudLibList />} />} />
         <Route path="/cloudlibrary/viewer/:id/*" element={<PrivateRoute element={<CloudLibViewer />} />} />

         <Route path="/types/library/profile/:profileId/*" element={<PrivateRoute element={<ProfileTypeDefinitionList />} />} />
         <Route path="/types/library/*" element={<PrivateRoute element={<ProfileTypeDefinitionList />} />} />

         <Route path="/type/extend/:parentId/*" element={<WizardRoute element={<ProfileTypeDefinitionEntity />} />} />
         <Route path="/type/:id/p=:profileId/*" element={<WizardRoute element={<ProfileTypeDefinitionEntity />} />} />
         <Route path="/type/:id/*" element={<WizardRoute element={<ProfileTypeDefinitionEntity />} />} />

         <Route path="/wizard/welcome/*" element={<WizardRoute element={<WizardWelcome />} />} />
         <Route path="/wizard/create-profile/*" element={<WizardRoute element={<WizardNewProfile />} />} />
         <Route path="/wizard/import-profile/*" element={<WizardRoute element={<WizardImportProfile />} />} />
         <Route path="/wizard/select-profile/*" element={<WizardRoute element={<WizardSelectProfile />} />} />
         <Route path="/wizard/select-existing-profile/*" element={<WizardRoute element={<WizardSelectProfile />} />} />
         <Route path="/wizard/filter-profile/*" element={<WizardRoute element={<WizardFilterProfile />} />} />
         <Route path="/wizard/select-base-type/*" element={<WizardRoute element={<WizardSelectBaseType />} />} />
         <Route path="/wizard/extend/:parentId/p=:profileId/*" element={<WizardRoute element={<ProfileTypeDefinitionEntity />} />} />
         <Route path="/wizard/extend/:parentId/*" element={<WizardRoute element={<ProfileTypeDefinitionEntity />} />} />

         <Route path="/admin/user/list/*" element={<AdminRoute element={<AdminUserList />} roles={[AppSettings.AADAdminRole]} />} />
         <Route path="/admin/user/:id/*" element={<AdminRoute element={<AdminUserEntity />} roles={[AppSettings.AADAdminRole]} />} />
         <Route path="/admin/cloudlibrary/approval/list/*" element={<AdminRoute element={<AdminCloudLibApprovalList />} roles={[AppSettings.AADAdminRole]} />} />

         <Route path="/notpermitted/*" element={<PublicFixedRoute element={<NotAuthorized />} />} />
         <Route path="/notauthorized/*" element={<PublicFixedRoute element={<NotAuthorized />} />} />

         {/* Catch-all route */}
         <Route path="*" element={<PublicFixedRoute element={<PageNotFound />} />} />
      </Routes>
   );
}

export default AppRoutes;
