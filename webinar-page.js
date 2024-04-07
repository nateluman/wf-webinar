//Global function to get a cookie's value

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

//Global function to set a cookie's value

function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// Global function to get the last segment of the URL path (URL slug)
function getUrlSlug() {
    const pathArray = window.location.pathname.split('/');
    return pathArray[pathArray.length - 1];
}

// Global function to unhide form (or any div that is hidden)
function unhideForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.classList.remove('hidden');
    }
}

//As page loads, look for cookie matching page slug
//That indicates that the user has already unlocked that content

document.addEventListener("DOMContentLoaded", function() {

    function checkAndSetSurveyStatus() {
        if (sessionStorage.getItem("surveyCheckDone")) return;

        const uid = getCookie("candid-uid");
        if (uid && uid.startsWith("00Q") && getCookie("candid-survey-completed") !== "true") {
            // Construct the URL for your Pipedream endpoint
            const pipedreamUrl = `https://eozz2wl7g1jqvlb.m.pipedream.net?uid=${encodeURIComponent(uid)}`;

            // Make API call to Pipedream
            fetch(pipedreamUrl)
            .then(response => response.json())
            .then(data => {
                if (data) {
                    // Assuming data contains a boolean indicating the survey status
                    const surveyCompleted = String(data.survey);
                    setCookie("candid-survey-completed", surveyCompleted, 365);
                    
                    // Update "candid-uid" cookie if the id in the response doesn't match
                    if (data.id && data.id !== uid) {
                        setCookie("candid-uid", data.id, 365);
                    }
                }
            })
            .catch(error => console.error('Error fetching survey status:', error))
            .finally(() => {
                // Set session storage to prevent repeat checks in the same session
                sessionStorage.setItem("surveyCheckDone", "true");
            });
        }

        if (uid && uid.startsWith("003") && getCookie("candid-survey-completed") !== "true") {
            setCookie("candid-survey-completed", "true", 365);            
        }    
    }


    // If slug cookie exists, remove gate from recording section - it will only be visible on the page if the cms status is on-demand because of conditional visibility
    function manageVisibility() {
        const slug = getUrlSlug();
        const slugCookie = getCookie(slug);
        const candidUidCookie = getCookie("candid-uid");
        const recordingSection = document.getElementById('recording-section');

        if (slugCookie) {
            recordingSection.classList.remove('gated');
            unhideForm('coming-soon-unlocked');
        }
        else {
            unhideForm('coming-soon-new');
        }
        
        
        if (slugCookie) {
            var statusElement = document.getElementById('status');
            var status = statusElement.getAttribute('data-status');
            
            if (status.trim().toLowerCase() === "upcoming") {
                unhideForm('webinar-unlocked');
                const cookieData = JSON.parse(slugCookie);
                if (cookieData && cookieData.google) {
                    unhideForm('zoom-info');
                    const googleCalendarLink = document.getElementById('addtocal-google');
                    const outlookCalendarLink = document.getElementById('addtocal-outlook');

                    if (googleCalendarLink) googleCalendarLink.href = cookieData.google;
                    if (outlookCalendarLink) outlookCalendarLink.href = cookieData.outlook;
                }
            }
            else {
            	unhideForm('form-ama');
            }
        } else if (candidUidCookie) {
            // authed user id -> show truncated form
            unhideForm('form-truncated');
            document.getElementById('form-truncated-sfdc-object').value = candidUidCookie;
        
        } else {
            // unrecognized user -> show full form
            unhideForm('form-full');
        }
    }

    // Execute the function to manage visibility
    manageVisibility();
    checkAndSetSurveyStatus();

    // If webinar is upcoming, add upcoming class to form-container. This will move it up to the hero section
    var statusElement = document.getElementById('status');
    var webinarStatus = statusElement ? statusElement.getAttribute('data-status').trim().toLowerCase() : "";
    if (webinarStatus === "upcoming") {
        document.getElementById('form-container').classList.add('upcoming');
    }

});


//Form handling

