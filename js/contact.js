
/**
 * Contains information about a single contact.  
 * @param {DOMString} id unique identifier
 * @param {DOMString} displayName
 * @param {ContactName} name 
 * @param {DOMString} nickname
 * @param {ContactField[]} phoneNumbers array of phone numbers
 * @param {ContactField[]} emails array of email addresses
 * @param {ContactAddress[]} addresses array of addresses
 * @param {ContactField[]} ims instant messaging user ids
 * @param {ContactOrganization[]} organizations 
 * @param {DOMString} published date contact was first created
 * @param {DOMString} updated date contact was last updated
 * @param {DOMString} birthday contact's birthday
 * @param (DOMString} anniversary contact's anniversary
 * @param {DOMString} gender contact's gender
 * @param {DOMString} note user notes about contact
 * @param {DOMString} preferredUsername
 * @param {ContactField[]} photos
 * @param {ContactField[]} tags
 * @param {ContactField[]} relationships 
 * @param {ContactField[]} urls contact's web sites
 * @param {ContactAccounts[]} accounts contact's online accounts
 * @param {DOMString} utcOffset UTC time zone offset
 * @param {DOMString} connected
 */
var Contact = function(id, displayName, name, nickname, phoneNumbers, emails, addresses,
    ims, organizations, published, updated, birthday, anniversary, gender, note,
    preferredUsername, photos, tags, relationships, urls, accounts, utcOffset, connected) {
    this.id = id || null;
    this.displayName = displayName || null;
    this.name = name || null; // ContactName
    this.nickname = nickname || null;
    this.phoneNumbers = phoneNumbers || null; // ContactField[]
    this.emails = emails || null; // ContactField[]
    this.addresses = addresses || null; // ContactAddress[]
    this.ims = ims || null; // ContactField[]
    this.organizations = organizations || null; // ContactOrganization[]
    this.published = published || null;
    this.updated = updated || null;
    this.birthday = birthday || null;
    this.anniversary = anniversary || null;
    this.gender = gender || null;
    this.note = note || null;
    this.preferredUsername = preferredUsername || null;
    this.photos = photos || null; // ContactField[]
    this.tags = tags || null; // ContactField[]
    this.relationships = relationships || null; // ContactField[]
    this.urls = urls || null; // ContactField[]
    this.accounts = accounts || null; // ContactAccount[]
    this.utcOffset = utcOffset || null;
    this.connected = connected || null;
};

/**
 * Contact name.
 * @param formatted
 * @param familyName
 * @param givenName
 * @param middle
 * @param prefix
 * @param suffix
 */
var ContactName = function(formatted, familyName, givenName, middle, prefix, suffix) {
    this.formatted = formatted || null;
    this.familyName = familyName || null;
    this.givenName = givenName || null;
    this.middleName = middle || null;
    this.honorificPrefix = prefix || null;
    this.honorificSuffix = suffix || null;
};

/**
 * Generic contact field.
 * @param type
 * @param value
 * @param primary
 */
var ContactField = function(type, value, primary) {
    this.type = type || null;
    this.value = value || null;
    this.primary = primary || false;
};

/**
 * Contact address.
 * @param formatted
 * @param streetAddress 
 * @param locality
 * @param region
 * @param postalCode
 * @param country
 */
var ContactAddress = function(formatted, streetAddress, locality, region, postalCode, country) {
    this.formatted = formatted || null;
    this.streetAddress = streetAddress || null;
    this.locality = locality || null;
    this.region = region || null;
    this.postalCode = postalCode || null;
    this.country = country || null;
};

/**
 * Contact organization.
 * @param name
 * @param dept
 * @param title
 * @param startDate
 * @param endDate
 * @param location
 * @param desc
 */
var ContactOrganization = function(name, dept, title, startDate, endDate, location, desc) {
    this.name = name || null;
    this.department = dept || null;
    this.title = title || null;
    this.startDate = startDate || null;
    this.endDate = endDate || null;
    this.location = location || null;
    this.description = desc || null;
};

