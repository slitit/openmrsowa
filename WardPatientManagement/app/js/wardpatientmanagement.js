/* * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
import jquery from "jquery";

(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", function (event) {
    console.log("wardpatientmanagement OpenMRS Open Web App Started.");
    console.log("jQuery version: " + jquery.fn.jquery);

    displayData();
	initComponent();
  });
})();


function initComponent(){
	console.log('initComponent');

	var id="";
	var userName="";
	//View Concept Datatypes
	var PrivilageName=$('.app-title').text().trim();
	var isPrivalageOK=false;

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
	 //ArrayPrivilage = result.user.privileges;
	 
	  isPrivalageOK=result.user.privileges.some(code => code.name === PrivilageName);
	  
	  if(isPrivalageOK){
	  id=result.user.person.uuid;
	  userName=result.user.display;
	  UserUuidGloble=result.user.person.uuid;
	
	  console.log("Before Id"+id);
	  getPersondetais(id,userName);
	  }else{
		window.open("/openmrs/owa/accessdenied/index.html","_self"); 
	  }
	  
  })
  .catch(error => console.log('error', error));
}


function displayData() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const phnno = urlParams.get("phnno");
  const bhtno = urlParams.get("bhtno");
  const gender = urlParams.get("gender");
  const age = urlParams.get("age");
  const admitted_date = urlParams.get("admitted_date");
  const admitted_time = urlParams.get("admitted_time");
  const given_name = urlParams.get("given_name");
  const admission_type = urlParams.get("admission_type");
  const institute_name = urlParams.get("institute_name");
  const consultant = urlParams.get("consultant");
  const ward = urlParams.get("ward");
  const uuid = urlParams.get("uuid");

  //txtIns,txtBhtNo,txtAdmissionType,txtAdmissionDate,txtWardUnit,
  //txtFullName,txtGender,txtAge,txtAdmissionTime,txtConsultant
  $("#txtPhnNo").val(phnno);
  $("#txtIns").val(institute_name);
  $("#txtBhtNo").val(bhtno);
  $("#txtAdmissionType").val(admission_type);
  $("#txtAdmissionDate").val(admitted_date);
  $("#txtWardUnit").val(ward);
  $("#txtFullName").val(given_name);
  $("#txtGender").val(gender);
  $("#txtAge").val(age);
  $("#txtAdmissionTime").val(admitted_time);
  $("#txtConsultant").val(consultant);

  //loadFormData(uuid);
  loadFormData(uuid);
}

function loadFormData(personUuid) {
  var requestHeaders = new Headers();
  requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
  requestHeaders.append(
    "Cookie",
    "JSESSIONID=24D0761924138ED7E55C2CB6806B0633"
  );

  var requestOptions = {
    method: "GET",
    headers: requestHeaders,
    redirect: "follow",
  };

  fetch("/openmrs/ws/rest/v1/patient/" + personUuid, requestOptions)
    .then((response) => response.json())
    .then((result) => {
      console.log(result);
      $(result.person.attributes).each(function (k, v) {
        if (v.display != null) {
          if ($.trim(v.display.split("=")[0]) == "ProfileImage") {
            $("#file_upload").attr(
              "src",
              "http://127.0.0.1:8000/storage/documents/" +
              // "http://localhost/LaravelApiFile/storage/documents/" +
                $.trim(v.display.split("=")[1])
            );
          }
        }
      });
    });
}

//Link to Patient History----------------------------------
$("#patientHistory").on("click", function () {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  var uuid = urlParams.get("uuid");
  var phnno = $("#txtPhnNo").val();
  location.href =
    "/openmrs/owa/patienthistory/index.html?phnno=" + phnno + "&uuid=" + uuid;
});

//Link to Allergy------------------------------------------------
$("#allergy").on("click", function () {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  var uuid = urlParams.get("uuid");
  var phnno = $("#txtPhnNo").val();
  location.href =
    "/openmrs/owa/allergyinward/index.html?phnno=" + phnno + "&uuid=" + uuid;
});

//Link to prescription------------------------------------------
$("#prescription").on("click", function () {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  var uuid = urlParams.get("uuid");
  var phnno = $("#txtPhnNo").val();
  location.href =
    "/openmrs/owa/prescriptioninward/index.html?phnno=" +
    phnno +
    "&uuid=" +
    uuid;
});

//Link to Examination-----------------------------------------------
$("#examination").on("click", function () {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  var uuid = urlParams.get("uuid");

  var phnno = $("#txtPhnNo").val();
  location.href =
    "/openmrs/owa/examinationinward/index.html?phnno=" +
    phnno +
    "&uuid=" +
    uuid;
});


//link to Radiology----------------------------------------
$("#radiology").on("click",function(){
	 const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  var uuid = urlParams.get("uuid");

  var phnno = $("#txtPhnNo").val();
  location.href =
    "/openmrs/owa/radiologyinward/index.html?phnno=" +
    phnno +
    "&uuid=" +
    uuid;
	
});


/* function loadFormData(uuid) {
  var patientUuid = uuid;

  var requestHeaders = new Headers();
  requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
  requestHeaders.append(
    "Cookie",
    "JSESSIONID=24D0761924138ED7E55C2CB6806B0633"
  );
  var phn = "";
  $.ajax({
    url: "/openmrs/ws/rest/v1/patient/" + patientUuid,
    type: "GET",
    dataType: "json",
    headers: requestHeaders,
    success: function (result) {
      $(result.person.attributes).each(function (k, v) {
        if (v.display != null) {
          if ($.trim(v.display.split("=")[0]) == "ProfileImage") {
            $("#file_upload").attr(
              "src",
              returnUrl() +
                "/storage/documents/" +
                $.trim(v.display.split("=")[1])
            );
          }
        }
      });
    },
  });
} */
