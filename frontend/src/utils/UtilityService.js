import color from "../components/Constants";
import { SVGIcon } from "../components/SVGIcon";
import { AppSettings } from "./appsettings";

const _logMessageDelimiter = " || ";

///#region: Logging Helper Methods
///--------------------------------------------------------------------------
/// Generate Log Message String. This allows components to use this common message
/// format and log the message directly to the console so they can have line number and
/// file where message is generated.
/// Sample:
///  console.log(this.svcUtility.getlogMessageString("ngOnInit", CLASS_NAME, this.svcUtility.LogMessageSeverity.Info));
///--------------------------------------------------------------------------
export function generateLogMessageString(message, category = '', severity= "info") {
    var msg = { Code: '', Message: message, Category: category, Severity: severity, DateCreated: new Date() };
    return generateLogMessageStringModel(msg);
}

function generateLogMessageStringModel(msgModel) {
    return getTimeStamp(msgModel.DateCreated)
        + (msgModel.Category !== '' ? _logMessageDelimiter : '') + msgModel.Category
        + _logMessageDelimiter + msgModel.Severity.toString()
        + (msgModel.Code !== '' ? _logMessageDelimiter : '') + msgModel.Code
        + (msgModel.Message !== '' ? _logMessageDelimiter : '') + msgModel.Message;
}

///--------------------------------------------------------------------------
/// Log a formatted message
/// Sample:
///  this.svcUtility.logMessage("ngOnInit", CLASS_NAME, this.svcUtility.LogMessageSeverity.Info);
///--------------------------------------------------------------------------
export function logMessage(message, category = '', severity = "info") {
    //if (!isDevMode) return;
    //convert error object to string
    if (typeof message === "string") {//do nothing
    }
    else { message = JSON.stringify(message); }

    var msg = { Code: '', Message: message, Category: category, Severity: severity, DateCreated: new Date() };
    logMessageByModel(msg);
}

///--------------------------------------------------------------------------
/// Log a formatted message using the logMessage model as param
///--------------------------------------------------------------------------
function logMessageByModel(msgModel) {
    //if (!isDevMode) return;
    var formattedMsg = generateLogMessageStringModel(msgModel);
    switch (msgModel.Severity.toLowerCase()) {
        case "error":
        case "exception":
        case "critical":
            console.error(formattedMsg);
            break;
        case "warn":
        case "warning":
            console.warn(formattedMsg);
            break;
        case "debug":
            console.debug(formattedMsg);
            break;
        default:
            console.log(formattedMsg);
    }
}

///--------------------------------------------------------------------------
/// Log an elapsed time message. This is useful when trying to get elapsed time
/// for an action between two times. 
/// Sample:
///    this.svcUtility.logMessageElapsedTime("ngOnInit", CLASS_NAME, new Date('2018-01-21'), new Date());
///--------------------------------------------------------------------------
export function logMessageElapsedTime(message, category, startDate, endDate) {
    //if (!isDevMode) return;
    var msg = getlogMessageElapsedTimeModel(message, category, startDate, endDate);
    logMessageByModel(msg);
}

///--------------------------------------------------------------------------
/// Log an elapsed time message. This is useful when trying to get elapsed time
/// for an action between two times. 
/// Sample:
///    this.svcUtility.logMessageElapsedTime("ngOnInit", CLASS_NAME, new Date('2018-01-21'), new Date());
///--------------------------------------------------------------------------
export function getlogMessageElapsedTimeString(message, category, startDate, endDate) {
    var msg = getlogMessageElapsedTimeModel(message, category, startDate, endDate);
    var formattedMsg = generateLogMessageStringModel(msg);
    return formattedMsg;
}

///--------------------------------------------------------------------------
/// Shared function to get an elapsed time message model. This is useful when trying to get elapsed time
/// for an action between two times. 
/// Sample:
///    this.svcUtility.logMessageElapsedTime("ngOnInit", CLASS_NAME, new Date('2018-01-21'), new Date());
///--------------------------------------------------------------------------
function getlogMessageElapsedTimeModel(message, category, startDate, endDate) {
    var elapsed = endDate.getTime() - startDate.getTime();
    var elapsedMessage = 'Elasped Time: ' + elapsed + ' ms (Start: ' + getTimeStamp(startDate) +
        ', End: ' + getTimeStamp(endDate) + ')';
    var msg = {
        Code: '', Message: message == null || message === '' ? elapsedMessage : message + _logMessageDelimiter + elapsedMessage,
        Category: category, Severity: "info", DateCreated: endDate
    };
    return msg;
}

