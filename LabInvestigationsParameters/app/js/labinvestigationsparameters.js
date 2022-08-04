/* * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
import jquery from 'jquery';


var UserUuidGloble="";

var IPaddress="localhost";

(function () {
  'use strict';
  document.addEventListener("DOMContentLoaded", function(event) {
    console.log('labinvestigationsparameters OpenMRS Open Web App Started.');
    console.log('jQuery version: ' + jquery.fn.jquery);
	$('#tableLIP').DataTable();
    $('#tableLIP2').DataTable();
	initComponent();
	
  
  });
}());

var InstituteUuidGloble="";
var UserUuidGloble="";
var InstituteNameGloble="";
var GlobalLocationID="";

function initComponent(){
	
	
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
  
  
	
	loadTestName();
	loadTestType();
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
	   getInstituteName(userId,userName,instituteId);  
	   
	   }else{
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
			
			$('#instituteName').val(InstituteName);
			InstituteNameGloble="";
			InstituteNameGloble=InstituteName;
			
		})
		.catch(error => console.log('error', error));


	 
}

function loadTestType(){
	
	fetch("http://localhost:8086/testType/getTestTypes/", {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			},
		})
		.then(response => response.json())
		.then(result => {
			var html="";
			var isAssingFrist="";
			$(result).each(function (key, val) {
                	html+="<option value="+val.testTypeId+">"+val.testTypeName+"</option>";
					if(isAssingFrist==""){
						isAssingFrist=val.testTypeId;
					}
			});
			$('#testType').append(html);
			$('#testType').val(isAssingFrist).change();
			
		})
		.catch(error => console.log('error', error));
}


function loadTestName(){
	
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
	  loadTestDetails(instituteId);  
	   
	   }else{
		   InstituteUuidGloble=instituteId;	
	  loadTestDetails(instituteId);
	   }
	  
  })
  .catch(error => console.log('error', error));
  
	// window.open("http://localhost:3000?id="+userId+""); 
}		
		
	
function loadTestDetails(instituteUUID){
	
      fetch("http://localhost:8086/investigation/getInvitigationDetails/"+instituteUUID, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			},
		})
		.then(response => response.json())
		.then(result => {
			var html="";
			var isAssingFrist="";
			$(result).each(function (key, val) {
                	html+="<option value="+val.investigationId+">"+val.testName+"</option>";
					if(isAssingFrist==""){
						isAssingFrist=val.investigationId;
					}
			});
			$('#testName').append(html);
			$('#testName').val(isAssingFrist).change();
			
		})
		.catch(error => console.log('error', error));
}		


$('#btnAddOther').on('click',function(){
	$('#tableLIP2').DataTable().destroy();
	 var applyTo=$('#applyTo :selected').val();
	 var ageRange=$('#ageRange').val();
	 var reference=$('#reference').val();
     var high=$('#high').val();
	 var low=$('#low').val();
	 var hiddenKey=$('#hiddenKey').val();
	 
	 var MainArrayCount=MainArray.length;
	 var Valriable ={ "hiddenKey": hiddenKey, "applyTo": applyTo,"ageRange":ageRange,"reference":reference,"high":high,"low":low,"uniqNo":MainArrayCount};
     MainArray.push(Valriable);
	 
	 for(var i=0;i<MainArray.length;i++){
		  console.log("hiddenKey"+MainArray[i].hiddenKey);
		  console.log("applyTo"+MainArray[i].applyTo);
		  console.log("ageRange"+MainArray[i].ageRange);
		  console.log("reference"+MainArray[i].reference);
		  console.log("high"+MainArray[i].high);
		  console.log("low"+MainArray[i].low);
		  console.log("uniqNo"+MainArray[i].uniqNo);
		  console.log("--------------------------------");
	 }
	 
	 var html2="";
	 html2+='<tr>';
	 html2+='<td style="display:none;">'+hiddenKey+'</td>';
	 html2+='<td>'+applyTo+'</td>';
	 html2+='<td>'+ageRange+'</td>';
	 html2+='<td>'+reference+'</td>';
	 html2+='<td>'+high+'</td>';
	 html2+='<td>'+low+'</td>';
	 html2+='<td><button id="btnRemoveRow2" class="btn btn-danger btn-sm " onclick="removeRow2(this,'+MainArrayCount+')" type="button" style="background: #fc080c;"><span  style="font-size: 1.5em; color: white;" ><i class="fa fa-times"></i></button></td>';
	 html2+='</tr>';
	 
	 $('#tableLIP2_body').append(html2);
	 $('#tableLIP2').DataTable();
	 
	 clearFeaild2();
});



function clearFeaild2(){
	 $('#applyTo').val('');
	 $('#ageRange').val('');
	 $('#reference').val('');
     $('#high').val('');
	 $('#low').val('');	 
}


	
$('#btnIssue').on('click',function(){ 
  $('#tableLIP').DataTable().destroy();
	var testType=$('#testType :selected').val();
	var testName=$('#testName :selected').val();
	var printOnReport=$('#printOnReport :selected').val();
	var parameterName=$('#parameterName').val();
	var unit=$('#unit').val();
	if(testType==""){ 
		iziToast.error({
			title: 'Error',
			message: 'Please select test type!',
		});
	}else
	if(testName==""){
		iziToast.error({
			title: 'Error',
			message: 'Please select test name!',
		});
	}else
	if(parameterName==""){ 
		iziToast.error({
			title: 'Error',
			message: 'Please enter parameter name!',
		});
	}else
	if(unit==""){
		iziToast.error({
			title: 'Error',
			message: 'Please enter unit!',
		});
	}else if(printOnReport==""){
		iziToast.error({
			title: 'Error',
			message: 'Please select print report YES/NO!',
		});
	}
	else{
	
	var Male= $('#Male').is(":checked");
	var Female= $('#Female').is(":checked");
	var Child= $('#Child').is(":checked");
	if(Male){
		Male='<span style="font-size: 1.5em; color: Tomato;"><i class="fa fa-check"></i></span><input type="hidden" value="true">';
	}else{
		Male='<span  style="font-size: 1.5em; color: Mediumslateblue;" ><i class="fa fa-times"></i></span><input type="hidden" value="false">';
	}
	
	if(Female){
		Female='<span style="font-size: 1.5em; color: Tomato;"><i class="fa fa-check"></i></span><input type="hidden" value="true">';
	}else{
		Female='<span  style="font-size: 1.5em; color: Mediumslateblue;" ><i class="fa fa-times"></i></span><input type="hidden" value="false">';
	}
	
	if(Child){
		Child='<span style="font-size: 1.5em; color: Tomato;"><i class="fa fa-check"></i></span><input type="hidden" value="true">';
	}else{
		Child='<span  style="font-size: 1.5em; color: Mediumslateblue;" ><i class="fa fa-times"></i></span><input type="hidden" value="false">';
	}
	
	var rowCount = $("#tableLIP tr").length;
	rowCount+1;
	var html="";
	html+='<tr>';
	html+='<td style="display:none;"></td>';
	html+='<td>'+parameterName+'</td>';
	html+='<td>'+unit+'</td>';
	html+='<td>'+printOnReport+'</td>';
	html+='<td style=" text-align: center;">'+Male+'</td>';
	html+='<td style=" text-align: center;">'+Female+'</span></td>';
	html+='<td style=" text-align: center;">'+Child+'</td>';
	html+='<td><button class="btn newTable" type="button" color: Dodgerblue; onclick="OpenModal('+rowCount+')">Reference</button><input type="hidden" value='+rowCount+'></td>';
	html+='<td><button id="btnRemoveRow" class="btn btn-danger btn-sm" onclick="removeRow(this,'+rowCount+')" type="button" style="background: #fc080c;"><span  style="font-size: 1.5em; color: white;" ><i class="fa fa-times"></i></button></td>';
	html+='</tr>';
	
	$('#tableLIP_Body').append(html);
	
	$('#tableLIP').DataTable();
	clearFeaild1();
	}
	
});

$('.newTable').on('click',function(){
	alert("CICK02");
   	$('#tableLIP2_body').html("");
	 $('#tableLIP2').DataTable().destroy();
});
function clearFeaild1(){
	
	$('#parameterName').val('');
	$('#unit').val('');
	$('#printOnReport').val('');
	$('#Male').prop('checked',false);
    $('#Female').prop('checked',false);
	$('#Child').prop('checked',false);
}

$('#btnSave').on('click',function(){
	
	save();
});

function save() {
      var testType = $('#testType :selected').val();
	  var testName=$('#testName :selected').val();
	  var expiryDate = $('#expiryDate').val();
	
      var tableDrugAdju_Body_Main = [];
	  
	  
	  $('#tableLIP_Body tr').each(function () {
        var tableDrugAdju_Body_temp = [];
        var tr = $(this);
        tableDrugAdju_Body_temp.push(tr.find('td:nth-child(2)').html());
        tableDrugAdju_Body_temp.push(tr.find('td:nth-child(3)').html());
        tableDrugAdju_Body_temp.push(tr.find('td:nth-child(4)').html());
        tableDrugAdju_Body_temp.push(tr.find("td:eq(4) input[type='hidden']").val());
		tableDrugAdju_Body_temp.push(tr.find("td:eq(5) input[type='hidden']").val());
	    tableDrugAdju_Body_temp.push(tr.find("td:eq(6) input[type='hidden']").val());
		tableDrugAdju_Body_temp.push(tr.find("td:eq(7) input[type='hidden']").val());
		tableDrugAdju_Body_Main.push(tableDrugAdju_Body_temp);
			
      });
     
	fetch("http://"+IPaddress+":8086/labInvestigationsParameters/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
	      InstituteUuidGloble:InstituteUuidGloble,
		  testType:testType,
          testName: testName,
		  UserUuidGloble:UserUuidGloble,
          tableDrugAdju_Body_Main: tableDrugAdju_Body_Main,
		  MainArray:MainArray
       
        })
      })
        .then((response) => response.text())
        .then((result) => {
		
			
			if(result=="Not Saved"){
				Swal.fire(
					'Not Saved!',
					 result,
					'warning'
				)
			}else{
	    
				Swal.fire({
				icon: 'success',
				title: 'Saved Successfull!',
				text: result
  
			   })
			}
        })
        .catch((error) => {
          console.log(error);
        });
		
		

}

