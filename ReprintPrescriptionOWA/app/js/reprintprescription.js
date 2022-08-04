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
    console.log('reprintprescription OpenMRS Open Web App Started.');
  });
}());


function returnUrl() {

  var value = "";

  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
  myHeaders.append("Cookie", "JSESSIONID=4F55735593751E224686B006CD388234");

  $.ajax({
    url: '/openmrs/ws/rest/v1/conceptreferenceterm?codeOrName=LaravelApi',
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

function instituteUuid() {
  var value = "";

  $.ajax({
    url: '/openmrs/ws/rest/v1/session',
    type: 'GET',
    dataType: 'json',
    async: false,
    data: {},
    success: function (data) {

      var personuuid = data.user.person.uuid;

      $.ajax({
        url: '/openmrs/ws/rest/v1/person/' + personuuid,
        type: 'GET',
        dataType: 'json',
        async: false,
        data: {},
        success: function (data) {

          var InstituteUuid = "";
          $(data.attributes).each(function (k, v) {
            if (v.display != null) {

              if ($.trim(v.display.split("=")[0]) == "Institute Id") {
                InstituteUuid = $.trim(v.display.split("=")[1]);
              }
            }
          });

          value = InstituteUuid;
        }
      });
    }
  });

  return value;
}

function availableUnitForUser(useruuid, insuuid) {

  var unit = "";
  var counter = "";

  $.ajax({
    url: returnUrl() + "/AvailableUnitForUser",
    type: 'POST',
    dataType: 'json',
    async: false,
    data: { useruuid: useruuid, insuuid: insuuid },
    success: function (data) {

      unit = (data[0].queue);
      counter = (data[0].counter);
    }
  });

  return [unit, counter];
}

//================================================================================

loadInstituteName();
function loadInstituteName() {

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

      var personuuid = result.user.person.uuid;

      var requestHeaders = new Headers();
      requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
      requestHeaders.append("Cookie", "JSESSIONID=ED9DBD5CFD355A973EFFECD642D8331D");

      var requestOptions = {
        method: 'GET',
        headers: requestHeaders,
        redirect: 'follow'
      };

      fetch("/openmrs/ws/rest/v1/person/" + personuuid, requestOptions)
        .then(response => response.json())
        .then(result => {

          var InstituteUuid = "";
          $(result.attributes).each(function (k, v) {
            if (v.display != null) {

              if ($.trim(v.display.split("=")[0]) == "Institute Id") {
                InstituteUuid = $.trim(v.display.split("=")[1]);
              }
            }
          });

          $('#txtinstituteuuid').val(InstituteUuid);

          var requestHeaders = new Headers();
          requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
          requestHeaders.append("Cookie", "JSESSIONID=24D0761924138ED7E55C2CB6806B0633");

          var requestOptions = {
            method: 'GET',
            headers: requestHeaders,
            redirect: 'follow'
          };

          fetch("/openmrs/ws/rest/v1/location/" + InstituteUuid, requestOptions)
            .then(response => response.json())
            .then(result => {

              var instituteName = result.display;
              $("#lblInstituteName").text(instituteName);
            })
            .catch(error => console.log('error', error));

        })
        .catch(error => console.log('error', error));
    })
    .catch(error => console.log('error', error));
}

$('#txtPhnNo').on('change', function () {

  var phnVal = $(this).val();

  $('#file_upload').attr('src', returnUrl() + '/storage/documents/useremprty.png');
  $('.rof').val("");

  if (phnVal != "") {

    $.ajax({
      url: returnUrl() + "/getPersonUUidFromPHN",
      type: "POST",
      dataType: "json",
      data: { phn: phnVal },
      success: function (data) {

        loadFormData(data.uuid, phnVal);
      }, complete: function () {
        loadLastPrescribingList(phnVal);
      }
    });
  }
});

function loadFormData(uuid, phnVal) {

  var patientUuid = uuid;

  $('#patientUuid').val(patientUuid);

  var requestHeaders = new Headers();
  requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
  requestHeaders.append("Cookie", "JSESSIONID=24D0761924138ED7E55C2CB6806B0633");

  var requestOptions = {
    method: 'GET',
    headers: requestHeaders,
    redirect: 'follow'
  };

  fetch("/openmrs/ws/rest/v1/patient/" + patientUuid, requestOptions)
    .then(response => response.json())
    .then(result => {

      $('#txtFullName').val($.trim(result.person.display));
      $('#txtGender').val($.trim(result.person.gender));
      $('#txtDob').val($.trim(result.person.birthdate).split("T")[0]);

      if (result.person.birthdate != null) {
        getAge($.trim(result.person.birthdate))
      }

      $(result.person.attributes).each(function (k, v) {
        if (v.display != null) {

          if ($.trim(v.display.split("=")[0]) == "Title") {
            $('#drpTitle').val($.trim(v.display.split("=")[1]));
          }
          if ($.trim(v.display.split("=")[0]) == "ProfileImage") {
            $('#file_upload').attr('src', returnUrl() + '/storage/documents/' + $.trim(v.display.split("=")[1]));
          }
          if ($('#txtDob').val() == "") {
            if ($.trim(v.display.split("=")[0]) == "Years") {
              $('#txtYears').val($.trim(v.display.split("=")[1]));
            }
            if ($.trim(v.display.split("=")[0]) == "Months") {
              $('#txtMonths').val($.trim(v.display.split("=")[1]));
            }
            if ($.trim(v.display.split("=")[0]) == "Days") {
              $('#txtDays').val($.trim(v.display.split("=")[1]));
            }
          }

        }
      });

    })
    .catch(error => console.log('error', error));
}

function getAge(dateString) {
  var today = new Date();
  var DOB = new Date(dateString);
  var totalMonths = (today.getFullYear() - DOB.getFullYear()) * 12 + today.getMonth() - DOB.getMonth();
  totalMonths += today.getDay() < DOB.getDay() ? -1 : 0;
  var years = today.getFullYear() - DOB.getFullYear();
  if (DOB.getMonth() > today.getMonth())
    years = years - 1;
  else if (DOB.getMonth() === today.getMonth())
    if (DOB.getDate() > today.getDate())
      years = years - 1;

  var days;
  var months;

  if (DOB.getDate() > today.getDate()) {
    months = (totalMonths % 12);
    if (months == 0)
      months = 11;
    var x = today.getMonth();
    switch (x) {
      case 1:
      case 3:
      case 5:
      case 7:
      case 8:
      case 10:
      case 12: {
        var a = DOB.getDate() - today.getDate();
        days = 31 - a;
        break;
      }
      default: {
        var a = DOB.getDate() - today.getDate();
        days = 30 - a;
        break;
      }
    }

  }
  else {
    days = today.getDate() - DOB.getDate();
    if (DOB.getMonth() === today.getMonth())
      months = (totalMonths % 12);
    else
      months = (totalMonths % 12) + 1;
  }


  $('#txtYears').val(years);
  $('#txtMonths').val(months);
  $('#txtDays').val(days);
}

var doctorUUid = "";
function loadLastPrescribingList(phnNo) {

  $.ajax({
    url: returnUrl() + '/LoadLastPrescribingList',
    type: 'POST',
    dataType: 'json',
    data: { phnNo: phnNo },
    success: function (data) {

      var tr = "";
      $(data).each(function (key, val) {
        tr += "<tr>";
        tr += "<td attr-val='" + val.ordereddrug + "'>" + val.ordered + " " + val.ordereddose + "</td>";
        tr += "<td attr-val='" + val.issueddrug + "'>" + val.issued + " " + val.ordereddose + "</td>";
        tr += "<td>" + val.batchno + "</td>";
        tr += "<td>" + val.dosecomment + "</td>";
        tr += "<td>" + val.period + "</td>";
        tr += "<td>" + parseFloat(val.qty).toFixed(0) + "</td>";
        tr += "</tr>";
      });

      $('#lastPrescriptionTbody').html("");
      $('#lastPrescriptionTbody').html(tr);

      doctorUUid = data[0].cby;

    }
  });
}

$('#btnPrintLastPrescription').on('click', function () {
  var phnNo = $('#txtPhnNo').val();
  setDataPrint(phnNo);
});

function setDataPrint(phnNo) {

  $.ajax({
    url: returnUrl() + '/GetPersonUuidFromUserUuid',
    type: 'post',
    dataType: 'json',
    async: false,
    data: {
      doctorUserUUid: doctorUUid,
    },
    success: function (data) {
      var doctorPersonUuid = data[0].uuid;

      $.ajax({
        url: "/openmrs/ws/rest/v1/person/" + doctorPersonUuid,
        type: 'GET',
        dataType: 'json',
        async: false,
        success: function (result) {
          var title = "";
          $(result.attributes).each(function (k, v) {
            if (v.display != null) {
              if ($.trim(v.display.split("=")[0]) == "Title") {
                title = $('#drpTitle').val($.trim(v.display.split("=")[1]));
              }
            }
          });

          $("#userNameCon").text(title + " " + $.trim(result.display.split(" ")[0]) + " " + $.trim(result.display.split(" ")[1]));
        }
      });

    }
  });


  $.ajax({
    url: "/openmrs/ws/rest/v1/session/",
    type: 'GET',
    dataType: 'json',
    async: false,
    success: function (data) {

      var personuuid = data.user.person.uuid;

      $.ajax({
        url: "/openmrs/ws/rest/v1/person/" + personuuid,
        type: 'GET',
        dataType: 'json',
        async: false,
        success: function (result) {
          var InstituteUuid = "";
          var title = "";
          $(result.attributes).each(function (k, v) {
            if (v.display != null) {
              if ($.trim(v.display.split("=")[0]) == "Institute Id") {
                InstituteUuid = $.trim(v.display.split("=")[1]);
              }
              if ($.trim(v.display.split("=")[0]) == "Title") {
                title = $('#drpTitle').val($.trim(v.display.split("=")[1]));
              }
            }
          });

          var location = InstituteUuid;

          $.ajax({
            url: "/openmrs/ws/rest/v1/location/" + location,
            type: 'GET',
            dataType: 'json',
            async: false,
            success: function (result) {

              var InstituteName = result.display;
              var instituteId = ($.trim(result.attributes.find(x => x.display).display.split(":")[1]));

              $('#placeHolderInstituteName').text(InstituteName);
            }
          });
        }
      });

    }
  });

  $.ajax({
    url: returnUrl() + '/LoadPatientUUidFromPhn',
    type: 'POST',
    dataType: 'json',
    data: {
      phnNo: phnNo,
    },
    async: false,
    success: function (data) {

      var personUuid = data[0].uuid;

      $.ajax({
        url: "/openmrs/ws/rest/v1/patient/" + personUuid,
        type: 'GET',
        dataType: 'json',
        async: false,
        success: function (data) {

          var title = "";
          $(data.person.attributes).each(function (k, v) {
            if (v.display != null) {

              if ($.trim(v.display.split("=")[0]) == "Title") {
                title = $.trim(v.display.split("=")[1]);
              }
            }
          });

          $("#placeHolderPatientName").text(title + " " + $.trim(data.person.display.split(" ")[0]) + " " + $.trim(data.person.display.split(" ")[1]));
          $("#placeHolderPHN").text(phnNo);
          getAge(data.person.birthdate);
        }
      });
    }
  });

  function getAge(dateString) {
    var today = new Date();
    var DOB = new Date(dateString);
    var totalMonths = (today.getFullYear() - DOB.getFullYear()) * 12 + today.getMonth() - DOB.getMonth();
    totalMonths += today.getDay() < DOB.getDay() ? -1 : 0;
    var years = today.getFullYear() - DOB.getFullYear();
    if (DOB.getMonth() > today.getMonth())
      years = years - 1;
    else if (DOB.getMonth() === today.getMonth())
      if (DOB.getDate() > today.getDate())
        years = years - 1;

    var days;
    var months;

    if (DOB.getDate() > today.getDate()) {
      months = (totalMonths % 12);
      if (months == 0)
        months = 11;
      var x = today.getMonth();
      switch (x) {
        case 1:
        case 3:
        case 5:
        case 7:
        case 8:
        case 10:
        case 12: {
          var a = DOB.getDate() - today.getDate();
          days = 31 - a;
          break;
        }
        default: {
          var a = DOB.getDate() - today.getDate();
          days = 30 - a;
          break;
        }
      }

    }
    else {
      days = today.getDate() - DOB.getDate();
      if (DOB.getMonth() === today.getMonth())
        months = (totalMonths % 12);
      else
        months = (totalMonths % 12) + 1;
    }

    months = ("0" + months).slice(-2);
    days = ("0" + days).slice(-2);

    $('#placeHolderAge').text(years + "Y" + months + "M" + days + "D");
  }

  var tr = "";
  $('#lastPrescriptionTbody tr').each(function () {
  
      var drugname = $(this).find('td:nth-child(2)').text();
      var period = $(this).find('td:nth-child(5)').text();

      tr += "<tr><td>" + drugname + " " + period + "</td></tr>";
    
  })
  $('#tBodyMedic').html("");
  $('#tBodyMedic').html(tr);

  printElement();
}

function printElement() {

  var domClone = $("#printableContent").html();

  var mywindow = window.open("");
  mywindow.height;
  mywindow.document.write("<html><head>");
  mywindow.document.write("<style>.demo-wrap {position: relative;}");
  mywindow.document.write(".demo-wrap:before { content: ' '; display: block; position: absolute;");
  mywindow.document.write("left: 0; top: 0; width: 100%; height: 100%; opacity: 0.2;");
  mywindow.document.write("background-image: url('img/logo.png');");
  mywindow.document.write("background-repeat: no-repeat;");
  mywindow.document.write("background-position: center; background-size: auto 160px;}");
  mywindow.document.write("</style>");
  mywindow.document.write("</head>");
  mywindow.document.write(domClone);
  mywindow.document.write("</html>");
  mywindow.print();
  // mywindow.close();
}






