/**
 * Contact account.
 * @param domain
 * @param username
 * @param userid
 */
var ContactAccount = function(domain, username, userid) {
    this.domain = domain || null;
    this.username = username || null;
    this.userid = userid || null;
};

/**
 * Represents a group of Contacts. 
 */
var Contacts = function() {
    this.inProgress = false;
    this.records = [];
};

var ContactError = function(code) {
    this.code = code;
};

ContactError.UNKNOWN_ERROR = 0;
ContactError.INVALID_ARGUMENT_ERROR = 1;
ContactError.NOT_FOUND_ERROR = 2;
ContactError.TIMEOUT_ERROR = 3;
ContactError.PENDING_OPERATION_ERROR = 4;
ContactError.IO_ERROR = 5;
ContactError.NOT_SUPPORTED_ERROR = 6;
ContactError.PERMISSION_DENIED_ERROR = 20;


/**
 * Represents a group of BlackBerry Contacts. 
 */
var BlackBerryContacts = {

  // Contains mappings for each Contact field that may be used in a find operation. 
  // If the Contact field maps to one or more fields in a BlackBerry contact object, 
  // it will be found in the mappings.  Each Contact field is paired with the 
  // appropriate BlackBerry contact fields.
  //
  // Example: user searches with a filter on the Contact 'name' field:
  //
  //       Contacts.find(['name'], onSuccess, onFail, {filter:'Bob'});
  // 
  // The 'name' field does not exist in a BlackBerry contact.  Instead, a
  // filter expression will be built to search the BlackBerry contacts using
  // the BlackBerry 'firstName' and 'lastName' fields.   
  // TODO: there may be a better way to do this
  fieldMappings : {
         "id"                        : "uid",
         "displayName"               : "title",
         "name"                      : [ "firstName", "lastName" ],
         "name.formatted"            : [ "firstName", "lastName" ],
         "givenName"                 : "firstName",
         "familyName"                : "lastName",
         "phoneNumbers"              : [ "faxPhone", "homePhone", "homePhone2", 
                                         "mobilePhone", "pagerPhone", "otherPhone",
                                         "workPhone", "workPhone2" ],
         "phoneNumbers.value"        : [ "faxPhone", "homePhone", "homePhone2", 
                                         "mobilePhone", "pagerPhone", "otherPhone",
                                         "workPhone", "workPhone2" ],
         "emails"                    : [ "email1", "email2", "email3" ],
         "addresses"                 : [ "homeAddress.address1", "homeAddress.address2",
                                         "homeAddress.city", "homeAddress.stateProvince",
                                         "homeAddress.zipPostal", "homeAddress.country",
                                         "workAddress.address1", "workAddress.address2",
                                         "workAddress.city", "workAddress.stateProvince",
                                         "workAddress.zipPostal", "workAddress.country" ],
         "addresses.formatted"       : [ "homeAddress.address1", "homeAddress.address2",
                                         "homeAddress.city", "homeAddress.stateProvince",
                                         "homeAddress.zipPostal", "homeAddress.country",
                                         "workAddress.address1", "workAddress.address2",
                                         "workAddress.city", "workAddress.stateProvince",
                                         "workAddress.zipPostal", "workAddress.country" ],
         "addresses.streetAddress"   : [ "homeAddress.address1", "homeAddress.address2",
                                         "workAddress.address1", "workAddress.address2" ],
         "addresses.locality"        : [ "homeAddress.city", "workAddress.city" ],
         "addresses.region"          : [ "homeAddress.stateProvince", "workAddress.stateProvince" ],
         "addresses.country"         : [ "homeAddress.country", "workAddress.country" ],
         "organizations"             : [ "company", "jobTitle" ],
         "organizations.title"       : "jobTitle",
         "birthday"                  : "birthday",
         "anniversary"               : "anniversary",
         "note"                      : "note",
         "urls"                      : "webpage",
         "urls.value"                : "webpage"
  }
};