///--------------------------------------------------------------------------
/// Create a timestamp value in a consistent manner
///--------------------------------------------------------------------------
function getTimeStamp(d) {
    var result = (d.getHours() < 10 ? '0' : '') + d.getHours() + ':' +
        (d.getMinutes() < 10 ? '0' : '') + d.getMinutes() + ':' +
        (d.getSeconds() < 10 ? '0' : '') + d.getSeconds() + ':' +
        (d.getMilliseconds() < 10 ? '00' : (d.getMilliseconds() < 100 ? '0' : '')) + d.getMilliseconds();
    return result;
}

///--------------------------------------------------------------------------
/// Create a timestamp value in a consistent manner
///--------------------------------------------------------------------------
export function formatDate(val) {
    if (val == null || val === '') return null;
    var d = new Date(val);
    //return d.getFullYear() + '/' + d.getMonth() + '/' + d.getDate();
    return d.getMonth() + 1 + '/' + d.getDate() + '/' + d.getFullYear();
}
///--------------------------------------------------------------------------
/// Create a timestamp value to display Utc Date
///--------------------------------------------------------------------------
export function formatDateUtc(val) {
    if (val == null || val === '') return null;
    var d = new Date(val);
    return d.getUTCMonth() + 1 + '/' + d.getUTCDate() + '/' + d.getUTCFullYear();
}

  ///#endregion: Logging Helper Methods

///--------------------------------------------------------------------------
/// Paging - Take an incoming datarows array and page it based on a start index, page size and array length
/// Client side paging - this assumes we have all the data pulled down. Only do this for smaller data sets. 
///--------------------------------------------------------------------------
export function pageDataRows(items, currentPage, pageSize) {
    if (items == null) return null;
    //null means show all
    if (pageSize == null) pageSize = items.length;

    var result = JSON.parse(JSON.stringify(items));
    //if item count < pageSize set paged == filtered
    if (items.length <= pageSize) {
        return result;
    }

    //calculate start and endindex and then slice pagedCopy 
    var startIndex = (currentPage - 1) * pageSize;
    var endIndex = startIndex + pageSize - 1;
    return result.slice(startIndex, endIndex + 1);
}

export function getUserPreferences() {
    var result = localStorage.getItem('userPreferences');
    if (result == null) return {
        profilePreferences: { pageSize: AppSettings.PageSize },
        typeDefPreferences: { pageSize: AppSettings.PageSize },
        attributePreferences: { pageSize: 5 },
        dependencyPreferences: { pageSize: 25 }
    };

    var item = JSON.parse(result);
    //handle null of individual preference items
    var needsUpdate = (item.profilePreferences == null || item.typeDefPreferences == null || item.attributePreferences == null);
    if (item.profilePreferences == null) item.profilePreferences = { pageSize: AppSettings.PageSize };
    if (item.typeDefPreferences == null) item.typeDefPreferences = { pageSize: AppSettings.PageSize };
    if (item.attributePreferences == null) item.attributePreferences = { pageSize: 5 };
    if (item.dependencyPreferences == null) item.dependencyPreferences = { pageSize: 25 };
    if (needsUpdate) localStorage.setItem('userPreferences', JSON.stringify(item));

    return item;
}

export function setUserPreferences(item) {
    localStorage.setItem('userPreferences', JSON.stringify(item));
}

export function concatenateField(items, fieldName, delimiter = ',') {
    if (items == null || items.length === 0) return "";
    var result = items.map((item) => {
        return item[fieldName];
    });
    return result.join(delimiter);
};

//TBD - move to profile service file
export function getProfileTypeCaption(item) {
    if (item == null || item.type == null) return 'Type';
    switch (item.type.name.toLowerCase()) {
        case 'interface':
            return 'Interface';
        case 'customdatatype':
            return 'Custom Data Type';
        case 'abstract':
        case 'structure':
        case 'class':
        default:
            return 'Type';
    }
}


///--------------------------------------------------------------------------
/// Gets the data types permitted for a variable type
//--------------------------------------------------------------------------
export const getPermittedDataTypesForVariableTypeById = (variableTypeId, lookupDataTypes) => {
    if (variableTypeId != null) {
        var vtDataType = lookupDataTypes.find(dt => { return dt.customTypeId === variableTypeId });
        if (vtDataType != null) {
            const permittedDataTypes = getDerivedDataTypes(vtDataType, lookupDataTypes);
            return permittedDataTypes;
        }
    }
    return null;
}

///--------------------------------------------------------------------------
/// Gets all data types derived from a data type (from for example loadingProps.lookupDataStatic.dataTypes), including the data type itself
//--------------------------------------------------------------------------
export const getDerivedDataTypes = (dataType, lookupDataTypes) => {
    const derivedDataTypes = lookupDataTypes.filter((dt) => {
        if (isDerivedFromDataType(dt, dataType, lookupDataTypes)) {
            return dt;
        }
        return null;
    });
    return derivedDataTypes;
}

