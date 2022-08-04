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
    console.log('List Of Notifiable Diseases OpenMRS Open Web App Started.');
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


var sectionId = "";
var InstituteUuid = "";
var instituteName = "";
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

              instituteName = result.display;
              $("#lblInstituteName").text(instituteName);
            })
            .catch(error => console.log('error', error));

        })
        .catch(error => console.log('error', error));
    })
    .catch(error => console.log('error', error));
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

//==================================================

loadPendingList();
function loadPendingList() {

  $.ajax({
    url: returnUrl() + '/LoadPendingListForNotifiableList',
    type: 'POST',
    dataType: 'json',
    data: {
      InstituteUuid: InstituteUuid
    },
    success: function (data) {

      var tr = "";
      $(data).each(function (key, val) {

        var age = (val.age == null) ? '' : val.age;

        tr += "<tr>";
        tr += "<td>" + val.phn + "</td>";
        tr += "<td>" + val.namefull + "</td>";
        tr += "<td>" + val.gender + "</td>";
        tr += "<td>" + age + "</td>";
        tr += "<td>" + val.disease.split(":")[1] + "</td>";
        tr += '<td class="chkTd" style="text-align: center; padding: 6px;">\
                     <input type="checkbox" class="chkSelect"/></td>';
        tr += "</tr>";
      });

      $('#tblListOfNotifiableDisasses').html("");
      $('#tblListOfNotifiableDisasses').html(tr);
    }
  });
}


$('#btnPrintSelected').on('click', function () {

  var report = "";
  $('#tblListOfNotifiableDisasses tr').each(function () {
    var $this = $(this);
    var checkbox = $this.find('td.chkTd .chkSelect').is(':checked');
    if (checkbox == true) {
      var phn = $this.find('td:nth-child(1)').text();
      var name = $this.find('td:nth-child(2)').text();
      var gender = $this.find('td:nth-child(3)').text();
      var age = $this.find('td:nth-child(4)').text();
      var diseases = $this.find('td:nth-child(5)').text();

      var personUuid = "";
      $.ajax({
        url: returnUrl() + "/getPersonUUidFromPHN",
        type: "POST",
        dataType: "json",
        async: false,
        data: { phn: phn },
        success: function (data) {
          personUuid = data.uuid;
        }
      });

      var telephoneHome = "";
      var guardingName = "";
      var addresss = "";
      $.ajax({
        url: "/openmrs/ws/rest/v1/patient/" + personUuid,
        type: "GET",
        dataType: "json",
        async: false,
        success: function (data) {


          $(data.person.attributes).each(function (k, v) {
            if (v.display != null) {
              if ($.trim(v.display.split("=")[0]) == "Telephone Home") {
                telephoneHome = $.trim(v.display.split("=")[1]);
              }
              if ($.trim(v.display.split("=")[0]) == "Telephone Number") {
                $('#txtTelephoneMobile').text($.trim(v.display.split("=")[1]));
              }
              if ($.trim(v.display.split("=")[0]) == "Guardian Name") {
                guardingName = $.trim(v.display.split("=")[1]);
              }
            }
          });

          addresss = data.person.preferredAddress.display;
        }
      });



      report = `<page size="A4">`;

      report += `<h1 style="text-align: center;font-weight: bold;margin-top: 25px;margin-bottom: 70px;">Notification Of a Communicable Disease</h1>`;

      report += `<div style="display: flex; padding: 4px 30px;">
      <div style="width: 60%;">
        <p><span style="font-size: 13px; font-weight: bold;">Institute: </span><span>${instituteName}</span></p>
      </div>
      <div style="width: 40%;">
        <p><span style="font-size: 13px; font-weight: bold;">Disease: </span><span>${diseases}</span></p>
      </div>
    </div>`;

      report += `<div style="display: flex; padding: 4px 30px;">
      <div style="width: 60%;">
        <p><span style="font-size: 13px; font-weight: bold;">Patient Name: </span><span>${name}</span></p>
      </div>
      <div style="width: 40%;">
        <p><span style="font-size: 13px; font-weight: bold;">Date Of Onset: </span><span></span></p>
      </div>
    </div>`;

      report += `<div style="display: flex; padding: 4px 30px;">
              <div style="width: 60%;">
                <p><span style="font-size: 13px; font-weight: bold;">Patient- Name Of Mother/ Father/ Guardian:
                  </span><span>${guardingName}</span></p>
              </div>
              <div style="width: 40%;">
                <p><span style="font-size: 13px; font-weight: bold;">Date Of Admisssion: </span><span></span></p>
              </div>
            </div>`;

      report += `<div style="display: flex; padding: 4px 30px;">
              <div style="width: 25%;">
                <p><span style="font-size: 13px; font-weight: bold;">No:
                  </span><span>${phn}</span></p>
              </div>
              <div style="width: 25%;">
                <p><span style="font-size: 13px; font-weight: bold;">Ward:
                  </span><span></span></p>
              </div>
              <div style="width: 25%;">
                <p><span style="font-size: 13px; font-weight: bold;">Age:
                  </span><span>${age}</span></p>
              </div>
              <div style="width: 25%;">
                <p><span style="font-size: 13px; font-weight: bold;">Sex:
                  </span><span>${gender}</span></p>
              </div>
            </div>`;

      report += ` <div style="display: flex; padding: 4px 30px;">
            <div style="width: 100%;">
        <p><span style="font-size: 13px; font-weight: bold;">Query Results (If Available): </span><span></span>
          </p>
        </div>
      </div>`;

      report += `<div style="display: flex; padding: 4px 30px;">
      <div style="width: 100%;">
        <p><span style="font-size: 13px; font-weight: bold;">Address Of Patient (To trace the patient's
            residance by the PHI): </span><span>${addresss}</span></p>
      </div>
    </div>`;

      report += `<div style="display: flex; padding: 4px 30px;">
              <div style="width: 100%;">
                <p><span style="font-size: 13px; font-weight: bold;">Home Tel No: </span><span></span></p>
              </div>
            </div>`;

      report += `<div style="display: flex; padding: 50px 30px;">
              <div style="width: 20%;">
                <p>.......................................</p>
                <p><span style="font-size: 13px; font-weight: bold;">Signature of Notifier:
                  </span></p>
              </div>
              <div style="width: 50%;">
                <p>
                  .......................................................................................................
                </p>
                <p><span style="font-size: 13px; font-weight: bold;">Name:
                  </span></p>
              </div>
              <div style="width: 20%;">
                <p>.................................</p>
                <p><span style="font-size: 13px; font-weight: bold;">Status:
                  </span></p>
              </div>
              <div style="width: 10%;">
                <p>....................</p>
                <p><span style="font-size: 13px; font-weight: bold;">Date:
                  </span></p>
              </div>
            </div>`;

      report += `</page>`;
    }
  });

  // $('#printContainer').html("");
  // $('#printContainer').html(report);


  var mywindow = window.open('', 'PRINT');

  mywindow.document.write('<html><head><title>Print</title>');
  mywindow.document.write(`<style>
  page[size="A4"] {
    background: white;
    width: 21cm;
    height: 29.7cm;
    display: block;   
  }

  @media print {

    body,
    page[size="A4"] {
      margin: 0;
      box-shadow: 0;
    }
  }
  </style>`);
  mywindow.document.write('</head><body >');
  mywindow.document.write(report);
  mywindow.document.write('</body></html>');
  mywindow.document.close();
  mywindow.focus();
  mywindow.print();
});




