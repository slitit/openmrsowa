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
import "select2/dist/css/select2.min.css"

(function () {
  'use strict';
  document.addEventListener("DOMContentLoaded", function (event) {
    console.log('Drug Details OpenMRS Open Web App Started.');
  });
}());

$('.selectTwo').select2({
  dropdownAutoWidth: true,
  width: '100%',
  placeholder: "(Generic Name - Brand Name)"
});

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
          LoadDrugNames();

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

function LoadDrugNames() {

  var uuidOfConcept = ReturnUuidOfConceptByName('Drug Master');

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

      var option = "";
      option += '<option value="" selected disabled>--- Select ---</option>';
      $(data.setMembers).each(function (key, val) {

        var name = `${val.display.split("@@")[1]} - ${val.display.split("@@")[2]}`;
        option += `<option attr-value="${val.display}" value="${val.uuid}">${name}</option>`;
      });

      $('#druglist').html("");
      $('#druglist').html(option);
    }
  });
}

$(document).on('change', '#druglist', function () {

  var OtherData = $('#druglist option:selected').attr('attr-value');

  var Category = OtherData.split("@@")[0];
  var GenericName = OtherData.split("@@")[1];
  var BrandName = OtherData.split("@@")[2];
  var MeasuringUnit = OtherData.split("@@")[3];
  var Route = OtherData.split("@@")[4];
  var Type = OtherData.split("@@")[5];
  var StorageMethod = OtherData.split("@@")[6];
  var Comment = OtherData.split("@@")[7];
  var Status = OtherData.split("@@")[8];

  $('#txtGenericName').val(GenericName);
  $('#txtBrandName').val(BrandName);
  $('#txtMeasuringUnit').val(MeasuringUnit);
});

$('#btnSave').on('click', function (e) {
  e.preventDefault();

  var drugUUID = $('#druglist').val();
  var orderType = $('#ordertype').val();
  var stockType = $('#stocktype').val();

  var stringFull = `DrugDetails@@${drugUUID}@@${orderType}@@${stockType}`;

  //Get uuid Of Data Type
  var uuidOFDataType = ReturnDataType('Text');

  //Get uuid Of Concept Class
  var uuidOFConceptClass = ReturnUuidOfConceptClass('Misc');

  var raw = JSON.stringify({
    "names": [{ "name": stringFull, "locale": "en", "localePreferred": true, "conceptNameType": "FULLY_SPECIFIED" }],
    "datatype": uuidOFDataType, "version": "1.2.2", "conceptClass": uuidOFConceptClass,
  });

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
  var uuidOfConceptMain = ReturnUuidOfConceptByName('Drug Details');

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
        message: 'Drug Details Data Saved Successfully!',
        position: 'topRight',
      });

      $('#druglist').val("");
      $('#ordertype').val("");
      $('#stocktype').val("");

      $('#nameBtn').text('Save').attr('disabled', false);
    }
  });

});

$('#btnCancel').on('click', function (e) {
  location.reload();
});