///--------------------------------------------------------------------------
/// Determines if a data type (from for example loadingProps.lookupDataStatic.dataTypes) is derived from another data type
//--------------------------------------------------------------------------
export const isDerivedFromDataType = (dataType, baseDataType, lookupDataTypes) => {
    let dtCurrent = dataType;
    do {
        if (dtCurrent.id === baseDataType.id) {
            return true;
        }
        if (dtCurrent.baseDataTypeId == null) {
            break;
        }
        let dtBase = lookupDataTypes.find(dt => { return dt.id === dtCurrent.baseDataTypeId; });
        if (dtBase === dtCurrent) {
            // avoid infinite loop if data is bad
            break;
        }
        dtCurrent = dtBase;
    }
    while (dtCurrent != null);
    return false;
}

//TBD - move to profile service file
export function getTypeDefIconName(item) {
    if (item == null || item.type == null) return AppSettings.IconMapper.TypeDefinition;
    //TBD - eventually get icons specific for each type
    switch (item.type.name.replace(/\s/g,'').toLowerCase()) {
        case "namespace":
            return "folder-profile";
        case 'interface':
            return AppSettings.IconMapper.Interface;
        case 'customdatatype':
            return 'customdatatype';
        case 'abstract':
        case 'structure':
        case 'class':
        default:
            return AppSettings.IconMapper.TypeDefinition;
    }
}

export const getIconColorByProfileState = (profileState) => {
    if (profileState == null) return color.readOnly;

    switch (profileState) {
        case AppSettings.ProfileStateEnum.CloudLibPending:
        case AppSettings.ProfileStateEnum.CloudLibRejected:
        case AppSettings.ProfileStateEnum.Local:
            return color.mine;
        case AppSettings.ProfileStateEnum.CloudLibPublished:
        case AppSettings.ProfileStateEnum.Core:
        default:
            return color.readOnly;
    }
};

///--------------------------------------------------------------------------
/// Helper - scroll to top
//--------------------------------------------------------------------------
export const scrollTop = () => {
    window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth',
    });
};

///--------------------------------------------------------------------------
// ConvertToNumeric - use a data type to help guide how to convert a value to number
//--------------------------------------------------------------------------
//attribute min max, convert to numeric
export function convertToNumeric(dataType, val) {

    //don't attempt if any of these are the sole values
    if (val === '' || val === '-' || val === '.' || val === '-.') return val;

    if (dataType == null || !dataType.isNumeric) return val;

    //convert to numeric - if data type is numeric
    if (dataType.name.toLowerCase().indexOf('long') > -1 ||
        dataType.name.toLowerCase().indexOf('integer') > -1) {
        return parseInt(val);
    }
    if (dataType.name.toLowerCase().indexOf('double') > -1 ||
        dataType.name.toLowerCase().indexOf('float') > -1 || 
        dataType.name.toLowerCase().indexOf('decimal') > -1) {
        return parseFloat(val);
    }
    return val;
}

///--------------------------------------------------------------------------
// take a number and trim off the '.'. Make a '10.' to 
//--------------------------------------------------------------------------
export function toInt(val) {
    //don't attempt if any of these are the sole values
    if (val === '' || val === '-' || val === '.' || val === '-.') return val;

    //handle the -.# scenario
    if (isNaN(parseInt(val))) {
        return 0;
    }
    return parseInt(val);
}

///--------------------------------------------------------------------------
// Validate email
//--------------------------------------------------------------------------
export const validate_Email = (val) => {
    if (val == null || val.length === 0) return true;

    var format = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return format.test(val);
};

///--------------------------------------------------------------------------
// validateNumeric - test whether an input value is numeric based on a data type 
//--------------------------------------------------------------------------
export function validateNumeric(dataType, val) {
    //var result = null;

    //don't attempt if any of these are the sole values
    if (val == null || val === '' || val === '-' || val === '.' || val === '-.') return true;

    return !isNaN(val);

    ////convert to numeric - if data type is numeric
    //switch (dataType) {
    //    case "integer":
    //    case "long":
    //        result = parseInt(val);
    //        break;
    //    case "double":
    //    case "float":
    //    case "-1":
    //    case -1:
    //    default:
    //        result = parseFloat(val);
    //        break;
    //}
    //return !isNaN(result);

}

///--------------------------------------------------------------------------
// Validate URL
//--------------------------------------------------------------------------
export const validate_namespaceFormat = (val) => {
    if (val == null || val.length === 0) return true;

    const format = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www\.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w\-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[.!/\\\w]*))?)/;
    return format.test(val);
};