/**
 * Retrieves a BlackBerry contact from the device by unique id.
 * @param uid unique id of the contact on the device
 * @return the BlackBerry contact or null if contact with specified id is not found
 */
BlackBerryContacts.findByUniqueId = function(uid) {
    if (!uid) {
        return null;
    }
    var bbContacts = blackberry.pim.Contact.find(
            new blackberry.find.FilterExpression("uid", "==", uid));
    return bbContacts[0] || null;
};

/**
 * Creates a BlackBerry contact object from the specified Contact object 
 * and persists it to device storage.
 * @param contact the contact to save
 * @return id of the saved contact
 */
BlackBerryContacts.saveToDevice = function(contact) {

    if (!contact) {
        return;
    }
    
    var bbContact = null;

    // if the underlying BlackBerry contact already exists, retrieve it for update
    if (contact.id) {
        bbContact = BlackBerryContacts.findByUniqueId(contact.id);
    }
    
    // contact not found on device, create a new one
    if (!bbContact) {
        bbContact = new blackberry.pim.Contact();
    }
    
    // NOTE: BlackBerry fields are initialized as empty strings and some don't 
    // respond well to null values (exceptions thrown when saving)
    if (contact.name) {   
        bbContact.firstName = contact.name.givenName || "";
        bbContact.lastName = contact.name.familyName || "";
    }
    bbContact.title = contact.displayName || "";
    bbContact.note = contact.note || "";

    // get 'birthday' and 'anniversary' fields
    //
    // user may pass in Date object or a string representation of a date 
    // (the W3C Contacts API calls for birthday and anniversary to be DOMStrings)
    // if it is a string, we don't know the date format, so try to create a
    // new Date with what we're given
    // 
    // NOTE: BlackBerry's Date.parse() does not work well, so use new Date()
    //
    if (contact.birthday) {
        bbContact.birthday = (contact.birthday instanceof Date) ?
                contact.birthday : new Date(contact.birthday.toString());        
    }    
    if (contact.anniversary) {
        bbContact.anniversary = (contact.anniversary instanceof Date) ?
                contact.anniversary : new Date(contact.anniversary.toString());
    }

    // BlackBerry supports three email addresses
    // copy the first three found
    if (contact.emails && contact.emails instanceof Array) {
        var email = null;
        for (var i in contact.emails) {
            if (!contact.emails[i] || !contact.emails[i].value) { 
                continue; 
            }
            email = contact.emails[i].value;
            if (bbContact.email1 === "") {
                bbContact.email1 = email;
            }
            else if (bbContact.email2 === "") {
                bbContact.email2 = email;
            }
            else if (bbContact.email3 === "") {
                bbContact.email3 = email;
            }
        }
    }

    // BlackBerry supports a finite number of phone numbers
    // copy into appropriate fields based on type
    if (contact.phoneNumbers && contact.phoneNumbers instanceof Array) {
        var type = null;
        var number = null;
        for (i in contact.phoneNumbers) {
            if (!contact.phoneNumbers[i] || !contact.phoneNumbers[i].value) { 
                continue; 
            }
            type = contact.phoneNumbers[i].type;
            number = contact.phoneNumbers[i].value;
            if (type === 'home') {
                if (bbContact.homePhone === "") { 
                    bbContact.homePhone = number; 
                }
                else if (bbContact.homePhone2 === "") { 
                    bbContact.homePhone2 = number; 
                }
            } else if (type === 'work') {
                if (bbContact.workPhone === "") { 
                    bbContact.workPhone = number; 
                }
                else if (bbContact.workPhone2 === "") { 
                    bbContact.workPhone2 = number; 
                }
            } else if (type === 'mobile' && bbContact.mobilePhone === "") {
                bbContact.mobilePhone = number;
            } else if (type === 'fax' && bbContact.faxPhone === "") {
                bbContact.faxPhone = number;
            } else if (type === 'pager' && bbContact.pagerPhone === "") {
                bbContact.pagerPhone = number;
            } else if (bbContact.otherPhone === "") {
                bbContact.otherPhone = number;
            }
        }
    }
    
    // BlackBerry supports two addresses: home and work
    // copy the first two addresses found from Contact
    if (contact.addresses && contact.addresses instanceof Array) {
        var address = null;
        var bbHomeAddress = null;
        var bbWorkAddress = null;
        for (i in contact.addresses) {
            if (!contact.addresses[i]) { 
                continue; 
            }
            address = contact.addresses[i];
            if (bbHomeAddress === null) {
                bbHomeAddress = Contact.toBlackBerryAddress(address);
                bbContact.homeAddress = bbHomeAddress;
            }
            else if (bbWorkAddress === null) {
                bbWorkAddress = Contact.toBlackBerryAddress(address);
                bbContact.workAddress = bbWorkAddress;
            }
        }
    }

    // copy first url found to BlackBerry 'webpage' field
    if (contact.urls && contact.urls instanceof Array) {
        for (i in contact.urls) {
            if (!contact.urls[i] || !contact.urls[i].value) { 
                continue; 
            }
            if (bbContact.webpage === "") {
                bbContact.webpage = contact.urls[i].value;
                break;
            }
        }
    }
   
    // copy fields from first organization to the 
    // BlackBerry 'company' and 'jobTitle' fields
    if (contact.organizations && contact.organizations instanceof Array) {
        var org = null;
        for (i in contact.organizations) {
            if (!contact.organizations[i]) { 
                continue; 
            }
            org = contact.organizations[i];
            if (bbContact.company === "") {
                bbContact.company = org.name || "";
                bbContact.jobTitle = org.title || "";
                break;
            }
        }
    }

    // save to device
    bbContact.save();
    
    return bbContact.uid;
};