var Webflow = Webflow || [];
Webflow.push(function() {

    // function to display error message
    function displayError() {
        hideLoading(); // hide loading indicator
        let failureMessage = document.getElementById('error-message');
        failureMessage.style.display = 'block'; // show error message
    }

    // function to hide the loading indicator
    function hideLoading() {
        showForm(); // show the form
        let loadingIndicator = document.getElementById('loading-indicator');
        loadingIndicator.style.display = 'none'; // hide the loading indicator
    }

    // function to hide the form
    function hideForm() {
        form.style.display = 'none'; // hide the form
    }

    // function to show the loading indicator
    function showLoading() {
        hideForm(); // hide the form
        let loadingIndicator = document.getElementById('loading-indicator');
        loadingIndicator.style.display = 'flex'; // show the loading indicator
    }

    // function to show the form
    function showForm() {
        form.style.display = 'grid'; // show the form
    }

    function triggerSubmit(event) {
        event.preventDefault(); // prevent default form submission behavior
        showLoading(); // show loading indicator

        const formData = new FormData(event.target);
        const email3 = formData.get('Email-3'); // Extracting Email-3 value from the form

        if (email3) {
            const apiURL = 'https://eohj8yatziqwvp.m.pipedream.net';
            fetch(apiURL, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                apiResponded = true;
                handleApiResponse(data);
            })
            .catch(error => console.error('Error in API call:', error));
        }

        // Function to handle API response
        function handleApiResponse(data) {
            if (data.id) {
                setCookie("candid-uid", data.id, 365);
            }
            setCookie("candid-survey-completed", String(data.survey), 365);
        }

        let responseReceived = false;
        let twoSecondPassed = false;
        let fiveSecondElapsed = false;
        
        // setup + send xhr request
        let formData = new FormData(event.target);
        let xhr = new XMLHttpRequest();
        xhr.open('POST', event.srcElement.action);
        xhr.send(formData);

        // Minimum 2-second wait timer - registration form will not finish before 2 seconds
        setTimeout(() => {
            twoSecondPassed = true;
            if (responseReceived) {
                unhideForm('webinar-unlocked');
            }
        }, 2000); 

        // 5-second timer - if we haven't gottena  response after 5 seconds, the form success div is shown anyway.
        // Later when we listen for the response, we'll unhide the zoom calendar section if it cam back before 5 seconds.
        setTimeout(() => {
            fiveSecondElapsed = true;
            if (!responseReceived) {
                unhideForm('webinar-unlocked');
            }
        }, 5000); 

        // capture xhr response
        xhr.onload = function() {
            responseReceived = true; // Set flag indicating response was received
            if (xhr.status === 200) {
                try {
                    let data = JSON.parse(xhr.responseText);

                    // Set page slug cookie with response data for when the user returns to the page. 
                    // Cookie includes their addtocal links so that we dont have to keep calling the zoom api
                    let cookieValue = JSON.stringify({ google: data.google, outlook: data.outlook });
                    let cookieName = getUrlSlug();
                    setCookie(cookieName, cookieValue, 365); // Set cookie for 1 year

                    if (twoSecondPassed) {
                        unhideForm('webinar-unlocked');
                        if (!fiveSecondElapsed && data.success && data.google) {
                            // If the zoom response came back in time, update the button urls and unhide the section
                            const googleCalendarLink = document.getElementById('addtocal-google');
                            const outlookCalendarLink = document.getElementById('addtocal-outlook');

                            if (googleCalendarLink) googleCalendarLink.href = data.google;
                            if (outlookCalendarLink) outlookCalendarLink.href = data.outlook;
                        
                            unhideForm('zoom-info');
                        }
                    }
                } catch (e) {
                    console.error('Error parsing response:', e);
                    displayError(); // handle parsing error
                }
            } else {
                displayError(); // handle non-200 status
            }
        };

        // handle network errors
        xhr.onerror = function () {
            console.error('Network error');
            displayError(); // handle network error
        };
    }

    // Retrieve the HTML form elements and store them in variables
    const form = document.getElementById('wf-form-Universal-Webinar-Form');
    const form2 = document.getElementById('wf-form-Universal-Webinar-Form-2');

    // capture form submission event
    if (form) form.addEventListener('submit', triggerSubmit);
    if (form2) form2.addEventListener('submit', triggerSubmit);
});