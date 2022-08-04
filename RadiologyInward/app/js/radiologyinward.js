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
    console.log('radiologyinward OpenMRS Open Web App Started.');
    console.log('jQuery version: ' + jquery.fn.jquery);
  });

  dropDownTest();
  fetchTable();
  dropDownRegionLocal();
  //initComponent();
  

}());



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



//reset fields------------------------------------------------------------------------------
function resetFeilds() {

$("#txtTest").val("--Select--");
$("#txtRegion").val("--Select--");
$("#txtLocal").val("--Select--");
$("#txtViewposition").val("--Select--");
$("#txtComment").val(null);
$("#txtStatus").val("--Select--");

}


//add data to table----------------------------------------------------------------------------
$("#btnAdd").on("click",function(){
  var test=$("#txtTest option:selected").text();
var region=$("#txtRegion option:selected").text();
var localization=$("#txtLocal option:selected").text();
var viewPosition=$("#txtViewposition option:selected").text();
var comment=$("#txtComment").val();
var priority=$("#txtStatus option:selected").text();
var t=$("#example").DataTable();
if($("#txtTest").find(":selected").prop("disabled")){
  iziToast.error({
    position: "bottomRight",
    title: "",
    message: "Test cannot be empty!",
  });
}else if($("#txtRegion").find(":selected").prop("disabled")){
  iziToast.error({
    position: "bottomRight",
    title: "",
    message: "Region cannot be empty!",
  });
}else if($("#txtLocal").find(":selected").prop("disabled")){
  iziToast.error({
    position: "bottomRight",
    title: "",
    message: "Localaization cannot be empty!",
  });
}else if($("#txtViewposition").find(":selected").prop("disabled")){
  iziToast.error({
    position: "bottomRight",
    title: "",
    message: "View Position cannot be empty!",
  });
}else if(comment==''){
  iziToast.error({
    position: "bottomRight",
    title: "",
    message: "Comment cannot be empty!",
  });
}else if($("#txtStatus").find(":selected").prop("disabled")){
  iziToast.error({
    position: "bottomRight",
    title: "",
    message: "Priority cannot be empty!",
  });
}else{
  t.row
  .add([
    test,
    region,
    localization,
    viewPosition,
    comment,
    priority,
    '<button type="button" class="btn btn-default" id="btnDelete"><i class="fa fa-close" style="color:red"></i></button>',
  ])
  .draw(false);

resetFeilds();
}
});

//delete table row-------------------------------------------------------------------------
$("#example").on("click", "#btnDelete", function () {
  var table = $("#example").DataTable();
  table.row($(this).parents("tr")).remove().draw(false);
});

//save button-----------------------------------------------------------------------------------
$("#btnSubmit").on("click", function () {
  var bool = false;
  var table = $("#example").DataTable();
  var isEmpty = table.rows().count() === 0;
var cby = userUuid();
  if (isEmpty) {
    iziToast.error({
      title: "Error",
      message: "Please add radiology to table before save!",
    });
  } else {
    $("#example > tbody > tr").each(function () {
      var test = $(this).find("td:eq(0)").html();
      var region = $(this).find("td:eq(1)").html();
      var localization = $(this).find("td:eq(2)").html();
      var viewPosition = $(this).find("td:eq(3)").html();
      var comment = $(this).find("td:eq(4)").html();
      var priority = $(this).find("td:eq(5)").html();
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      var uuid = urlParams.get("uuid");
      var phnno = urlParams.get("phnno");

      fetch("http://127.0.0.1:8000/saveRadiology", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
          // 'Origin, X-Requested-With, Content-Type, Accept':'*'
        },
        body: JSON.stringify({
          test: test,
          region: region,
          localization: localization,
          view_position: viewPosition,
          comment: comment,
          priority: priority,
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
  
  $.ajax({
    type: "GET",
    url: "http://127.0.0.1:8000/getSavedRadiology/" + phnno,
    dataType: "json",
    success: function (response) {
      $("#example2").DataTable().clear().destroy();
      $.each(response.radiology, function (key, item) {
        $("#example2 tbody").append(
          "<tr>\
            <td>" +
            item.test +
            "</td>\
            <td>" +
            item.region +
            "</td>\
            <td>" +
            item.localization +
            "</td>\
            <td>" +
            item.view_position +
            "</td>\
            <td>" +
            item.comment +
            "</td>\
            <td>" +
            item.priority +
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
  var test = data[0];
  var localization = data[2];

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
          "http://127.0.0.1:8000/deletRadiology/" +
          phnno +
          "/" +
          test +
          "/" +
          localization,
        success: function (response) {
          console.log(response);
          fetchTable();
        },
      });
      Swal.fire("Deleted!", "Institute has been deleted.", "success");
    }
  });
});

//Load drop downs--------------------------------------------------------------------------
function dropDownTest(){
  fetch("http://127.0.0.1:8000/getTest", {
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
      var test = document.getElementById("txtTest");
      const testname = data.testname.map((element) => {
        return element.test_name;
      });

      testname.forEach((testname) => {
        var ele = document.createElement("option");
        ele.textContent = testname;
        ele.value = testname;
        test.appendChild(ele);
      });
    });
}

function dropDownRegionLocal(){
  fetch("http://127.0.0.1:8000/getRegion", {
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
      var region = document.getElementById("txtRegion");
      var local = document.getElementById("txtLocal");
      var viewPosition = document.getElementById("txtViewposition");

      const regionName = data.regionLocal.map((element) => {
        return element.region;
      });
      const localization = data.regionLocal.map((element) => {
        return element.localization;
      });
      const view_position = data.regionLocal.map((element) => {
        return element.view_position;
      });

      regionName.forEach((regionName) => {
        var ele = document.createElement("option");
        ele.textContent = regionName;
        ele.value = regionName;
        region.appendChild(ele);
      });

      localization.forEach((localization) => {
        var ele = document.createElement("option");
        ele.textContent = localization;
        ele.value = localization;
        local.appendChild(ele);
      });

      view_position.forEach((view_position) => {
        var ele = document.createElement("option");
        ele.textContent =view_position;
        ele.value = view_position;
        viewPosition.appendChild(ele);
      });
    });
}