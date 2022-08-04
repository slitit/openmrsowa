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
    console.log("allergyinward OpenMRS Open Web App Started.");
    console.log("jQuery version: " + jquery.fn.jquery);
  });

  fetchTable();
 // initComponent();
  
})();


function userUuid() {

  var value = "";

  $.ajax({
    url: '/openmrs/ws/rest/v1/session',
    type: 'GET',
    dataType: 'json',
    async: false,
    data: {},
    success: function (data) {

      value = (data.user.uuid);
    }
  });

  return value;
}

var cby = userUuid();
console.log("user Id Check: " +cby);



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




//reset Fields---------------------------------------------------------------------------------
function resetFeilds() {
  $("#txtAllergy").val(null);
  $("#txtStatus").val($("#status").val("--Select--"));
  $("#txtRemarks").val(null);
}

//add data to table--------------------------------------------------------------------------------
$("#btnAdd").on("click", function () {
  var allergy = $("#txtAllergy").val();
  var status = $("#txtStatus option:selected").text();
  var remarks = $("#txtRemarks").val();
  var t = $("#example").DataTable();

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  var phnno = urlParams.get("phnno");

  if (allergy == "") {
    iziToast.error({
      position: "bottomRight",
      title: "",
      message: "Allergy cannot be empty!",
    });
  } else if ($("#txtStatus").find(":selected").prop("disabled")) {
    iziToast.error({
      position: "bottomRight",
      title: "",
      message: "Status cannot be empty!",
    });
  } else if (remarks == "") {
    iziToast.error({
      position: "bottomRight",
      title: "",
      message: "Remarks cannot be empty!",
    });
  } else {
    fetch(
      "http://127.0.0.1:8000/checkAllergy/" +
        allergy +
        "/" +
        phnno +
        "/" +
        status,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
          // 'Origin, X-Requested-With, Content-Type, Accept':'*'
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        {
          console.log(data["allergyAll"]);
          if (data["allergyAll"] == true) {
            console.log("data exist");
            iziToast.error({
              position: "bottomRight",
              title: "",
              message: "Patient allegy is already saved with same status! Allergy Name: " + allergy,
            });

          } else {
            t.row
              .add([
                allergy,
                status,
                remarks,
                '<button type="button" class="btn btn-default" id="btnDelete"><i class="fa fa-close" style="color:red"></i></button>',
              ])
              .draw(false);

            resetFeilds();
          }
          
        }
      });
  }
  
});

//delete Table row------------------------------------------------------------------------
$("#example").on("click", "#btnDelete", function () {
  var table = $("#example").DataTable();
  table.row($(this).parents("tr")).remove().draw(false);
});

//re-Initisalize Table--------------------------------------------------------------
function initTable() {
  return $("#example2").dataTable({
    scrollY: "200px",
    paginate: false,
    retrieve: true,
  });
}

//Load Table--------------------------------------------------------------------------------------
function fetchTable() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  var phnno = urlParams.get("phnno");
  console.log(phnno);
  $.ajax({
    type: "GET",
    url: "http://127.0.0.1:8000/getSavedAllergy/" + phnno,
    dataType: "json",
    success: function (response) {
      $("#example2").DataTable().clear().destroy();
      $.each(response.allergy, function (key, item) {
        $("#example2 tbody").append(
          "<tr>\
            <td>" +
            item.allergy +
            "</td>\
            <td>" +
            item.status +
            "</td>\
            <td>" +
            item.remarks +
            '</td>\
            <td><button type="button" value="' +
            item.phnno +
            '" class="btn btn-default" id="btnbackendDelete"><i class="fa fa-trash"></i></button></td>\
            </tr>\''
        );
      }); //
      $("#example2").DataTable();
      initTable();
    },
  });
}

//delete from database--------------------------------------------------------------------------
$(document).on("click", "#btnbackendDelete", function (e) {
  e.preventDefault();
  var table = $("#example2").DataTable();
  var data = table.row($(this).parents("tr")).data();
  var phnno = $(this).val();
  var allergy = data[0];
  var status = data[1];
  /* var allergy = $(this).find("td:eq(0)").html();
  var status = $(this).find("td:eq(1)").html(); */
  console.log(allergy, status);
  const Swal = require("sweetalert2");
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        type: "DELETE",
        url:
          "http://127.0.0.1:8000/deleteAllergy/" +
          phnno +
          "/" +
          status +
          "/" +
          allergy,
        success: function (response) {
          console.log(response);
          fetchTable();
        },
      });
      Swal.fire("Deleted!", "Institute has been deleted.", "success");
    }
  });
});

//save button-----------------------------------------------------------------------------------
$("#btnSubmit").on("click", function () {
	var cby = userUuid();
  var bool = false;
  var table = $("#example").DataTable();
  var isEmpty = table.rows().count() === 0;

  if (isEmpty) {
    iziToast.error({
      title: "Error",
      message: "Please add allergy to table before save!",
    });
  } else {
    $("#example > tbody > tr").each(function () {
      var allergy = $(this).find("td:eq(0)").html();
      var status = $(this).find("td:eq(1)").html();
      var remarks = $(this).find("td:eq(2)").html();
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      var uuid = urlParams.get("uuid");
      var phnno = urlParams.get("phnno");

      fetch("http://127.0.0.1:8000/saveAllergy", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
          // 'Origin, X-Requested-With, Content-Type, Accept':'*'
        },
        body: JSON.stringify({
          allergy: allergy,
          status: status,
          remarks: remarks,
          uuid: uuid,
          phnno: phnno,
		  cby: cby,
        }),
      })
        .then((response) => response.text())
        .then((data) => {
          {
            if (data == "200") {
              const Swal = require("sweetalert2");
              Swal.fire({
                icon: "success",
                title: "Your work has been saved",
                showConfirmButton: false,
                timer: 1500,
                
              });
              fetchTable();
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
      
    }
   
  }
  
});
