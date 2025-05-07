import { PublicClientApplication } from "@azure/msal-browser";
import { AppSettings } from './utils/appsettings';

//require('dotenv').config()
//create PublicClientApplication instance
//export it so that our non-component code can access this instance.

export const Msal_Instance = new PublicClientApplication(AppSettings.MsalConfig);
