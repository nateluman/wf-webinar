//version 4
console.log('nate-gh');

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
        const email3 = formData.get('Email-2'); // Extracting Email value from the form

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
    const form = document.getElementById('wf-form-Webinar-Form-PS-2');

    // capture form submission event
    if (form) form.addEventListener('submit', triggerSubmit);
});
