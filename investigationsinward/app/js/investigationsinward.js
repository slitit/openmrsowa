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
    console.log('investigationsinward OpenMRS Open Web App Started.');
    console.log('jQuery version: ' + jquery.fn.jquery);
     
  
    dropDown1();
    dropDown2();
    dropDown3();
    dropDown4();
    dropDown5();
    initComponent();
    $("#priority").val(null).trigger("change");
    $("#antibiotic").val(null).trigger("change");
     
  });
}());




var IPaddress="localhost";

var InstituteUuidGloble="";
var UserUuidGloble="";
var InstituteNameGloble="";
var GlobalLocationID="";

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
	  	
	   setLocationID(instituteId);
	   
	   }else{
		   InstituteUuidGloble=instituteId;
	   getInstituteName(userId,userName,instituteId);
	  
	   setLocationID(instituteId);
	   
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
			
			$('#InsName').val(InstituteName);
			InstituteNameGloble="";
			InstituteNameGloble=InstituteName;
			loadeReferenceNumberce();
			
		})
		.catch(error => console.log('error', error));


	 
}




function  setLocationID(instituteId){
	
	var requestHeaders = new Headers();
		requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
		requestHeaders.append("Cookie", "JSESSIONID=ED9DBD5CFD355A973EFFECD642D8331D");
	
	var requestHeaders = new Headers();
		requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
		requestHeaders.append("Cookie", "JSESSIONID=ED9DBD5CFD355A973EFFECD642D8331D");
	          var requestOptions = {
            method: "GET",
            headers: requestHeaders,
            redirect: "follow",
          };
          //location rest API
          fetch("/openmrs/ws/rest/v1/location/" + instituteId, requestOptions)
            .then(function (response) {
              return response.json();
            })
            .then(result => {
			 $(result.attributes).each(function (k, v) {
                if (v.display != null) {
                  var locationId = "";
        
                  if ($.trim(v.display.split(":")[0]) == "Location Id") {
                    locationId = $.trim(v.display.split(":")[1]);
                    console.log("locationId: " + locationId);

                    GlobalLocationID=locationId;
					
                  }
                }
              });
			
			})
           
	
}





//reset Fields---------------------------------------------------------------------------------
function resetFields() {
  $("#test").val(null).trigger("change");
  //$("#injection").prop("disabled",true);
  $("#priority").val(null).trigger("change");
  $("#laboratory").val(null).trigger("change");
  $("#specialnotes").val(null);
  $("#antibiotic").val(null).trigger("change");
  $("#antibioticdetails").val(null);
}

//add data to table--------------------------------------------------------------------------------
$("#addBtn").on("click", function () {
  var test= $("#test option:selected").text();
  var priority = $("#priority option:selected").text();
  var laboratory = $("#laboratory option:selected").text();
  var specialnotes = $("#specialnotes").val();
  var antibiotic = $("#antibiotic option:selected").text();
  var antibioticdetails = $("#antibioticdetails").val();
  var t = $("#example").DataTable();

  if (test == "" ) {
    iziToast.error({
      position: "bottomRight",
      title: "",
      message: "Test cannot be empty!",
    });
  } else if (priority == "") {
    iziToast.error({
      position: "bottomRight",
      title: "",
      message: "Priority cannot be empty!",
    });
  } else if (laboratory == "") {
    iziToast.error({
      position: "bottomRight",
      title: "",
      message: "Laboratory cannot be empty!",
    });
  }  else if (specialnotes  == "") {
    iziToast.error({
      position: "bottomRight",
      title: "",
      message: "Specialnotes cannot be empty!",
    });
  } else if (antibiotic == "") {
    iziToast.error({
      position: "bottomRight",
      title: "",
      message: "Antibiotic cannot be empty!",
    });
  } else if (antibiotic == "yes" && antibioticdetails  == "") {
    iziToast.error({
      position: "bottomRight",
      title: "",
      message: "Antibiotic details cannot be empty!",
    });
  } else {
    t.row
      .add([
        test,
        priority,
        laboratory,
        specialnotes,
        antibiotic,
        antibioticdetails,
        '<button type="button" class="btn btn-default" id="btnDelete"><i class="fa fa-close" style="color:red;"></i></button>',
      ])
      .draw(false);
    resetFields();
   
  }
  
});

//delete Table row------------------------------------------------------------------------
$("#example").on("click", "#btnDelete", function () {
  var table = $("#example").DataTable();
  table.row($(this).parents("tr")).remove().draw(false);
});

//for priority dropdown
function dropDown5(){
   $("#priority").select2({
          width: "150px",
          placeholder: "Normal/Urgent",
          allowClear: true,
        });
  
}

//for type dropdown
function dropDown4(){
  $("#antibiotic").select2({
         width: "150px",
         placeholder: "Yes/No",
         allowClear: true,
       });
 
}

///drop down list for test
function dropDown1() {
  fetch("http://127.0.0.1:8000/api/test", {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    
    },
  })
    .then((response) => response.json())
    .then((data) => {
     
      const test_name = data.test_name.map((element) => {
        return element.test_name;
      });
     
      test_name.forEach((test_name) => {
        $("#test").select2({
          width: "150px",
          placeholder: "--Select--",
          allowClear: true,
        });
        $("#test").append(
          "<option value='" +
            test_name +
            "'>" +
            test_name +
            "</option>"
        );
        $("#test").trigger("change");
      });
    });
}

