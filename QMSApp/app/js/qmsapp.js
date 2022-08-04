/* * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
import $ from 'jquery';

(function () {
	'use strict';
	document.addEventListener("DOMContentLoaded", function (event) {
		console.log('QMS App OpenMRS Open Web App Started...');
		initComponent();
	});
}());

function returnUrl() {

	var value = "";

	var myHeaders = new Headers();
	myHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
	myHeaders.append("Cookie", "JSESSIONID=4F55735593751E224686B006CD388234");

	$.ajax({
		url: '/openmrs/ws/rest/v1/conceptreferenceterm?codeOrName=React Api',
		type: 'GET',
		dataType: 'json',
		async: false,
		headers: myHeaders,
		data: {},
		success: function (data) {
			var str = (data.results[0].display);

			var mySubString = str.substring(
				str.lastIndexOf("(") + 1,
				str.lastIndexOf(")")
			);

			value = (mySubString);
		}
	});

	return value;
}

function initComponent() {

	var id = "";
	var userName = "";

	var myHeaders = new Headers();
	myHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
	myHeaders.append("Cookie", "JSESSIONID=2D158E83ACFB788998C7DB495F07C1B9");

	var requestOptions = {
		method: 'GET',
		headers: myHeaders,
		redirect: 'follow'
	};

	fetch("/openmrs/ws/rest/v1/session", requestOptions)
		.then(response => response.json())
		.then(result => {
			id = result.user.person.uuid;
			userName = result.user.display;
			getPersondetais(id, userName);
		})
		.catch(error => console.log('error', error));
}

function getPersondetais(userId, userName) {

	var requestHeaders = new Headers();
	requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
	requestHeaders.append("Cookie", "JSESSIONID=ED9DBD5CFD355A973EFFECD642D8331D");

	var instituteId = "";
	var requestOptions = {
		method: 'GET',
		headers: requestHeaders,
		redirect: 'follow'
	};

	fetch("/openmrs/ws/rest/v1/person/" + userId + "", requestOptions)
		.then(response => response.json())
		.then(result => {

			$(result.attributes).each(function (k, v) {
				if (v.display != null) {

					if ($.trim(v.display.split("=")[0]) == "Institute Id") {
						instituteId = $.trim(v.display.split("=")[1]);
					}
				}
			});

			getInstituteName(userId, userName, instituteId);
		})
		.catch(error => console.log('error', error));
}

function getInstituteName(userId, userName, instituteId) {

	var InstituteName = "";
	var requestHeaders = new Headers();
	requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
	requestHeaders.append("Cookie", "JSESSIONID=24D0761924138ED7E55C2CB6806B0633");

	var requestOptions = {
		method: 'GET',
		headers: requestHeaders,
		redirect: 'follow'
	};

	fetch("/openmrs/ws/rest/v1/location/" + instituteId + "", requestOptions)
		.then(response => response.json())
		.then(result => {
			InstituteName = result.display;
			console.log(returnUrl() + "?id=" + userId + "&&userName=" + userName + "&&instituteId=" + instituteId + "&&InstituteName=" + InstituteName)
			window.open(returnUrl() + "?id=" + userId + "&&userName=" + userName + "&&instituteId=" + instituteId + "&&InstituteName=" + InstituteName);
			setTimeout(function () {
				window.open(`${window.location.origin}/openmrs/`, "_self");
			}, 500);
		})
		.catch(error => console.log('error', error));
}

