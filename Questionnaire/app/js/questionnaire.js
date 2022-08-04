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
    console.log('questionnaire OpenMRS Open Web App Started.');
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

var ArraySectionIds=[];
var privilegesAccept=false;

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
	    InstituteUuidGloble=instituteId;
	   }else{
	   getInstituteName(userId,userName,instituteId);
	    InstituteUuidGloble=instituteId;
	   }
	  
  })
  .catch(error => console.log('error', error));
} 


function getInstituteName(userId,userName,instituteId){
	    loadClinicParamas(instituteId);
		loadQuestionnaire();
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
			LoadSectionList(instituteId);
			
		})
		.catch(error => console.log('error', error));
	 
} 



function LoadSectionList(instituteId){
	fetch("http://"+IPaddress+":8086/section/getSection_List/"+instituteId, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			},
		})
		.then(response => response.json())
		.then(result => {
			
			$(result).each(function (key, val) {
				//val.expireDate
                	ArraySectionIds.push(val.sectionid);
					loadClinic(val.sectionid);
			});
			
			
		})
}

function loadClinicParamas(instituteID){
		fetch("http://"+IPaddress+":8086/clinicParameters/clinicParametersLIst/"+instituteID, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
        })
        .then((response) => response.json())
        .then((result) => {
			var html="";
			
			$(result).each(function (key, val) {
				var gender="";
				var  Simpledata="";
		       html+="<tr><td style='display:none;'>"+val.clinicParametersId+"</td>";
			   html+="<td>"+val.parameterCode+"</td>";
			   html+="<td>"+val.description+"</td>";
			   
			   if(val.answerType  === null){
			    html+="<td></td>";
			   }else{
			   html+="<td>"+val.answerType+"</td>";
			   }
			   
			   var simpeArray=val.answerList;
			   
			   var obj = jQuery.parseJSON(simpeArray);
		       $.each(obj, function(key,value) {
				Simpledata=value.value+" ";
			    }); 
			   html+="<td>"+Simpledata+"</td>";
			   html+="<td>"+val.tooltip+"</td>";
			   if(val.allType==true){
				  gender="All ";
			   } 
			   if(val.male==true){
				   gender+="Male "; 
			   }
			   if(val.female==true){
				    gender+="Female "; 
			   } 
			   if(val.child==true){
				     gender+="Child "; 
			   }
			   html+="<td>"+gender+"</td>";
			   html+="<td>"+val.status+"</td>";
			   html+="<td>"+val.createDate+"</td>";
			   html+="<td><input type='checkbox'/></td></tr>";
			});
			$('#tableLIP2').DataTable().destroy();
			$('#tableLIP2_body').html(html);
	         $('#tableLIP2').DataTable();
        })
        .catch((error) => {
          console.log(error);
        });
}
	


function loadClinic(sectionid){
	
	var html="";
	$('#clinic').html("");
	//html+="<option value=''>--select--</option>";
	 fetch("http://"+IPaddress+":8086/sheduled_date/getdateshedule/"+sectionid, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			},
		})
		.then(response => response.json())
		.then(result => {
			
			
		
			$(result).each(function (key, val) {
                	html+="<option value="+val.sheduleDateId+" mytag='date'>"+val.section.section_name+" "+val.dates.split("T")[0]+"</option>";
					
			});
			//$('#Clinic').html(html);
			
			
		})
		
		fetch("http://"+IPaddress+":8086/sheduled_day/getdayshedule/"+sectionid, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			},
		})
		.then(response => response.json())
		.then(result => {
			
			
			
			$(result).each(function (key, val) {
				html+="<option value="+val.sheduledDayId+" mytag='day'>"+val.section.section_name+" "+val.day+"</option>";
					
			});
			$('#clinic').append(html);
			
			
		})
}


