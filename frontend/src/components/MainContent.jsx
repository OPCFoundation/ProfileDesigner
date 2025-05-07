import React from 'react'
import AppRoutes from './AppRoutes'

//import { generateLogMessageString } from '../utils/UtilityService'
import { ScrollToTop } from './ScrollToTop';
import { OnRefreshEvent } from './OnRefreshEvent';
import './styles/MainContent.scss';

//const CLASS_NAME = "MainContent";

function MainContent() {
    //this will cause a scroll to top on route change. It should only run when the path name, route name changes.
    ScrollToTop();
    //this will turn off isLoading flag if f5 or refresh of page occurs
    OnRefreshEvent();

    return (
       <AppRoutes />
    )
}

export default MainContent