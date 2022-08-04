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
    console.log("wardpatientmanagementselect OpenMRS Open Web App Started.");
    console.log("jQuery version: " + jquery.fn.jquery);
  });
  fetchTable();
  initComponent();
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


function initTable() {
  return $("#example").dataTable({
    scrollY: "200px",
    paginate: false,
    retrieve: true,
  });
}

function fetchTable() {
  //$("#example").DataTable().clear().destroy();
  $.ajax({
    type: "GET",
    url: "http://127.0.0.1:8000/LaravelApiFile/loadTable",
    dataType: "json",
    success: function (data) {
      $("#example").DataTable().clear().destroy();
      $.each(data.person, function (i, item) {
        $("tbody").append(
          "<tr>\
            <td>" +
            item.bhtno +
            "</td>\
            <td>" +
            item.phnno +
            "</td>\
            <td>" +
            item.given_name +
            " " +
            item.middle_name +
            " " +
            item.family_name +
            "</td>\
            <td>" +
            item.gender +
            "</td>\
            <td>" +
            item.age +
            "</td>\
            <td>" +
            item.admission_date +
            "</td>\
            <td>" +
            item.admission_time +
            '</td>\
            <td><button type="button" value="' +
            item.phnno +
            '"class="btn btn-block btn-success" style="background: #00463f;border-color:#00463f;" id="btnSelect">Select</button></td>\
            </tr>\''
        );
      });
      $("#example").DataTable();
      initTable();
    },
  });
}

$(document).on("click", "#btnSelect", function (e) {
// var number = $(this).val();
 var bhtno = $(this).closest('tr').find('td:eq(0)').text();
 var phnno = $(this).closest('tr').find('td:eq(1)').text();
 var gender = $(this).closest('tr').find('td:eq(3)').text();
 var age = $(this).closest('tr').find('td:eq(4)').text();
 var admission_date = $(this).closest('tr').find('td:eq(5)').text();
 var admission_time = $(this).closest('tr').find('td:eq(6)').text();
 var given_name = $(this).closest('tr').find('td:eq(2)').text();


 fetch("http://127.0.0.1:8000/LaravelApiFile/fillTextFileds/" + phnno, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            // 'Origin, X-Requested-With, Content-Type, Accept':'*'
          },
        })
          .then((response) => response.json())
          .then((data) => {
            {
              var admission_type=data[0]["admission_type"];
              var institute_name=data[0]["institute_name"];
              var consultant=data[0]["consultant"];
              var ward=data[0]["ward"];
              var uuid=data[0]["uuid"];
              
              location.href = "/openmrs/owa/wardpatientmanagement/index.html?phnno="+phnno+"&bhtno="+bhtno+"&gender="+gender+"&age="+age+"&admitted_date="+admission_date+"&admitted_time="+admission_time+"&given_name="+given_name+"&admission_type="+admission_type+"&institute_name="+institute_name+"&consultant="+consultant+"&ward="+ward+"&uuid="+uuid;
 
            }
          }); 
});
