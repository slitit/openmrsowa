/* * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
import $ from 'jquery';
import 'bootstrap/dist/js/bootstrap.bundle.js';
import iziToast from 'izitoast';
import "izitoast/dist/css/iziToast.min.css";

(function () {
  'use strict';
  document.addEventListener("DOMContentLoaded", function (event) {
    console.log('Add Results For Lab Tests OpenMRS Open Web App Started.');
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
var locationId = "";
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

              $(result.attributes).each(function (k, v) {
                if ((v.display).split(":")[0] == "Location Id") {
                  locationId = (v.display).split(":")[1];
                }
              });
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

//=========================================================================

function loadPendingList() {

  $.ajax({
    url: returnUrl() + '/LoadPendingListForAddResultsForLabTests',
    type: 'POST',
    dataType: 'json',
    data: {
      InstituteUuid: InstituteUuid
    },
    success: function (data) {

      var tr = "";
      $(data).each(function (key, val) {

        var age = (val.age == null) ? '' : val.age;
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

        tr += "<tr attr-uuid='" + val.person_id + "' attr-encounter='" + val.encounteruuid + "'>";
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

      $('#tblRadiologistCommentMainContent').html("");
      $('#tblRadiologistCommentMainContent').html(tr);
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

  $('#tblRadiologistCommentMainContent tr').removeClass('SelectedRowMain');
  $(this).parents('tr').addClass('SelectedRowMain');

  var section = $(this).parents('tr').find('td:nth-child(1)').text();
  var phn = phnVal = $(this).parents('tr').find('td:nth-child(2)').text();
  var fullName = $(this).parents('tr').find('td:nth-child(3)').text();
  var gender = $(this).parents('tr').find('td:nth-child(4)').text();
  var age = $(this).parents('tr').find('td:nth-child(5)').text();
  var patientUuid = $(this).parents('tr').attr('attr-uuid');
  var orderbydate = $(this).parents('tr').find('td:nth-child(7)').text();

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
    url: returnUrl() + '/LoadListForAddResultsForLabTestsFromPHN',
    type: 'POST',
    dataType: 'json',
    data: {
      phn: phn,
      orderbydate: orderbydate,
      encounteruuid: encounteruuid
    },
    success: function (data) {

      var tr = "";
      $(data).each(function (key, val) {

        var orderBy = "";
        $.ajax({
          url: '/openmrs/ws/rest/v1/user/' + val.cbyuuid,
          type: 'GET',
          dataType: 'json',
          async: false,
          data: {},
          success: function (data) {
            orderBy = data.person.display;
          }
        });

        var test = ReturnConceptByUuid(val.tests).display.split("@@")[3];
        var specimenUuid = ReturnConceptByUuid(val.tests).display.split("@@")[4];
        var sampleCo = parseInt(ReturnConceptByUuid(val.tests).display.split("@@")[7]);
        var specimen = (ReturnConceptByUuid(specimenUuid).display);

        var specialnotes = "";
        if (val.specialnotes != null) {
          specialnotes = val.specialnotes;
        }

        tr += "<tr attr-id='" + val.labtestsids + "' attr-test='" + val.tests + "'>";
        tr += "<td>" + (key + 1) + "</td>";
        tr += "<td>" + test + "</td>";
        tr += "<td>" + val.priority + "</td>";
        tr += "<td>" + specimen + "</td>";
        tr += "<td>" + val.sampleno + "</td>";
        tr += "<td>" + specialnotes + "</td>";
        tr += "<td>" + orderBy + "</td>";
        tr += "<td>" + val.cdateuuid + "</td>";
        tr += "<td>" + val.specimenid + "</td>";
        tr += "<td>" + val.specimenstatus + "</td>";
        tr += `<td><button class="btnSelectRowEnd" style="background: #ffc107 !important;" class="btn btn-warning btn-xs" type="button">Select</button></td>`;
        tr += "</tr>";
      });

      $('#tbodySpecimen').html("");
      $('#tbodySpecimen').html(tr);
    }
  });

  var myDate = new Date();

  $('#txtDate').val(myDate.getFullYear() + '-' + ('0' + (myDate.getMonth() + 1)).slice(-2) + '-' + ('0' + myDate.getDate()).slice(-2));
  $('#txtTime').val(myDate.getHours() + ':' + ('0' + (myDate.getMinutes())).slice(-2) + ':' + myDate.getSeconds());

});


$(document).on('click', '.btnSelectRowEnd', function () {

  $('#tbodySpecimen tr').removeClass('SelectedRow');
  $(this).parents('tr').addClass('SelectedRow');

  var testUuid = $(this).parents('tr').attr('attr-test');

  $('#txtSpecimenId').val($(this).parents('tr').find('td:nth-child(9)').text());
  $('#txtSpecialnotes').val($(this).parents('tr').find('td:nth-child(6)').text());
  $('#txtTestName').val($(this).parents('tr').find('td:nth-child(2)').text());

  $.ajax({
    url: returnUrl() + '/LoadParametersAndUnitsAddResultForLabTests',
    type: 'POST',
    dataType: 'json',
    data: {
      testUuid: testUuid,
    },
    success: function (data) {

      var tr = "";
      $(data).each(function (key, val) {
        tr += "<tr>";
        tr += "<td>" + val.parameter + "</td>";
        tr += "<td>" + val.unit + "</td>";
        tr += '<td style="text-align: center; padding: 6px;">\
                     <input type="text" class="txtresu form-control"/></td>';
        tr += "</tr>";
      });

      $('#tbodyParam').html("");
      $('#tbodyParam').html(tr);
    }
  });

});

$('#btnSaveForm').on('click', function () {

  var encounteruuid = $('.SelectedRowMain').attr('attr-encounter');

  $('#tbodyParam tr').each(function (k, v) {
    var $this = $(this);

    var labtestsid = $('#tbodySpecimen tr.SelectedRow').attr('attr-id');
    var Parameter = $this.find('td:nth-child(1)').text();
    var Unit = $this.find('td:nth-child(2)').text();
    var result = $this.find('td:nth-child(3)').find('input').val();

    $.ajax({
      url: returnUrl() + '/SaveAddResultForLabTestsData',
      type: 'POST',
      dataType: 'json',
      async: false,
      data: {
        labtestsid: labtestsid,
        encounteruuid: encounteruuid,
        Parameter: Parameter,
        Unit: Unit,
        result: result,
        cby: userUuid(),
        phn: $('#txtPhn').val()
      },
      success: function (data) {

      }
    });

  });

  iziToast.success({
    title: 'OK',
    message: 'Add Results For Lab Tests Data Saved Successfully!',
    position: 'topRight',
    timeout: 1000,
  });

});