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
    console.log('Re-Print Injury Surveillance OpenMRS Open Web App Started.');
  });
}());

var sectionId = "";
var InstituteUuid = "";
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

          $(result.attributes).each(function (k, v) {
            if (v.display != null) {

              if ($.trim(v.display.split("=")[0]) == "Institute Id") {
                InstituteUuid = $.trim(v.display.split("=")[1]);
              }

              if ($.trim(v.display.split("=")[0]) == "Work Station") {
                sectionId = $.trim(v.display.split("=")[1]);
              }
            }

          });

          $('#txtinstituteuuid').val(InstituteUuid);

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

function ReturnDataType(type) {
  var result = "";
  $.ajax({
    url: '/openmrs/ws/rest/v1/conceptdatatype',
    type: 'GET',
    dataType: 'json',
    async: false,
    data: {},
    headers: {
      'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
      'Content-Type': 'application/json'
    },
    success: function (data) {

      $.map(data.results, function (val) {
        if (val.display == type) {
          result = (val.uuid);
        }
      });
    }
  });

  return result;
}

function ReturnUuidOfConceptClass(classN) {
  var result = "";
  $.ajax({
    url: '/openmrs/ws/rest/v1/conceptclass',
    type: 'GET',
    dataType: 'json',
    async: false,
    data: {},
    headers: {
      'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
      'Content-Type': 'application/json'
    },
    success: function (data) {

      $.map(data.results, function (val) {
        if (val.display == classN) {
          result = (val.uuid);
        }
      });
    }
  });

  return result;
}

function ReturnUuidOfConceptByName(name) {
  var result = "";
  $.ajax({
    url: '/openmrs/ws/rest/v1/concept?name=' + name,
    type: 'GET',
    dataType: 'json',
    async: false,
    data: {},
    headers: {
      'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
      'Content-Type': 'application/json'
    },
    success: function success(data) {

      result = data.results[0].uuid;
    }
  });

  return result;
}

function ReturnConceptByUuid(uuid) {
  var result = "";
  $.ajax({
    url: '/openmrs/ws/rest/v1/concept/' + uuid,
    type: 'GET',
    dataType: 'json',
    async: false,
    data: {},
    headers: {
      'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
      'Content-Type': 'application/json'
    },
    success: function success(data) {

      result = (data);
    }
  });

  return result;
}

//===========================================================================

$('#btnPrint').on('click', function () {
  var phn = $('#txtPhn').val();
  var visitDate = $('#txtVisitDate').val();

  var personUuid = LoadPersonUuidFromPhn();
  $.ajax({
    url: "/openmrs/ws/rest/v1/patient/" + personUuid,
    type: 'GET',
    dataType: 'json',
    async: false,
    data: {
    },
    success: function (result) {

      $('#tdName').text(result.person.display);
      $('#tdSex').text($.trim(result.person.gender));
      getAge($.trim(result.person.birthdate));

      var telNo = '';
      $(result.person.attributes).each(function (k, v) {
        if (v.display != null) {

          if ($.trim(v.display.split("=")[0]) == "Telephone Home") {
            telNo += `${$.trim(v.display.split("=")[1])},`;
          }
          if ($.trim(v.display.split("=")[0]) == "Telephone Number") {
            telNo += $.trim(v.display.split("=")[1]);
          }

          if ($.trim(result.person.birthdate) == "") {
            if ($.trim(v.display.split("=")[0]) == "Years") {
              $('#tdAge').text($.trim(v.display.split("=")[1]));
            }
          }
        }
      });

      $('#tdContactNo').text(telNo);

    }
  });

  $.ajax({
    url: returnUrl() + '/RePrintInjuryInjurySurveillanceData',
    type: 'POST',
    dataType: 'json',
    async: false,
    data: {
      phnNo: phn, visitDate: visitDate,
    },
    success: function (data) {


      $(data[0].data.split(",")).each(function (k, v) {
        var id = v.split('@@')[0];
        var val = v.split('@@')[1];

        if (val == "true") {
          $(`.rowTd[attr-id="${id}"]`).html("");
          $(`.rowTd[attr-id="${id}"]`).html('<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Light_green_check.svg/600px-Light_green_check.svg.png" style="width: 12.3px !important; padding: 0px !important;">');
        }
      });

      $('#tdInsname').text($("#lblInstituteName").text());
      $('#tdPhn').text(phn);
      $('#tdDateOnSet').text(data[0].dateonset);
      var curTime = data[0].time;

      var setDateTime = function (date, str) {
        var sp = str.split(':');
        date.setHours(parseInt(sp[0], 10));
        date.setMinutes(parseInt(sp[1], 10));
        date.setSeconds(parseInt(sp[2], 10));
        return date;
      }

      var c = setDateTime(new Date('06/24/2022'), `${curTime}:00`).getTime();

      var start1 = setDateTime(new Date('06/24/2022'), '00:01:00');
      var end1 = setDateTime(new Date('06/24/2022'), '06:00:00');

      var start2 = setDateTime(new Date('06/24/2022'), '06:01:00');
      var end2 = setDateTime(new Date('06/24/2022'), '12:00:00');

      var start3 = setDateTime(new Date('06/24/2022'), '12:01:00');
      var end3 = setDateTime(new Date('06/24/2022'), '18:00:00');

      var start4 = setDateTime(new Date('06/24/2022'), '18:01:00');
      var end4 = setDateTime(new Date('06/25/2022'), '00:00:00');

      $('#td00106').text("");
      $('#td6100').text("");
      $('#td12118').text("");
      $('#td18112').text("");

      if (c > start1.getTime() && c < end1.getTime()) {
        $('#td00106').text(curTime);
      } else if (c > start2.getTime() && c < end2.getTime()) {
        $('#td6100').text(curTime);
      } else if (c > start3.getTime() && c < end3.getTime()) {
        $('#td12118').text(curTime);
      } else if (c > start4.getTime() && c < end4.getTime()) {
        $('#td18112').text(curTime);
      }



    }
  });

  var mywindow = window.open('', 'PRINT', 'height=500,width=800');

  mywindow.document.write('<html><head><title>Print</title>');
  mywindow.document.write(`<style>
  page[size="A4"] {
    background: white;
    width: 21cm;
    height: 29.7cm;
    display: block;
    margin: 0 auto;
    margin-bottom: 0.5cm;
    box-shadow: 0 0 0.5cm rgba(0, 0, 0, 0.5);
    font-size: 10px !important;
  }

  page td,
  th {
    line-height: 1.2 !important;
    padding: 2px !important;
  }

  td span {
    font-weight: bold !important;
  }

  table {
    width: 100% !important;
    border-collapse: collapse !important;
    font-size: 10px !important;
  }

  @media print {

    body,
    page[size="A4"] {
      margin: 0;
      box-shadow: 0;
      font-size: 10px !important;
    }
  }
  </style>`);
  mywindow.document.write('</head><body>');
  mywindow.document.write(document.getElementById('containerPrint').innerHTML);
  mywindow.document.write('</body></html>');

  mywindow.document.close(); // necessary for IE >= 10
  mywindow.focus(); // necessary for IE >= 10*/

  mywindow.print();
  // mywindow.close();
});


function LoadPersonUuidFromPhn() {
  var uuid = "";
  $.ajax({
    url: returnUrl() + "/getPersonUUidFromPHN",
    type: "POST",
    dataType: "json",
    async: false,
    data: { phn: $('#txtPhn').val() },
    success: function (data) {
      uuid = data.uuid;
    }
  });

  return uuid;
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

  $('#tdAge').text(years);
}

$('#btnClear').on('click', function () {
  location.reload();
});