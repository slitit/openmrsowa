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
    console.log('Drugs Frequency OpenMRS Open Web App Started.');
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

//=========================================================================================

LoadFrequencyData();
function LoadFrequencyData() {

  var uuidOfConcept = ReturnUuidOfConceptByName('Drugs Frequency');

  $.ajax({
    url: '/openmrs/ws/rest/v1/concept/' + uuidOfConcept,
    type: 'GET',
    dataType: 'json',
    async: false,
    data: {},
    headers: {
      'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
      'Content-Type': 'application/json'
    },
    success: function success(data) {

      var tr = "";
      $(data.setMembers).each(function (key, val) {
        tr += `<tr>`;
        tr += `<td>${key + 1}</td>`;
        tr += `<td>${val.display.split("@@")[1]}</td>`;
        tr += `<td>${val.display.split("@@")[2]}</td>`;
        tr += `<td>${val.display.split("@@")[3]}</td>`;
        tr += `<td style="display: none;">${val.uuid}</td>`;
        tr += `</tr>`;
      });

      $('#tblDrugFrequency').html("");
      $('#tblDrugFrequency').html(tr);
    }
  });
}

$(document).on('click', '#tblDrugFrequency tr', function () {
  var $this = $(this);

  $('#txtFrequancy').val($this.find('td:nth-child(2)').text());
  $('#txtFactor').val($this.find('td:nth-child(3)').text());
  $('#drpStatus').val($this.find('td:nth-child(4)').text());

  $('#tblDrugFrequency tr').removeClass('selectedRow');
  $this.addClass('selectedRow');
});

$('#btnCancel').on('click', function (e) {
  location.reload();
});

$('#btnAdd').on('click', function () {
  var txtFrequancy = $('#txtFrequancy').val();
  var txtFactor = $('#txtFactor').val();
  var drpStatus = $('#drpStatus').val();

  var no = $('#tblDrugFrequency tr').length;

  if ($('#tblDrugFrequency tr').hasClass('selectedRow')) {
    $('#tblDrugFrequency tr.selectedRow').find('td:nth-child(2)').text(txtFrequancy);
    $('#tblDrugFrequency tr.selectedRow').find('td:nth-child(3)').text(txtFactor);
    $('#tblDrugFrequency tr.selectedRow').find('td:nth-child(4)').text(drpStatus);

    $('#tblDrugFrequency tr.selectedRow').addClass('changedRw');
  } else {
    $('#tblDrugFrequency').append(`<tr class="changedRw"><td>${(no + 1)}</td><td>${txtFrequancy}</td><td>${txtFactor}</td><td>${drpStatus}</td><td style="display: none;">0</td></tr>`);
  }

  $('#tblDrugFrequency tr').removeClass('selectedRow');
  $('#txtFrequancy').val("");
  $('#txtFactor').val("");
  $('#drpStatus').val("");
});

$('#btnSave').on('click', function (e) {

  $('#btnSave').text('Please Wait!').attr('disabled', true);

  $('#tblDrugFrequency tr.changedRw').each(function () {
    var $this = $(this);

    var txtFrequancy = $this.find('td:nth-child(2)').text();
    var txtFactor = $this.find('td:nth-child(3)').text();
    var drpStatus = $this.find('td:nth-child(4)').text();
    var uuid = $this.find('td:nth-child(5)').text();

    var stringFull = `DrugsFrequency@@${txtFrequancy}@@${txtFactor}@@${drpStatus}`;

    //Get uuid Of Data Type
    var uuidOFDataType = ReturnDataType('Text');

    //Get uuid Of Concept Class
    var uuidOFConceptClass = ReturnUuidOfConceptClass('Misc');

    var raw = JSON.stringify({
      "names": [{ "name": stringFull, "locale": "en", "localePreferred": true, "conceptNameType": "FULLY_SPECIFIED" }],
      "datatype": uuidOFDataType, "version": "1.2.2", "conceptClass": uuidOFConceptClass,
    });

    if (uuid == 0) {

      //Create Concept 
      var uuidOfConcept = "";
      $.ajax({
        url: '/openmrs/ws/rest/v1/concept',
        type: 'POST',
        dataType: 'json',
        async: false,
        data: raw,
        headers: {
          'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
          'Content-Type': 'application/json'
        },
        success: function (data) {
          uuidOfConcept = data.uuid;
        }
      });

      //Get Uuid of Main Concept
      var uuidOfConceptMain = ReturnUuidOfConceptByName('Drugs Frequency');

      //Get Uuid Of Exising Members Of Lab Investigations Concept
      var arrOfExistMembers = [];
      $.ajax({
        url: '/openmrs/ws/rest/v1/concept/' + uuidOfConceptMain,
        type: 'GET',
        dataType: 'json',
        async: false,
        data: {},
        headers: {
          'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
          'Content-Type': 'application/json'
        },
        success: function success(data) {

          $(data.setMembers).each(function (k, v) {
            arrOfExistMembers.push(v.uuid);
          });
        }
      });

      arrOfExistMembers.push(uuidOfConcept);

      var rawx = JSON.stringify({ "setMembers": arrOfExistMembers });

      $.ajax({
        url: '/openmrs/ws/rest/v1/concept/' + uuidOfConceptMain,
        type: 'POST',
        dataType: 'json',
        async: false,
        data: rawx,
        headers: {
          'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
          'Content-Type': 'application/json'
        },
        success: function (data) {

          iziToast.success({
            title: 'OK',
            message: 'Drugs Frequency Data Saved Successfully!',
            position: 'topRight',
          });

          LoadFrequencyData();
        }, complete: function () {

          $('#btnSave').text('Save').attr('disabled', false);
        }
      });
    } else {

      $.ajax({
        url: '/openmrs/ws/rest/v1/concept/' + uuid,
        type: 'POST',
        dataType: 'json',
        async: false,
        data: raw,
        headers: {
          'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
          'Content-Type': 'application/json'
        },
        success: function (data) {

          iziToast.success({
            title: 'OK',
            message: 'Drugs Frequency Data Updated Successfully!',
            position: 'topRight'
          });

          LoadFrequencyData();
        }, complete: function () {

          $('#btnSave').text('Save').attr('disabled', false);
        }
      });
    }
  });

});