/**
 * Builds a BlackBerry filter expression based on search fields and filter.
 * PRIVATE function.
 * @return filter expression or null if fields is empty or filter is null or empty
 */
BlackBerryContacts.buildFilterExpression = function(fields, filter) {
    
    // ensure filter exists
    if (!filter || filter === "") {
        return null;
    }

    // BlackBerry API uses specific operators to build filter expressions for 
    // querying Contact lists.  The operators are ["!=","==","<",">","<=",">="].
    // Use of regex is also an option, and the only one we can use to simulate
    // an SQL '%LIKE%' clause.  
    // TODO: The only problem with the BB regex implementation is that it is case 
    // sensitive.  We need case INsensitivity to match the W3C Contacts API spec.  
    // Unfortunately, the BB implementation does not seem to honor the regex (?i)
    // switch to turn on case insensitivity.  So we're stuck with case sensitive 
    // searches for now.
    filter = ".*" + filter + ".*";
    console.log('filter=' + filter);
    
    // build a filter expression using all fields provided
    var filterExpression = null;
    if (fields && fields instanceof Array) {
        var fe = null;
        for (var i in fields) {
            if (!fields[i]) {
                continue;
            }

            // get the BlackBerry fields that map to the one specified
            var bbFields = BlackBerryContacts.fieldMappings[fields[i]];
            
            // BlackBerry doesn't support the field specified
            if (!bbFields) {
                continue;
            }

            // construct the filter expression using the BlackBerry fields
            for (var j in bbFields) {
                fe = new blackberry.find.FilterExpression(bbFields[j], "REGEX", filter);
                if (filterExpression === null) {
                    filterExpression = fe;
                } else {
                    filterExpression = new blackberry.find.FilterExpression(filterExpression, "OR", fe);
                }
            }
        }
    }

    return filterExpression;
};


/**
 * This function creates a new contact, but it does not persist the contact
 * to device storage.  To persist the contact to device storage, invoke
 * contact.save().
 */
