/* * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
import jquery from 'jquery';

(function () {
  'use strict';
  document.addEventListener("DOMContentLoaded", function(event) {
    console.log('clinicparameters OpenMRS Open Web App Started.');
    console.log('jQuery version: ' + jquery.fn.jquery);
	
	$('.select2').select2();
	initComponent();
	
  });
}());

var IPaddress="localhost";
//var IPaddress="123.231.114.160";
var InstituteUuidGloble="";
var UserUuidGloble="";
var InstituteNameGloble="";
var GlobalLocationID="";


$('#btnCancel').on('click',function(){
	
	clearInteface();
});



function clearInteface(){
	$('#parameterCode').val("");
	$('#answerType :selected').val("").change();
	$('#description').val("");
	$('#tags').val("");
	$('#Tooltip').val("");
	$('#Status :selected').val("");
	$('#Male').prop('checked',false);
    $('#Female').prop('checked',false);
	$('#Child').prop('checked',false);
	$('#All').prop('checked',false);
	
	
}

function initComponent(){
	console.log('initComponent');

	var id="";
	var userName="";
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
	  id=result.user.person.uuid;
	  userName=result.user.display;
	  UserUuidGloble=result.user.person.uuid;
	//  window.open("http://localhost:3000?id="+id+""); 
		
	  console.log("Before Id"+id);
	  getPersondetais(id,userName);
  })
  .catch(error => console.log('error', error));
  
  
 
}

function getPersondetais(userId,userName){
UserUuidGloble=userId;
var requestHeaders = new Headers();
requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
requestHeaders.append("Cookie", "JSESSIONID=ED9DBD5CFD355A973EFFECD642D8331D");
var instituteId="";
var requestOptions = {
  method: 'GET',
  headers: requestHeaders,
  redirect: 'follow'
};

fetch("/openmrs/ws/rest/v1/person/"+userId+"", requestOptions)
  .then(response => response.json())
  .then(result => {
	  console.log(result.attributes);
	   
	   instituteId=result.attributes[1].display.split("=")[1].trim();
	   if(instituteId=="true"){
	   instituteId=result.attributes[0].display.split("=")[1].trim();
	   InstituteUuidGloble=instituteId;
	   getInstituteName(userId,userName,instituteId);  
	  
	   }else{
		   InstituteUuidGloble=instituteId;
	   getInstituteName(userId,userName,instituteId);
	   
	   }
	  
  })
  .catch(error => console.log('error', error));
} 


function getInstituteName(userId,userName,instituteId){
		
	
		var InstituteName="";
		var requestHeaders = new Headers();
		requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
		requestHeaders.append("Cookie", "JSESSIONID=24D0761924138ED7E55C2CB6806B0633");

		var requestOptions = {
		method: 'GET',
		headers: requestHeaders,
		redirect: 'follow'
		};

		fetch("/openmrs/ws/rest/v1/location/"+instituteId+"", requestOptions)
		.then(response => response.json())
		.then(result => {
		 	InstituteName=result.display;
			
			$('#Institute').val(InstituteName);
			InstituteNameGloble="";
			InstituteNameGloble=InstituteName;
			
			
		})
		.catch(error => console.log('error', error));


	 
} 

$('#btnSave').on('click',function(){
	
	var parameterCode=$('#parameterCode').val();
	var answerType=$('#answerType :selected').val();
	var description=$('#description').val();
	var tags=$('#tags').val();
	var Tooltip=$('#Tooltip').val();
	var Status=$('#Status :selected').val();
	var Male= $('#Male').is(":checked");
	var Female= $('#Female').is(":checked");
	var Child= $('#Child').is(":checked");
	var All= $('#All').is(":checked");
	
	if(parameterCode==""){
		iziToast.error({
		title: 'Error',
		message: 'Please enter parameter code',
		});
	}else if(answerType==""){
		iziToast.error({
		title: 'Error',
		message: 'Please select answer type',
		});
	}else if(description==""){
		iziToast.error({
		title: 'Error',
		message: 'Please enter description',
		});
	}else{
	
	
	fetch("http://"+IPaddress+":8086/clinicParameters/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
	      InstituteUuidGloble:InstituteUuidGloble,
		  GlobalLocationID:GlobalLocationID,
		  UserUuidGloble:UserUuidGloble,
		  parameterCode:parameterCode,
		  answerType:answerType,
		  description:description,
		  tags:tags,
		  Tooltip:Tooltip,
		  Status:Status,
		  Male:Male,
		  Female:Female,
		  Child:Child,
		  All:All
        })
      })
        .then((response) => response.text())
        .then((result) => {
       
		  Swal.fire({
				position: 'center',
				icon: 'success',
				title: 'Saved Successfull!',
				text: result,
				showConfirmButton: false,
				timer: 1500
			})
        })
        .catch((error) => {
          console.log(error);
        });
	}
	
});