///--------------------------------------------------------------------------
// Validate no special characters are used
//--------------------------------------------------------------------------
export const validate_NoSpecialCharacters = (val) => {
    if (val == null || val.length === 0) return true;

    const format = /[ `!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~(0-9)]/;  //includes a space
    return !format.test(val);
};

///--------------------------------------------------------------------------
// Validate simple required field
//--------------------------------------------------------------------------
export const validate_Required = (val) => {
    return (val != null && val.trim().length > 0);
};


///--------------------------------------------------------------------------
// Perform a numeric only check for numeric fields. Call this from onchange 
// to prevent keying in alpha chars. 
//--------------------------------------------------------------------------
export function onChangeNumericKeysOnly(e) {

    return !(e.target.value !== ''
        && e.target.value !== '-'
        && e.target.value !== '.'
        && e.target.value !== '-.'
        && isNaN(e.target.value))
}

///--------------------------------------------------------------------------
// Prepare a properly formatted download link to download the profile nodeset XML
//--------------------------------------------------------------------------
export function cleanFileName(val) {
    if (val == null) return "";
    val = val.toLowerCase();
    var result = val.trim().replace(" ", "_");
    result = result.replace('https://', '');
    result = result.replace('http://', '');
    result = result.replaceAll('/', '.');
    result = result.replaceAll('\\', '');
    result = result.replaceAll('<', '');
    result = result.replaceAll('>', '');

    //trim off last period if present in result
    if (result.lastIndexOf('.') === result.length - 1) {
        result = result.substring(0, result.length - 1);
    }
    return `${result}.nodeset2`;
}

export async function downloadFileJSON(data, fileName, fileExtension = 'json') {
    const json = JSON.stringify(data);
    const blob = new Blob([json], { type: 'application/json' });
    const href = await URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = fileName + fileExtension;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export const renderTitleBlock = (caption, iconName, iconColor ) => {
    return (
        <div className="header-title-block d-flex mb-2">
            {(iconName != null && iconName !== "") &&
                <span className="mr-2">
                    <SVGIcon name={iconName} size="36" fill={iconColor} alt={caption} />
                </span>
            }
            <h1 className="mb-0 align-self-center">{caption}</h1>
        </div>
    );
}

///--------------------------------------------------------------------------
// getRandomArrayIndexes - given a list of items, get a random sampling of items from an 
///     array
//--------------------------------------------------------------------------
export const getRandomArrayIndexes = (items, limit = 6) => {
    if (items == null) return [];
    var result = [];

    //if item length < limit, return all item indexes and exit
    if (items.length <= limit) {
        result = items.map((tag, counter) => { return counter; });
        return result;
    }

    //loop over array and randomly pick items for display
    while (result.length < items.length && result.length < limit) {
        var val = Math.floor(Math.random() * items.length);
        //only add if not already added
        if (result.indexOf(val) === -1) {
            result.push(val);
        }
    }
    return result;
}


///--------------------------------------------------------------------------
/// isInRole - is user in a certain role
///  account is an MSAL account
//--------------------------------------------------------------------------
export const isInRoles = (account, roleNames) => {
    if (account == null) return false;
    if (account.idTokenClaims == null) return false;

    var roles = account.idTokenClaims.roles;
    if (roles == null || roles.length === 0) return false;

    //loop over a list of role names and see if any of them match with roles in claims
    var result = false;
    roleNames.forEach((r) => {
        if (!result) {
            result = roles.findIndex(x => x.toLowerCase() === r.toLowerCase()) > -1;
        }
    });

    return result;
}

export const isInRole = (account, roleName) => {
    if (account == null) return false;
    if (account.idTokenClaims == null) return false;

    var roles = account.idTokenClaims.roles;
    if (roles == null || roles.length === 0) return false;

    //check if role name has a match in array
    return roles.findIndex(x => x.toLowerCase() === roleName.toLowerCase()) > -1;
}

///--------------------------------------------------------------------------
/// useQueryString - extract query string parameter from url
//--------------------------------------------------------------------------
export function useQueryString(key) {
    return new URLSearchParams(window.location.search).get(key);
}

///--------------------------------------------------------------------------
/// menu icon convenience code
//--------------------------------------------------------------------------
export function renderMenuIcon(iconName, alt, className='mr-3') {
    if (iconName == null || iconName === '') return null;
    return (
        <span className={className} alt={`${alt == null ? iconName : alt}`}><SVGIcon name={iconName} size={24} /></span>
    );
}

///--------------------------------------------------------------------------
/// menu icon convenience code
//--------------------------------------------------------------------------
export function renderMenuColorIcon(iconName, alt, colorFill, className='mr-3') {
    if (iconName == null || iconName === '') return null;
    return (
        <span className={className} alt={`${alt == null ? iconName : alt}`}><SVGIcon name={iconName} fill={colorFill} size={24} /></span>
    );
}