Contacts.prototype.create = function(properties) {
    var contact = new Contact();
    for (var i in properties) {
        if (contact[i] !== 'undefined') {
            contact[i] = properties[i];
        }
    }
    return contact;
};

/**
 * Persists contact to device storage.
 */
Contact.prototype.save = function(success, fail) {
    
    try {
        // save the contact and store it's unique id
        this.id = BlackBerryContacts.saveToDevice(this);        
        if (success) {
            success(this);
        }
    } catch (e) {
        console.log('Error saving contact: ' + e);
        if (fail) {
            fail(new ContactError(ContactError.UNKNOWN_ERROR));
        }
    }
};

/**
 * Removes contact from device storage.
 * @param success success callback
 * @param fail error callback
 */
Contact.prototype.remove = function(success, fail) {

    try {
        // retrieve contact from device by id
        var bbContact = null;
        if (this.id) {
            bbContact = BlackBerryContacts.findByUniqueId(this.id);
        }
        
        // if contact was found, remove it
        if (bbContact) {
            bbContact.remove();
            if (success) {
                success(this);
            }
        }
        // attempting to remove a contact that hasn't been saved
        else if (fail) { 
            fail(new ContactError(ContactError.NOT_FOUND_ERROR));            
        }
    } 
    catch (e) {
        console.log('Error removing contact ' + this.id + ": " + e);
        if (fail) { 
            fail(new ContactError(ContactError.UNKNOWN_ERROR));
        }
    }
};

/**
 * Creates a deep copy of this Contact.
 * @return copy of this Contact
 */
Contact.prototype.clone = function() {
    var clonedContact = PhoneGap.clone(this);
    clonedContact.id = null;
    return clonedContact;
};

/**
 * Creates a BlackBerry Address object from a ContactAddress object.
 * @param address address object {ContactAddress}
 * @return a blackberry.pim.Address object
 */
Contact.toBlackBerryAddress = function(address) {

    if (!address || address instanceof ContactAddress === false) {
        return null;
    }
    
    var bbAddress = new blackberry.pim.Address();
    bbAddress.address1 = address.streetAddress || "";
    bbAddress.city = address.locality || "";
    bbAddress.stateProvince = address.region || "";
    bbAddress.zipPostal = address.postalCode || "";
    bbAddress.country = address.country || "";
    
    return bbAddress;
};


/**
 * Creates a ContactAddress object from a BlackBerry Address object.
 * @return a ContactAddress object
 */
Contact.fromBlackBerryAddress = function(address) {
    
    if (!address || address instanceof blackberry.pim.Address === false) {
        return null;
    }
    
    var address1 = address.address1 || "";
    var address2 = address.address2 || "";
    var streetAddress = address1 + ", " + address2;
    var locality = address.city || "";
    var region = address.stateProvince || "";
    var postalCode = address.zipPostal || "";
    var country = address.country || "";
    var formatted = streetAddress + ", " + locality + ", " + region + ", " + postalCode + ", " + country;

    return new ContactAddress(formatted, streetAddress, locality, region, postalCode, country);
};

/**
 * Creates a Contact object from a BlackBerry Contact object.
 * @return a Contact object
 */