$('#btnAddToQuestionnaire').on('click',function(){
	var tableDrugAdju_Body_Main = [];
   
	var smallArray="";
	$('#tableLIP2_body tr').each(function () {
        //var tableDrugAdju_Body_temp = [];
        var tr = $(this);
		if(tr.find('td:eq(9) input').is(':checked')){
	    tableDrugAdju_Body_Main.push(tr.find('td:nth-child(1)').html());      
		smallArray+=tr.find('td:nth-child(1)').html()+"-";

	    //tableDrugAdju_Body_Main.push(tr.find('td:eq(9) input').is(':checked'));
       // tableDrugAdju_Body_Main.push(tableDrugAdju_Body_temp);
		}
       
      });
	  
	  var parameterCode=$('#parameterCode').val();
	  var questionnaireName=$('#questionnaireName').val();
	  var isDay=$('#clinic :selected').attr('mytag');;
	  var date="";
	  
	  if(isDay === "date"){
		  date="0001-"+$('#clinic :selected').val();
	  }else{
		  date="0002-"+$('#clinic :selected').val();
	  }
	  var Status=$('#Status :selected').text();
	  var Male= $('#Male').is(":checked");
	  var Female= $('#Female').is(":checked");
	  var Child= $('#Child').is(":checked");
	  var All= $('#All').is(":checked");
	  
	  var clinicalParamsArray=tableDrugAdju_Body_Main;
	  
	  var html="";
	  html+="<tr>";
	  
	  html+="<td style='display:none;'></td>";
	  html+="<td style='display:none;'>"+parameterCode+"</td>";
	  html+="<td>"+questionnaireName+"</td>";
	  html+="<td></td>";
	  html+="<td style='display:none;'>"+date+"</td>";
	  
	  html+="<td style='display:none;'>"+Status+"</td>";
	  html+="<td style='display:none;'>"+Male+"</td>";
	  html+="<td style='display:none;'>"+Female+"</td>";
	  html+="<td style='display:none;'>"+Child+"</td>";
	  html+="<td style='display:none;'>"+All+"</td>";
	 
	 html+="<td style='display:none;'>"+smallArray+"</td>";
	 
	  html+="</tr>";
	 

	  $('#tableLIP').DataTable().destroy();
	  $('#tableLIP_Body').append(html);
	  $('#tableLIP').DataTable();	 
	  
	  
	  
});
  

$('#btnSave').on('click',function(){

var parameterCode = $('#parameterCode').val();
var questionnaireName=$('#questionnaireName').val();
var clinic =$('#clinic :selected').attr("mytag");
var date="";
var day="";
if(clinic=="date"){
	date = $('#clinic :selected').val();
}else{
	day = $('#clinic :selected').val();
}

var Status =$('#Status :selected').text();

var tableDrugAdju_Body_Main = [];


$('#tableLIP_Body tr').each(function () {
  var tableDrugAdju_Body_temp = [];
  var tr = $(this);
 
  var QuestionnaireCode=tableDrugAdju_Body_temp.push(tr.find('td:nth-child(2)').html());
  var QuestionnaireName=tableDrugAdju_Body_temp.push(tr.find('td:nth-child(3)').html());
  var Clinic=tableDrugAdju_Body_temp.push(tr.find('td:nth-child(5)').html());
  var Status=tableDrugAdju_Body_temp.push(tr.find('td:nth-child(6)').html());
  var Male=tableDrugAdju_Body_temp.push(tr.find('td:nth-child(7)').html());
  var Female=tableDrugAdju_Body_temp.push(tr.find('td:nth-child(8)').html());
  var Child=tableDrugAdju_Body_temp.push(tr.find('td:nth-child(9)').html());
  var AllType=tableDrugAdju_Body_temp.push(tr.find('td:nth-child(10)').html());
  var ParamsArray=tableDrugAdju_Body_temp.push(tr.find('td:nth-child(11)').html());
  tableDrugAdju_Body_Main.push(tableDrugAdju_Body_temp);
	  
}); 


fetch("http://"+IPaddress+":8086/questionnaire/save", {
  method: "POST",
  headers: {
	"Content-Type": "application/json",
  },
  body: JSON.stringify({
	InstituteUuidGloble:InstituteUuidGloble,
	UserUuidGloble:UserUuidGloble,
	tableDrugAdju_Body_Main: tableDrugAdju_Body_Main
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
});

$('#btnCancel').on('click',function(){

	clearAll();
});

function clearAll(){
	$('#parameterCode').val("");
	$('#questionnaireName').val("");
	$('#clinic').val("").change();
	$('#Status').val("").change();
	$('#Male').prop('checked',false);
    $('#Female').prop('checked',false);
	$('#Child').prop('checked',false);
	$('#All').prop('checked',false);
	$('#tableLIP').DataTable().destroy();
	$('#tableLIP_body').html("");
	$('#tableLIP').DataTable();
}