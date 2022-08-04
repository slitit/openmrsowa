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
    console.log("examinationinward OpenMRS Open Web App Started.");
    console.log("jQuery version: " + jquery.fn.jquery);
  });

 initComponent();
  loadGeneralExamination();
})();

var IPaddress="localhost";

var InstituteUuidGloble="";
var UserUuidGloble="";
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


//reset Fields----------------------------------------------------------------------
function resetFields() {
  $("#exaDate").val(null);
  $("#exaTime").val(null);
  $("#txtheight").val(null);
  $("#txtweight").val(null);
  $("#txtWaist").val(null);
  $("#txtbmi").val(null);
  $("#txtsysto").val(null);
  $("#txtdiasto").val(null);
  $("#txtpuls").val(null);
  $("#txtRS").val(null);
  $("#txtTemp").val(null);
  $("#txtremark").val(null);
  $("#status").val("--Select--");

  $('#tbodyGeneralExamination input[name="capabilities"]:checked').each(function () {
    if ($(this).is(":checked")) {
      $(this).prop("checked", false);
    }
  });
}

//Cancel button---------------------------------------------------------------------
$("#btnClear").on("click", function () {
  resetFields();
});

//get values of checkbox------------------------------------------------------------
/* function checkboxValue() {
  var someGlobalArray = new Array();
  $('input[name="symptoms"]:checked').each(function () {
    //console.log(this.value);
    someGlobalArray.push($(this).val());
  });

  console.log(someGlobalArray);
} */

//save button--------------------------------------------------------
$("#btnSubmit").on("click", function () {
  saveData();
});