Contact.fromBlackBerryContact = function(contact) {

    if (!contact) {
        return null;
    }
    
    // name
    var formattedName = contact.firstName + ' ' + contact.lastName;
    var name = new ContactName(formattedName, contact.lastName, contact.firstName, null, null, null);

    // phone numbers
    var phoneNumbers = [];
    if (contact.homePhone) {
        phoneNumbers.push(new ContactField('home', contact.homePhone));
    }
    if (contact.homePhone2) {
        phoneNumbers.push(new ContactField('home', contact.homePhone2));
    }
    if (contact.workPhone) {
        phoneNumbers.push(new ContactField('work', contact.workPhone));
    }
    if (contact.workPhone2) {
        phoneNumbers.push(new ContactField('work', contact.workPhone2));
    }
    if (contact.mobilePhone) {
        phoneNumbers.push(new ContactField('mobile', contact.mobilePhone));
    }
    if (contact.faxPhone) {
        phoneNumbers.push(new ContactField('fax', contact.faxPhone));
    }
    if (contact.pagerPhone) {
        phoneNumbers.push(new ContactField('pager', contact.pagerPhone));
    }
    if (contact.otherPhone) {
        phoneNumbers.push(new ContactField('other', contact.otherPhone));
    }
    
    // emails
    var emails = [];
    if (contact.email1) {
        emails.push(new ContactField(null, contact.email1, null));
    }
    if (contact.email2) { 
        emails.push(new ContactField(null, contact.email2, null));
    }
    if (contact.email3) { 
        emails.push(new ContactField(null, contact.email3, null));
    }
    
    // addresses
    var addresses = [];
    if (contact.homeAddress) {
        addresses.push(Contact.fromBlackBerryAddress(contact.homeAddress));
    }
    if (contact.workAddress) {
        addresses.push(Contact.fromBlackBerryAddress(contact.workAddress));
    }
    
    // organizations
    var organizations = [];
    if (contact.company || contact.jobTitle) {
        organizations.push(new ContactOrganization(contact.company, null, 
                contact.jobTitle, null, null, null, null));
    }
    
    // urls
    var urls = [];
    if (contact.webpage) {
        urls.push(new ContactField(null, contact.webpage));
    }

    // finally
    return new Contact(
            contact.uid,         // unique id
            contact.title,       // displayName
            name,                // ContactName
            null,                // nickname
            phoneNumbers,        // phoneNumbers ContactField[]
            emails,              // emails ContactField[]
            addresses,           // addresses ContactField[]
            [],                  // IMs ContactField[]
            organizations,       // organizations ContactField[]
            null,                // published
            null,                // updated
            contact.birthday,    // birthday
            contact.anniversary, // anniversary
            null,                // gender
            contact.note,        // note
            null,                // preferredUserName 
            [],                  // photos ContactField[]
            [],                  // tags ContactField[]
            [],                  // relationships ContactField[]
            urls,                // urls ContactField[]
            [],                  // accounts ContactAccount[] 
            null,                // utcOffset
            null                 // connected
            );
};

/**
 * Returns an array of Contacts matching the search criteria.
 * @return array of Contacts matching search criteria
 */
Contacts.prototype.find = function(fields, success, fail, options) {

    // default is to return a single contact
    var numContacts = 1;

    // search options
    var filter = null;
    if (options) {
        // return multiple objects?
        if (options.multiple) {
            // use options.limit (if specified), or return all (-1 in BlackBerry)
            numContacts = (options.limit) ? Math.max(numContacts, options.limit) : -1;
        }
        filter = options.filter;
    }
    
    // build the filter expression to use in find operation 
    var filterExpression = BlackBerryContacts.buildFilterExpression(fields, filter); 

    // find matching contacts
    // Note: the filter expression can be null here, in which case, the find won't filter
    var bbContacts = blackberry.pim.Contact.find(filterExpression, null, numContacts);
    
    // convert to Contact from blackberry.pim.Contact
    var contacts = [];
    for (var i in bbContacts) {
        if (bbContacts[i]) { 
            contacts.push(Contact.fromBlackBerryContact(bbContacts[i]));
        }
    }
    
    // return results
    if (success && success instanceof Function) {
        success(contacts);
    } else {
        console.log("Error invoking Contacts.find success callback.");
    }
};

var ContactFindOptions = function(filter, multiple, limit, updatedSince) {
    this.filter = filter || '';
    this.multiple = multiple || true;
    this.limit = limit || Number.MAX_VALUE;
    this.updatedSince = updatedSince || '';
};

PhoneGap.addConstructor(function() {
    if(typeof navigator.service === "undefined") navigator.service = new Object();
    if(typeof navigator.service.contacts === "undefined") navigator.service.contacts = new Contacts();
});
