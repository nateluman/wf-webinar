var statusElement = document.getElementById('status');
var status1 = statusElement.getAttribute('data-status');
var autocompleteRegform;
            
if (status1.trim().toLowerCase() === "upcoming") {
    let companyElementRegform = document.getElementById('Regform-practice');
} else {
    let companyElementRegform = document.getElementById('Recform-practice');
}

if (typeof google !== 'undefined')
	google.maps.event.addDomListener(window, 'load', initAutocomplete);
  companyElementRegform && companyElementRegform.addEventListener("click", geolocate);
  
  function initAutocomplete() {
  	autocompleteRegform = new google.maps.places.Autocomplete(companyElementRegform,{
    	types: ['establishment']
      });
    autocompleteRegform.setComponentRestrictions({'country': ['us']});
    autocompleteRegform.addListener('place_changed', fillInAddress);
  }
  
  function fillInAddress() {

  let place = this.getPlace()
  

	let addressFields = {
		postal_code: 'postal_code'
	}
 	
 	let nonAddressFields = {
        place_id: 'place_id',
        formatted_phone_number: 'formatted_phone_number'
    }

    
    for (let field in nonAddressFields) {
        let allNonAddressFields = document.getElementsByClassName('js-autofill-' + nonAddressFields[field])
        if (allNonAddressFields.length) {
            for (let i = 0; i < allNonAddressFields.length; i++) {
                allNonAddressFields[i].value = ''
            }

            if (place[field]) {
                let content = place[field]
                if (field === 'website') {
                    let url = parseURL(place[field])
                    content = url.protocol + '//' + url.host + url.pathname
                }
                for (let i = 0; i < allNonAddressFields.length; i++) {
                    allNonAddressFields[i].value = content
                    allNonAddressFields[i].classList.remove('input-empty')
                    allNonAddressFields[i].classList.add('input-not-empty')
                }
            }
        }
    }
    	

	for (let field in addressFields) {
		let allAddressFields = document.getElementsByClassName('js-autofill-' + addressFields[field])
		if (allAddressFields.length) {
			for (let i = 0; i < allAddressFields.length; i++) {
				allAddressFields[i].value = ''
			}
		}
	}
  for (let i = 0; i < place.address_components.length; i++) {
		let addressType = place.address_components[i].types[0]
		if (addressFields[addressType]) {
			let val = place.address_components[i]['long_name']
			if (addressType === 'administrative_area_level_1' && val === 'District of Columbia')
				val = 'Washington DC'

			let allAddressFields = document.getElementsByClassName('js-autofill-' + addressFields[addressType])
			if (allAddressFields.length) {
				for (let i = 0; i < allAddressFields.length; i++) {
					allAddressFields[i].value = val
					allAddressFields[i].classList.remove('input-empty')
					allAddressFields[i].classList.add('input-not-empty')
					allAddressFields[i].setCustomValidity('')
				}
			}
		}
	}

}