//save function---------------------------------------------------------------------------------------
function saveData() {
	
	var cby = userUuid();

	
  var date = $("#exaDate").val();
  var time = $("#exaTime").val();
  var height = $("#txtheight").val();
  var weight = $("#txtweight").val();
  var waist = $("#txtWaist").val();
  var bmi = $("#txtbmi").val();
  var systolic_bp = $("#txtsysto").val();
  var diastolic_bp = $("#txtdiasto").val();
  var pulse_rate = $("#txtpuls").val();
  var rs = $("#txtRS").val();
  var temperature = $("#txtTemp").val();
  var remark = $("#txtremark").val();
  var status = $("#status option:selected").text();
  var selected = new Array();
  $('#tbodyGeneralExamination input[type="checkbox"]:checked').each(
    function () {
      var serial = $(this).parents("tr").find("td:nth-child(1)").text();
      selected.push(serial);
    }
  );
  if (date == "") {
    iziToast.error({
      position: "bottomRight",
      title: "",
      message: "Date cannot be empty!",
    });
  } else if (time == "") {
    iziToast.error({
      position: "bottomRight",
      title: "",
      message: "Time cannot be empty!",
    });
  } else if (height == "") {
    iziToast.error({
      position: "bottomRight",
      title: "",
      message: "Height cannot be empty!",
    });
  } else if (!height.match(/^\d*\.?\d*$/)) {
    iziToast.error({
      position: "bottomRight",
      title: "",
      message: "Height must be numberic!",
    });
  } else if (weight == "") {
    iziToast.error({
      position: "bottomRight",
      title: "",
      message: "weight cannot be empty!",
    });
  } else if (!weight.match(/^\d*\.?\d*$/)) {
    iziToast.error({
      position: "bottomRight",
      title: "",
      message: "weight must be numeric!",
    });
  } else if (waist == "") {
    iziToast.error({
      position: "bottomRight",
      title: "",
      message: "weight cannot be empty!",
    });
  } else if (!waist.match(/^\d*\.?\d*$/)) {
    iziToast.error({
      position: "bottomRight",
      title: "",
      message: "weight must be numeric!",
    });
  } else if (!systolic_bp.match(/^\d*\.?\d*$/)) {
    iziToast.error({
      position: "bottomRight",
      title: "",
      message: "Systolic BP must be numberic!",
    });
  } else if (systolic_bp == "") {
    iziToast.error({
      position: "bottomRight",
      title: "",
      message: "Systolic BP cannot be empty!",
    });
  } else if (diastolic_bp == "") {
    iziToast.error({
      position: "bottomRight",
      title: "",
      message: "Diastolic BP cannot be empty!",
    });
  } else if (!diastolic_bp.match(/^\d*\.?\d*$/)) {
    iziToast.error({
      position: "bottomRight",
      title: "",
      message: "Diastolic BP must be numeric!",
    });
  } else if (pulse_rate == "") {
    iziToast.error({
      position: "bottomRight",
      title: "",
      message: "Pulse Rate cannot be empty!",
    });
  } else if (!pulse_rate.match(/^\d*\.?\d*$/)) {
    iziToast.error({
      position: "bottomRight",
      title: "",
      message: "Pulse Rate must be numeric!",
    });
  } else if (rs == "") {
    iziToast.error({
      position: "bottomRight",
      title: "",
      message: "RS cannot be empty!",
    });
  } else if (temperature == "") {
    iziToast.error({
      position: "bottomRight",
      title: "",
      message: "Temprature cannot be empty!",
    });
  } else if (!temperature.match(/^\d*\.?\d*$/)) {
    iziToast.error({
      position: "bottomRight",
      title: "",
      message: "Temprature must be numeric!",
    });
  } else if (remark == "") {
    iziToast.error({
      position: "bottomRight",
      title: "",
      message: "Remark cannot be empty!",
    });
  } else if ($("#status").find(":selected").prop("disabled")) {
    iziToast.error({
      position: "bottomRight",
      title: "",
      message: "Select status!",
    });
  } else {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    var uuid = urlParams.get("uuid");
    var phnno = urlParams.get("phnno");
    fetch("http://127.0.0.1:8000/LaravelApiFile/examinationInward", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        // 'Origin, X-Requested-With, Content-Type, Accept':'*'
      },
      body: JSON.stringify({
        date: date,
        time: time,
        height: height,
        weight: weight,
        waist: waist,
        bmi: bmi,
        systolic_bp: systolic_bp,
        diastolic_bp: diastolic_bp,
        pulse_rate: pulse_rate,
        rs: rs,
        temperature: temperature,
        remark: remark,
        general_examination: selected.toString(),
        status: status,
        phnno: phnno,
        uuid: uuid,
		cby: cby,
      }),
    })
      .then((response) => response.text())
      .then((data) => {
        {
          console.log(data.length);
          if (data == "200") {
            console.log("Data Saved");
            const Swal = require("sweetalert2");
            Swal.fire({
              icon: "success",
              title: "Your work has been saved",
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
    resetFields();
  }
}

//calculate BMI-------------------------------------------------------------------------------------
$(".cal").on("input", function () {
  var height = $("#txtheight").val();
  var weight = $("#txtweight").val();
  var bmi;
  bmi = (weight / height / height) * 10000;

  $("#txtbmi").val(bmi.toFixed(2));
});

//General Examination Load---------------------------------------------------------------------------------
function loadGeneralExamination() {
  fetch("http://127.0.0.1:8000/loadGeneralExamination", {
    method: "POST",
  })
    .then((response) => response.json())
    .then((result) => {
      console.log(result);
      var tr = "";
      $(result).each(function (key, val) {
        tr +=
          '<tr><td style="display: none;">' +
          val.GeneralExaminationId +
          '</td><th><input id="' +
          val.Name +
          'role" type="checkbox" \
        name="capabilities"><label for="' +
          val.Name +
          'role" style="position: relative; top: -8px; left: 15px;"> ' +
          val.Name +
          "</label></th></tr>";
      });

      $("#tbodyGeneralExamination").html("");
      $("#tbodyGeneralExamination").html(tr);
    })
    .catch((error) => console.log("error", error));
}
