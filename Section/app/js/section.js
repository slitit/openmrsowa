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

(function () {
  'use strict';
  document.addEventListener("DOMContentLoaded", function (event) {
    console.log('Section OpenMRS Open Web App Started.');
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

              LoadConsultantList();
              LoadPhysicalSectionsList();
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

//==================================================================

var up = 0;
$('#btnSave').on('click', function () {

  var sectionName = $('#SectionName').val();
  if (up == 1) {
    sectionName = $('#drpSectionName option:selected').text();
  }

  var sectionCategory = $('#Category').val();
  var sectionShortCode = $('#SectionShortCode').val();
  var sectionTelephone = $('#Telephone').val();
  var sectionType = $('#Type').val();
  var sectionStatus = $('#Status').val();
  var sectionPhysicalSection = $('#PhysicalSection').val();
  var sectionInCharge = $('#txtSectionInCharge').val();

  var sectionChkInwardUnit = $('#InwardUnit').is(':checked');
  var sectionBedCount = $('#BedCount').val();
  var sectionConsultant = $('#drpConsultantList').val();

  var sectionChkMLT = $('#MLTOfficerflexRadioDefault1').is(':checked');
  var sectionChkMO = $('input[name="chkMo"]:checked').val();
  var sectionChkConsultant = $('input[name="chkConsultant"]:checked').val();

  var raw = JSON.stringify({
    "name": sectionName,
    "address14": 'Section',
    "address15": sectionCategory,
    "address1": sectionShortCode,
    "address2": sectionTelephone,
    "address3": sectionType,
    "address4": sectionStatus,
    "address5": sectionPhysicalSection,
    "address6": sectionInCharge,
    "address7": sectionChkInwardUnit,
    "address8": sectionBedCount,
    "address9": sectionConsultant,
    "address10": sectionChkMLT,
    "address11": sectionChkMO,
    "address12": sectionChkConsultant,
    "address13": InstituteUuid,
  });

  if (up == 0) {

    $.ajax({
      url: '/openmrs/ws/rest/v1/location',
      type: 'POST',
      dataType: 'json',
      async: false,
      data: raw,
      headers: {
        'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
        'Content-Type': 'application/json'
      },
      success: function (data) {
        console.log(data)

        iziToast.success({
          title: 'OK',
          message: 'Section Created Successfully!',
          position: 'topRight',
          timeout: 1000,
          onClosed: function () {
            location.reload()
          }
        });
      }
    });

  } else {

    var uuid = $('#drpSectionName').val();

    $.ajax({
      url: '/openmrs/ws/rest/v1/location/' + uuid,
      type: 'POST',
      dataType: 'json',
      async: false,
      data: raw,
      headers: {
        'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
        'Content-Type': 'application/json'
      },
      success: function (data) {
        console.log(data)

        iziToast.success({
          title: 'OK',
          message: 'Section Updated Successfully!',
          position: 'topRight',
          timeout: 1000,
          onClosed: function () {
            location.reload()
          }
        });
      }
    });

  }
});

$('#btnLookup').on('click', function () {

  up = 1;
  $('#panelSectionName').show();
  $('#SectionName').attr('disabled', true);

  $.ajax({
    url: returnUrl() + "/LoadSectionNames",
    type: 'POST',
    dataType: 'json',
    async: false,
    data: {},
    success: function (data) {

      var options = "";
      options += "<option disabled selected>--Select--</option>";
      $(data).each(function (key, val) {
        options += "<option value='" + val.uuid + "'>" + (val.name) + "</option>";
      });

      $('#drpSectionName').html("");
      $('#drpSectionName').html(options);
    }
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
});

$('#drpSectionName').on('change', function () {

  var value = $(this).val();

  $('.clr').val("");
  $("input[type='checkbox']").attr('checked', false);

  $.ajax({
    url: '/openmrs/ws/rest/v1/location/' + value,
    type: 'GET',
    dataType: 'json',
    async: false,
    body: {},
    headers: {
      'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
      'Content-Type': 'application/json'
    },
    success: function (data) {

      $('#Category').val(data.address15);
      $('#SectionName').val(data.name);
      $('#SectionShortCode').val(data.address1);
      $('#Telephone').val(data.address2);
      $('#Type').val(data.address3);
      $('#Status').val(data.address4);
      $('#PhysicalSection').val(data.address5);
      $('#txtSectionInCharge').val(data.address6);

      if (data.address7 == "true") {
        $('#InwardUnit').attr('checked', true);
      } else {
        $('#InwardUnit').attr('checked', false);
      }
      $('#BedCount').val(data.address8);
      $('#drpConsultantList').val(data.address9);

      if (data.address10 == "true") {
        $('#MLTOfficerflexRadioDefault1').attr('checked', true);
      } else {
        $('#MLTOfficerflexRadioDefault1').attr('checked', false);
      }
      if (data.address11 == "chkMOAvailable") {
        $('#chkMOAvailable').attr('checked', true);
        $('#chkMONotAvailable').attr('checked', false);
      } else if (data.address11 == "chkMONotAvailable") {
        $('#chkMONotAvailable').attr('checked', true);
        $('#chkMOAvailable').attr('checked', false);
      }
      if (data.address12 == "chkConsultantNotAvailable") {
        $('#chkConsultantNotAvailable').attr('checked', true);
        $('#chkConsultantAvailable').attr('checked', false);
      } else if (data.address12 == "chkConsultantAvailable") {
        $('#chkConsultantAvailable').attr('checked', true);
        $('#chkConsultantNotAvailable').attr('checked', false);
      }
    }
  });
});

$('#btnCancel').on('click', function () {
  location.reload();
});


function LoadConsultantList() {
  $.ajax({
    url: returnUrl() + "/LoadConsultantList",
    type: 'POST',
    dataType: 'json',
    async: false,
    data: { InstituteUuid: InstituteUuid },
    success: function (data) {

      var options = "";
      options += "<option disabled selected>--Select--</option>";
      $(data).each(function (key, val) {
        options += "<option value='" + val.uuid + "'>" + (val.name) + "</option>";
      });

      $('#drpConsultantList').html("");
      $('#drpConsultantList').html(options);
    }
  });
}

function LoadPhysicalSectionsList() {
  $.ajax({
    url: returnUrl() + "/LoadPhysicalSections",
    type: 'POST',
    dataType: 'json',
    async: false,
    data: { InstituteUuid: InstituteUuid },
    success: function (data) {

      var options = "";
      options += "<option disabled selected>--Select--</option>";
      $(data).each(function (key, val) {
        options += "<option value='" + val.uuid + "'>" + (val.name) + "</option>";
      });

      $('#PhysicalSection').html("");
      $('#PhysicalSection').html(options);
    }
  });
}

$('#Type').on('change', function () {
  var value = $(this).val();
  if (value == "Logical") {
    $('.hidePhy').show();
  } else {
    $('.hidePhy').hide();
  }
});

$('#InwardUnit').on('change', function () {
  if ($(this).is(':checked')) {
    $('.wardhide').show();
  } else {
    $('.wardhide').hide();
  }
});

$('.hideLab').hide();
$('#Category').on('change', function () {
  var value = $(this).val();

  if (value == "Laboratory") {
    $('.hideLab').show();
  } else {
    $('.hideLab').hide();
  }
});












