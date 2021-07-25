import { Platform } from 'react-native';
import { url } from '../constants';
import { GOOGLE_API_KEY } from '../constants.js'
import { makeRandomText, filterFileUri } from '../functions';

export const getGlobalInfo = () => {
	const method = 'POST';
	const request_url = `${url}/global/get_global_info`
	const headers = {
	  'Content-Type': 'application/json',
	}
	const body = JSON.stringify({ 
	});
  
	return fetch(request_url, { method, body, headers})
	  .then((res) => res.json());
};


export const getGeoData = (address) => {
	var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&key=" + GOOGLE_API_KEY;
	return fetch(url)
	.then((response) => response.json())
	.then((responseJson) => {
	    if (responseJson.results && responseJson.results.length > 0) {
	        let item = responseJson.results[0];

	        let lat = item.geometry.location.lat;
	        let lng = item.geometry.location.lng;

	        // Get ZipCode.
	        url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lng + "&key=" + GOOGLE_API_KEY;
	        return fetch(url)
	        .then((response) => response.json())
	        .then((responseJson) => {
	            if (responseJson.results && responseJson.results.length > 0) {
	                let item = responseJson.results[0];
	                var zipcode = '';
	                for (var i = 0; i < item.address_components.length; i++) {
	                    if(item.address_components[i].types[0] == 'postal_code'){
	                        zipcode = item.address_components[i].long_name;
	                        break;
	                    }
	                }
	                return {
	                	result: true,
	                    lat,
	                    lng,
	                    zipcode
	                };
	            } else {
	            	return {
	            		result: true,
	                    lat,
	                    lng,
	                    zipcode: '',
	                };
	            }
	        })
	        .catch((error) => {
	          return error;
	        });
	    } else {
	    	return responseJson.status;
	    }
	})
	.catch((error) => {
	  return error;
	});
};

export const uploadFile = (file) => {
	const formData = new FormData();
	const fileType = file.type;	
	const filename = file.filename ? file.filename : makeRandomText(20) + ".jpeg";
	const fileUri = filterFileUri(file.uri, Platform.OS);
	formData.append("file", {
		name: filename,
		type: fileType,
		uri: fileUri
	});   
	
	console.log("filename: ", filename);
	console.log("filenafileTypeme: ", fileType);
	console.log("fileUri: ", fileUri);

	var type = "";
	if (file.type.indexOf("image") >= 0) {
		type = "image";
	} else if (file.type.indexOf("audio") >= 0) {
		type = "audio";
	}

	formData.append("type", type);
	const request_url = `${url}/global/upload_file`
	return fetch(request_url, {
		method: "POST",
		body: formData
	})
  	.then(response => {
		console.log("response: ", response);
		return response.json()
	})
};