/* * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
import $ from 'jquery';
import iziToast from 'izitoast';
import "izitoast/dist/css/iziToast.min.css";
import select2 from 'select2';
import "select2/dist/css/select2.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.js';

(function () {
  'use strict';
  document.addEventListener("DOMContentLoaded", function (event) {
    console.log('Sample Collection Room OpenMRS Open Web App Started.');
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
          loadPendingList();

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

$('#file_upload').attr('src', returnUrl() + "/storage/documents/useremprty.png");

//==============================================================================================

function loadPendingList() {

  $.ajax({
    url: returnUrl() + '/LoadPendingListForSampleCollection',
    type: 'POST',
    dataType: 'json',
    data: {
      InstituteUuid: InstituteUuid
    },
    success: function (data) {

      var tr = "";
      $(data).each(function (key, val) {

        var age = (val.age == null) ? '' : val.age;
        // var injection = (val.injection == null) ? '' : val.injection;
        var multi = "<td></td>";
        if (parseInt(val.countSample) > 1) {
          multi = "<td class='muliProc' style='color: blue; cursor:pointer;'>Multiple</td>";
        } else {
          multi = "<td class='muliProc' style='color: blue; cursor:pointer;'>Test Name</td>";
        }

        var orderBy = "";
        $.ajax({
          url: '/openmrs/ws/rest/v1/user/' + val.orderbyuuid,
          type: 'GET',
          dataType: 'json',
          async: false,
          data: {},
          success: function (data) {
            orderBy = data.person.display;
          }
        });

        tr += "<tr attr-uuid='" + val.person_id + "'  attr-encounter='" + val.encounteruuid + "'>";
        tr += "<td>OPD</td>";
        tr += "<td>" + val.phn + "</td>";
        tr += "<td>" + val.namefull + "</td>";
        tr += "<td>" + val.gender + "</td>";
        tr += "<td>" + age + "</td>";
        tr += "<td>" + orderBy + "</td>";
        tr += "<td>" + val.orderbydate + "</td>";
        tr += multi;
        tr += '<td style="text-align: center; padding: 6px;">\
                     <button class="btn btn-warning btnSelectRow" type="button" \
                     style="padding: 2px 16px;border: 2px solid;border-radius: 15px;background: #ffc107;">\
                     Select</button></td>';
        tr += "</tr>";
      });

      $('#tblSampleCollectionMainContent').html("");
      $('#tblSampleCollectionMainContent').html(tr);
    }
  });
}

$(document).on('click', '.muliProc', function () {

  var phn = $(this).parents('tr').find('td:nth-child(2)').text();
  var encounteruuid = $(this).parents('tr').attr('attr-encounter');

  var con = "";
  $.ajax({
    url: returnUrl() + '/LoadListForSampleCollectionFromPHN',
    type: 'POST',
    dataType: 'json',
    async: false,
    data: {
      phn: phn,
      encounteruuid: encounteruuid
    },
    success: function (data) {

      $(data).each(function (key, val) {
        var testUuid = val.tests;
        var test = ReturnConceptByUuid(testUuid).display.split("@@")[3];
        con += "<div>" + (key + 1) + ").  " + test + "</div>";
      });
    }
  });

  $(this).popover({
    placement: 'left',
    html: true,
    content: function () {
      return con;
    }, title: function () {
      return 'Test List';
    }
  });

});

var phnVal = ""
$(document).on('click', '.btnSelectRow', function () {

  $('#tblSampleCollectionMainContent tr').removeClass('SelectedRowMain');
  $(this).parents('tr').addClass('SelectedRowMain');

  var section = $(this).parents('tr').find('td:nth-child(1)').text();
  var phn = phnVal = $(this).parents('tr').find('td:nth-child(2)').text();
  var fullName = $(this).parents('tr').find('td:nth-child(3)').text();
  var gender = $(this).parents('tr').find('td:nth-child(4)').text();
  var age = $(this).parents('tr').find('td:nth-child(5)').text();
  var patientUuid = $(this).parents('tr').attr('attr-uuid');

  $('#txtFullName').val(fullName);
  $('#txtSection').val(section);
  $('#txtPhn').val(phn);
  $('#txtGender').val(gender);
  $('#txtAge').val(age);

  $.ajax({
    url: '/openmrs/ws/rest/v1/patient/' + patientUuid,
    type: 'GET',
    dataType: 'json',
    async: false,
    data: {},
    success: function (data) {
      $(data.person.attributes).each(function (k, v) {
        if (v.display != null) {
          if ($.trim(v.display.split("=")[0]) == "ProfileImage") {
            $('#file_upload').attr('src', returnUrl() + '/storage/documents/' + $.trim(v.display.split("=")[1]));
          }
        }
      });
    }
  });

  var encounteruuid = $(this).parents('tr').attr('attr-encounter');

  $.ajax({
    url: returnUrl() + '/LoadListForSampleCollectionFromPHN',
    type: 'POST',
    dataType: 'json',
    data: {
      phn: phn,
      encounteruuid: encounteruuid
    },
    success: function (data) {

      var tr = "";
      $(data).each(function (key, val) {

        var orderBy = "";
        $.ajax({
          url: '/openmrs/ws/rest/v1/user/' + val.cby,
          type: 'GET',
          dataType: 'json',
          async: false,
          data: {},
          success: function (data) {
            orderBy = data.person.display;
          }
        });

        var test = "";
        var specimen = "";
        if (val.tests != null) {
          test = ReturnConceptByUuid(val.tests).display.split("@@")[3];
          specimen = ReturnConceptByUuid(val.tests).display.split("@@")[4];
          specimen = ReturnConceptByUuid(specimen).display;
        }
        var priority = "";
        if (val.priority != null) {
          priority = (val.priority)
        }
        var antibioticdetails = "";
        if (val.antibioticdetails != null) {
          antibioticdetails = val.antibioticdetails;
        }
        var specialnotes = "";
        if (val.specialnotes != null) {
          specialnotes = val.specialnotes;
        }

        tr += "<tr attr-id='" + val.labtestsid + "'>";
        tr += "<td>" + test + "</td>";
        tr += "<td>" + priority + "</td>";
        tr += "<td>" + specimen + "</td>";
        tr += "<td>" + specialnotes + "</td>";
        tr += "<td>" + orderBy + "</td>";
        tr += "<td>" + val.cdate + "</td>";
        tr += '<td style="text-align: center; padding: 6px;">\
                       <button class="btn btn-warning btnSelectProcRow" type="button" \
                       style="padding: 2px 16px;border: 2px solid;border-radius: 15px;background: #ffc107;">\
                       Select</button></td>';
        tr += "</tr>";
      });

      $('#procConTbody').html("");
      $('#procConTbody').html(tr);
    }
  });

});

$(document).on('click', '.btnSelectProcRow', function () {

  $('#procConTbody tr').removeClass('SelectedRow');
  $(this).parents('tr').addClass('SelectedRow');

  var txtTestName = $(this).parents('tr').find('td:nth-child(1)').text();
  var priority = $(this).parents('tr').find('td:nth-child(2)').text();
  var specimen = $(this).parents('tr').find('td:nth-child(3)').text();
  var txtSpecNotes = $(this).parents('tr').find('td:nth-child(4)').text();
  var orderBy = $(this).parents('tr').find('td:nth-child(5)').text();
  var orderDate = $(this).parents('tr').find('td:nth-child(6)').text();

  $('#txtTestName').val(txtTestName);
  $('#txtPriority').val(priority);
  $('#txtSpecimen').val(specimen);
  $('#txtSpecNotes').val(txtSpecNotes);
  $('#txtOrderBy').val(orderBy);
  $('#txtOrderDate').val(orderDate);
});

$('#btnSaveForm').on('click', function () {

  var phn = phnVal;
  var datetime = $('.SelectedRow td:nth-child(6)').text();
  var date = $('#txtDate').val();
  var time = $('#txtTime').val();
  var collectionStatus = $('#drpStatus').val();
  var remarks = $('#txtRemarks').val();
  var encounteruuid = $('.SelectedRowMain').attr('attr-encounter');

  $.ajax({
    url: returnUrl() + '/SaveSampleCollectionData',
    type: 'POST',
    dataType: 'json',
    async: false,
    data: {
      phnNo: phn,
      encounteruuid: encounteruuid,
      datetime: datetime,
      date: date,
      time: time,
      collectionStatus: collectionStatus,
      remarks: remarks,
      cby: userUuid()
    },
    success: function (data) {
      iziToast.success({
        title: 'OK',
        message: 'Sample Collection Data Saved Successfully!',
        position: 'topRight',
        timeout: 1000,
        onClosed: function () { location.reload(); },
      });
    }
  });
});

$('#btnClear').on('click', function () {
  location.reload();
});