///drop down list for  laboratory
function dropDown2() {

  var id=InstituteUuidGloble;
  console.log(id);
  fetch("http://127.0.0.1:8000/api/lab/"+id, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    
    },
  }) 
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const section_name = data.section_name.map((element) => {
        return element.section_name;
      });
      console.log(section_name.length);
      section_name.forEach((section_name) => {
        $("#laboratory").select2({
          width: "150px",
          placeholder: "--Select--",
          allowClear: true,
        });
        $("laboratory").append(
          "<option value='" +
          section_name +
            "'>" +
          section_name +
          "</option>"
        );
        $("#laboratory").trigger("change");
      });
    });
}

///drop down list for  savetestgroup
function dropDown3() {
  fetch("http://127.0.0.1:8000/api/savetest_group", {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    
    },
  })
    .then((response) => response.json())
    .then((data) => {
      
      const test_group_name = data.test_group_name.map((element) => {
        return element.test_group_name;
      });
      console.log(test_group_name);
      test_group_name.forEach((test_group_name) => {
        $("#testgroup").select2({
          width: "150px",
          placeholder: "--Select--",
          allowClear: true,
        });
        $("#testgroup").append(
          "<option value='" +test_group_name +"'>" +test_group_name+"</option>"
        );
        $("#testgroup").trigger("change");
      });
    });
}

$("#saveBtn").on("click", function () {
  var bool = false;
  var table = $("#example").DataTable();
  var isEmpty = table.rows().count() === 0;
  var test_group_name=$("#testgroup option:selected").text();

  if (test_group_name == "") {
    iziToast.error({
      title: "Error",
      message: "Please select the test group before save!",
    });
  }else if (isEmpty) {
    iziToast.error({
      title: "Error",
      message: "Please add test to table before save!",
    });
  } else {
    $("#example > tbody > tr").each(function () {
      var test = $(this).find("td:eq(0)").html();
      var priority = $(this).find("td:eq(1)").html();
      var laboratory = $(this).find("td:eq(2)").html();
      var specialnotes = $(this).find("td:eq(3)").html();
      var antibiotic = $(this).find("td:eq(4)").html();
      var antibioticdetails = $(this).find("td:eq(5)").html();
    

      fetch("http://127.0.0.1:8000/api/save2", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
          // 'Origin, X-Requested-With, Content-Type, Accept':'*'
        },
        body: JSON.stringify({
          test_group_name: test_group_name,
          test: test,
          priority: priority,
          laboratory: laboratory,
          special_notes: specialnotes,
          antibiotic_given : antibiotic,
          antibiotic_details : antibioticdetails,
        
        }),
      })
        .then((response) => response.text())
        .then((data) => {
          {
            if (data == "200") {
              const Swal = require("sweetalert2");
              Swal.fire({
                icon: "success",
                title: "Your data has been saved",
                showConfirmButton: false,
                timer: 1500,
              });
            } else {
              alert(data);
            }
          }
        })
        .catch((error) => {
          console.log(error);
        });
      bool = true;
    });

    if (bool) {
      $("#example").DataTable().clear().destroy();
      $("#example").DataTable();
      resetFields();
    }
  }
});


//for add the savetest group
$("#savebtn1").on("click", function () {
  var bool = false;
  var groupname= $("#groupname").val();
  var savefor=$("input[type='radio']:checked").val();
  

  if (groupname == "") {
    iziToast.error({
      title: "Error",
      message: "Please add group name before save!",
    });
  } else if($("input[type='radio']").prop("checked", false)){
    iziToast.error({
      title: "Error",
      message: "Please select the save for before save!",
    });
  }else {

      fetch("http://127.0.0.1:8000/api/save1", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
          // 'Origin, X-Requested-With, Content-Type, Accept':'*'
        },
        body: JSON.stringify({
          test_group_name: groupname,
          save_for: savefor,
          institute_uuid: InstituteUuidGloble,
          create_by: UserUuidGloble
         
        
        }),
      })
        .then((response) => response.text())
        .then((data) => {
          {
            if (data == "200") {
              const Swal = require("sweetalert2");
              Swal.fire({
                icon: "success",
                title: "Test group has been added",
                showConfirmButton: false,
                timer: 1500,
              });
            } else {
              alert(data);
            }
          }
        })
        .catch((error) => {
          console.log(error);
        });
      bool = true;
    
      }
    if (bool) {
      
      resetFields();
      $("#groupname").val(null);
      $("input[type='radio']").prop("checked", false);
      return  false;
    }
  
}); 

//for cancel button
$("#cancelBtn").on("click", function () {
  const Swal = require("sweetalert2");
  Swal.fire({
    title: "Are you sure?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085D6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Cancel!",
  }).then((result) => {
    if (result.isConfirmed) {

      $("#example").DataTable().clear().destroy();
      $("#example").DataTable();
      resetFields();
      Swal.fire("Cancel!", "", "success");
    }
  });
});

