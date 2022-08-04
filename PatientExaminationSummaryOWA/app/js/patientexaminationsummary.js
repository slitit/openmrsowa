/* * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
import S from 'jquery';
import iziToast from 'izitoast';
import "izitoast/dist/css/iziToast.min.css";
import Tagify from '@yaireo/tagify';
import "@yaireo/tagify/dist/tagify.css";
import 'select2/dist/js/select2.full.min.js';
import 'select2/dist/css/select2.min.css'

(function () {
  'use strict';
  document.addEventListener("DOMContentLoaded", function (event) {
    console.log('Patient Examination OpenMRS Open Web App Started.');
  });
}());

var sketchpad = new Sketchpad({
  element: '#sketchpad',
  width: 300,
  height: 300
});

$('#clear').on('click', function () {
  sketchpad.clear();
});

$('#undo').on('click', function () {
  sketchpad.undo();
});

$('#redo').on('click', function () {
  sketchpad.redo();
});

$('#animateSketchpad').on('click', function () {
  sketchpad.animate(10);
});

var inputSym = document.querySelector('input[name=tagsSymptoms]'),
  tagifySym = new Tagify(inputSym, {
    whitelist: [],
  });

var inputCom = document.querySelector('input[name=tagsComplain]'),
  tagifyCom = new Tagify(inputCom, {
    whitelist: [],
  });

var inputDiagnose = document.querySelector('input[name=tagsDiagnose]'),
  tagifyDiagnose = new Tagify(inputDiagnose, {
    whitelist: [],
  });

var inputHistory = document.querySelector('input[name=tagsHistory]'),
  tagifyHistory = new Tagify(inputHistory, {
    whitelist: [],
  });


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

function returnUrlQmsApi() {

  var value = "";

  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
  myHeaders.append("Cookie", "JSESSIONID=4F55735593751E224686B006CD388234");

  $.ajax({
    url: '/openmrs/ws/rest/v1/conceptreferenceterm?codeOrName=QmsApi',
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

        })
        .catch(error => console.log('error', error));
    })
    .catch(error => console.log('error', error));
}

loadGeneralExamination();
function loadGeneralExamination() {

  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
  myHeaders.append("Cookie", "JSESSIONID=6E54C8D18F81C34555DBBB8585951625");

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  fetch("/openmrs/ws/rest/v1/concept?name=General Examination", requestOptions)
    .then(response => response.json())
    .then(result => {

      var uuidOfGeneralExaminationConcept = result.results[0].uuid;

      fetch("/openmrs/ws/rest/v1/concept/" + uuidOfGeneralExaminationConcept, requestOptions)
        .then(response => response.json())
        .then(result => {

          var tr = "";
          $(result.setMembers).each(function (key, val) {
            tr += '<tr><td style="display: none;">' + val.uuid + '</td><th><input id="' + val.display + 'role" type="checkbox" \
        name="capabilities"><label for="'+ val.display + 'role" style="position: relative; top: -8px; left: 15px;"> ' + val.display + '</label></th></tr>';
          });

          $('#tbodyGeneralExamination').html("");
          $('#tbodyGeneralExamination').html(tr);
        })
        .catch(error => console.log('error', error));

    }).catch(error => console.log('error', error));
}


//================================================================================

$('#btnCallNext').on('click', function () {

  var useruuid = userUuid();
  var insuuid = instituteUuid();
  var unitid = availableUnitForUser(useruuid, insuuid);

  $.ajax({
    url: returnUrlQmsApi() + '/counter/callNext/Pending/' + unitid[0] + '/' + unitid[1] + '/' + insuuid + '',
    type: 'POST',
    dataType: 'json',
    data: {},
    success: function (result) {

      $('#currentToken').text(result.status);


      $.ajax({
        url: returnUrlQmsApi() + '/tokenissue/getTokenNumberWisePHN/' + unitid[0] + '/' + insuuid + '/' + result.status,
        type: 'POST',
        dataType: 'json',
        data: {},
        success: function (result) {

          $('#txtPhnNo').text(result.data).change();
        }
      });
    }
  });
});

$('#btnCallSpecificToken').on('click', function () {

  var tokenNo = $('#txtSpecToken').val();
  var useruuid = userUuid();
  var insuuid = instituteUuid();
  var unitid = availableUnitForUser(useruuid, insuuid);

  $.ajax({
    url: returnUrlQmsApi() + '/counter/callNextManual/' + unitid[0] + '/' + unitid[1] + '/' + insuuid + '/' + tokenNo,
    type: 'POST',
    dataType: 'json',
    data: {},
    success: function (result) {

      $('#currentToken').text(result.status);
    }
  });
});

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

      var insUuid = instituteUuid();

      //==============================  Get/Set Visit Type UUID =====================================
      var visitTypeUuid = "";
      $.ajax({
        url: '/openmrs/ws/rest/v1/visittype?q=Patient Examination Visit',
        type: 'GET',
        dataType: 'json',
        async: false,
        data: {},
        headers: {
          'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
          'Content-Type': 'application/json'
        },
        success: function (data) {

          visitTypeUuid = data.results[0].uuid;
        }
      });

      // //============================== Create Visit =====================================
      // var raw = JSON.stringify({ "patient": patientUuid, "visitType": visitTypeUuid, "startDatetime": (new Date()).toISOString(), "location": insUuid });
      // var visitUuid = "";

      // $.ajax({
      //   url: '/openmrs/ws/rest/v1/visit',
      //   type: 'POST',
      //   dataType: 'json',
      //   async: false,
      //   data: raw,
      //   headers: {
      //     'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
      //     'Content-Type': 'application/json'
      //   },
      //   success: function (data) {

      //     visitUuid = data.uuid;
      //     $('#txtVisitUUID').val(visitUuid);
      //   }
      // });

      //==============================  Get/Set Encounter Type UUID =====================================
      var encounterTypeUuid = "";
      $.ajax({
        url: '/openmrs/ws/rest/v1/encountertype?q=Patient Examination Encounter',
        type: 'GET',
        dataType: 'json',
        async: false,
        data: {},
        headers: {
          'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
          'Content-Type': 'application/json'
        },
        success: function (data) {

          encounterTypeUuid = data.results[0].uuid;
        }
      });

      //==============================  Create Encounter =====================================
      var encounterUuid = "";
      var rawEnc = JSON.stringify({ "encounterDatetime": (new Date()).toISOString(), "patient": patientUuid, "encounterType": encounterTypeUuid, "location": insUuid, "visit": { "patient": patientUuid, "visitType": visitTypeUuid, "startDatetime": (new Date()).toISOString() } });

      $.ajax({
        url: '/openmrs/ws/rest/v1/encounter',
        type: 'POST',
        dataType: 'json',
        async: false,
        data: rawEnc,
        headers: {
          'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
          'Content-Type': 'application/json'
        },
        success: function (data) {
          encounterUuid = data.uuid;
          $('#txtEncounterUUID').val(encounterUuid);
        }
      });


      $('#txtPersonUUID').val($.trim(result.person.uuid));
      $('#txtFullName').val($.trim(result.person.display));
      $('#txtGender').val($.trim(result.person.gender));
      $('#txtDob').val($.trim(result.person.birthdate).split("T")[0]);

      if ($.trim(result.person.gender) == "F") {
        $('.showFemalOnlyPanel').show();
      } else {
        $('.showFemalOnlyPanel').hide();
      }

      if (result.person.birthdate != null) {
        getAge($.trim(result.person.birthdate))
      }

      $(result.person.attributes).each(function (k, v) {
        if (v.display != null) {

          if ($.trim(v.display.split("=")[0]) == "Title") {
            $('#drpTitle').val($.trim(v.display.split("=")[1]));
          }
          if ($.trim(v.display.split("=")[0]) == "Civil Status") {
            $('#txtCivilStatus').val($.trim(v.display.split("=")[1]));
          }
          if ($.trim(v.display.split("=")[0]) == "Ethnicity") {
            $('#txtEthnicity').val($.trim(v.display.split("=")[1]));
          }
          if ($.trim(v.display.split("=")[0]) == "Race") {
            $('#txtRace').val($.trim(v.display.split("=")[1]));
          }
          if ($.trim(v.display.split("=")[0]) == "Blood Group") {
            $('#txtBloodGroup').val($.trim(v.display.split("=")[1]));
          }
          if ($.trim(v.display.split("=")[0]) == "NIC No") {
            $('#txtNICNo').val($.trim(v.display.split("=")[1]));
          }
          if ($.trim(v.display.split("=")[0]) == "Telephone Home") {
            $('#txtTelephoneHome').val($.trim(v.display.split("=")[1]));
          }
          if ($.trim(v.display.split("=")[0]) == "Telephone Number") {
            $('#txtTelephoneMobile').val($.trim(v.display.split("=")[1]));
          }
          if ($.trim(v.display.split("=")[0]) == "Guardian Name") {
            $('#txtGurdianInfo').val($.trim(v.display.split("=")[1]));
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

      var requestHeaders = new Headers();
      requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
      requestHeaders.append("Cookie", "JSESSIONID=ED9DBD5CFD355A973EFFECD642D8331D");

      var requestOptions = {
        method: 'GET',
        headers: requestHeaders,
        redirect: 'follow'
      };

      fetch("/openmrs/ws/rest/v1/person/" + patientUuid + "/address", requestOptions)
        .then(response => response.json())
        .then(resultzx => {

          $('#txtAddress').val($.trim(resultzx.results[0].address1) + ", " + $.trim(resultzx.results[0].address2) + ", " + $.trim(resultzx.results[0].cityVillage));

        })
        .catch(error => console.log('error', error));


      var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
      };

      //======================  Load Other Data  =================================================
      fetch("/openmrs/ws/rest/v1/obs?patient=" + result.person.uuid, requestOptions)
        .then(response => response.json())
        .then(result => {

          $((result.results).reverse()).each(function (k, v) {

            //=======Load Symptoms Patient======================
            if (v.display.split("Symptoms:")[1] != undefined) {
              var setArraySymptoms = [];
              $(v.display.split("Symptoms:")[1].split(",")).each(function (ke, va) {
                setArraySymptoms.push(va)
              });
              tagifySym.settings.whitelist = setArraySymptoms;
            }

            // //=======Load Complains Patient======================
            // if (v.display.split("Complains:")[1] != undefined) {
            //   var setArrayComplains = [];
            //   $(v.display.split("Complains:")[1].split(",")).each(function (ke, va) {
            //     setArrayComplains.push(va)
            //   });
            //   tagifyCom.settings.whitelist = setArrayComplains;
            // }

            //=======Load Diagnose Patient======================
            if (v.display.split("Probable Diagnosis:")[1] != undefined) {
              var setArrayDiagnose = [];
              $(v.display.split("Probable Diagnosis:")[1].split(",")).each(function (ke, va) {
                setArrayDiagnose.push(va)
              });
              tagifyDiagnose.settings.whitelist = setArrayDiagnose;
            }

            //=======Load History Patient======================
            if (v.display.split("History:")[1] != undefined) {
              var setArrayHistory = [];
              $(v.display.split("History:")[1].split(",")).each(function (ke, va) {
                setArrayHistory.push(va)
              });
              tagifyHistory.settings.whitelist = setArrayHistory;
            }

          });

        })
        .catch(error => console.log('error', error));

    })
    .catch(error => console.log('error', error));
}

$('.calBMI').on('keyup', function () {
  calculateBMI()
});

function calculateBMI() {
  let height = parseInt(document
    .querySelector("#txtBEHeight").value);

  let weight = parseInt(document
    .querySelector("#txtBEWeight").value);

  let result = document.querySelector("#txtBMI");

  if (height == "") {
    height = 0;
  }

  if (weight == "") {
    weight = 0;
  }

  let bmi = (weight / ((height * height)
    / 10000)).toFixed(2);

  if (bmi < 18.6) result.value =
    `Under Weight : ${bmi}`;

  else if (bmi >= 18.6 && bmi < 24.9)
    result.value =
      `Normal : ${bmi}`;

  else result.value =
    `Over Weight : ${bmi}`;

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

$('#btnAddAllergy').on('click', function () {
  var txtAllergyName = $('#txtAllergyName').val();
  var drpStatus = $('#drpStatusAllergy').val();
  var txtRemarks = $('#txtRemarksAllergy').val();

  if (txtAllergyName != "") {
    $('#AllergyTbody').append('<tr><td>' + txtAllergyName + '</td><td>' + drpStatus + '</td>\
    <td>' + txtRemarks + '</td>\
    <td class="text-center"><span class="fa fa-close deleteAllergyRow" style="color: red;"></span></td></tr>');
  }
  $('.allerrow').val("");
});

$(document).on('click', '.deleteAllergyRow', function () {
  $(this).parents('tr').remove();
});

$('#btnSaveCallNext').on('click', function () {

  var phnNo = $('#txtPhnNo').val();

  if (phnNo == "" || phnNo == null) {

    iziToast.error({
      title: 'Error',
      message: 'Phn Can\'t be empty!',
      position: 'topRight'
    });

    return;
  }

  basicExaminationSave(phnNo);
  symptomsSave(phnNo);
  complaintSave(phnNo);
  probableDiagnosisSave(phnNo);
  allergySave(phnNo);
  historySave(phnNo);
  labTestSave(phnNo);
  radiologySave(phnNo);
  prescribingSave(phnNo);
  proceduresSave(phnNo);
  wardReferralSave(phnNo);
  clinicReferralSave(phnNo);

  $('#btnCallNext').click();
});

$('#btnSaveForm').on('click', function () {

  var phnNo = $('#txtPhnNo').val();
  var personUUID = $('#txtPersonUUID').val();
  var encounterUUID = $('#txtEncounterUUID').val();

  if (phnNo == "" || phnNo == null) {

    iziToast.error({
      title: 'Error',
      message: 'Phn Can\'t be empty!',
      position: 'topRight'
    });

    return;
  }

  basicExaminationSave(phnNo, personUUID, encounterUUID);
  symptomsSave(phnNo, personUUID, encounterUUID);
  complaintSave(phnNo, personUUID, encounterUUID);
  probableDiagnosisSave(phnNo, personUUID, encounterUUID);
  allergySave(phnNo, personUUID, encounterUUID); 

  // radiologySave(phnNo);
  // prescribingSave(phnNo);
  // proceduresSave(phnNo);
  // wardReferralSave(phnNo);
  // clinicReferralSave(phnNo);
});


var myHeaders = new Headers();
myHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
myHeaders.append("Content-Type", "application/json");
myHeaders.append("Cookie", "JSESSIONID=56AEC369713B93BCB5B9BC7B34AA6E5F");


function basicExaminationSave(phnNo, personUUID, encounterUUID) {

  var examinationDate = $('#txtExaminationDate').val();
  var beHeight = $('#txtBEHeight').val();
  var beWeight = $('#txtBEWeight').val();
  var beWaist = $('#txtBEWaist').val();
  var temperature = $('#txtTemperatre').val();
  var remarks = $('#txtRemarks').val();
  var sketchPadJson = sketchpad.toJSON();

  var str = `ExaminationDate:${examinationDate}@@Height:${beHeight}@@Weight:${beWeight}@@Waist:${beWaist}@@Temperature:${temperature}@@Remarks:${remarks}@@SketchPadJson:${sketchPadJson.toString()}`;

  //=========== Get/Set Basic Examination Concept UUID =============================
  var uuidOfBasicExaminationConcept = "";

  $.ajax({
    url: '/openmrs/ws/rest/v1/concept?name=Basic Examination',
    type: 'GET',
    dataType: 'json',
    async: false,
    data: {},
    headers: {
      'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
      'Content-Type': 'application/json'
    },
    success: function (data) {

      uuidOfBasicExaminationConcept = data.results[0].uuid;
    }
  });

  //=========== Save Basic Examination to Observation =============================
  var raw = JSON.stringify({ "person": personUUID, "concept": uuidOfBasicExaminationConcept, "encounter": encounterUUID, "obsDatetime": (new Date()).toISOString(), "value": str });

  $.ajax({
    url: '/openmrs/ws/rest/v1/obs',
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
        message: 'Basic Examination Saved Successfully!',
        position: 'topRight'
      });
    }
  });
}

function symptomsSave(phnNo, personUUID, encounterUUID) {

  var arr = [];
  if ($('#txtPatientSymptoms').val() != "") {
    var list = JSON.parse($('#txtPatientSymptoms').val());
    $(list).each(function (k, v) {
      if (v.readonly != true) {
        arr.push(v.value);
      }
    });
  }

  if (arr.length != 0) {

    //=========== Get/Set Symptoms Concept UUID =============================
    var uuidOfSymptomsConcept = "";

    $.ajax({
      url: '/openmrs/ws/rest/v1/concept?name=Symptoms',
      type: 'GET',
      dataType: 'json',
      async: false,
      data: {},
      headers: {
        'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
        'Content-Type': 'application/json'
      },
      success: function (data) {

        uuidOfSymptomsConcept = data.results[0].uuid;
      }
    });

    //=========== Save Symptoms to Observation =============================
    var raw = JSON.stringify({ "person": personUUID, "concept": uuidOfSymptomsConcept, "encounter": encounterUUID, "obsDatetime": (new Date()).toISOString(), "value": arr.toString() });

    $.ajax({
      url: '/openmrs/ws/rest/v1/obs',
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
          message: 'Symptoms Saved Successfully!',
          position: 'topRight'
        });

      }
    });

  }
}

function complaintSave(phnNo, personUUID, encounterUUID) {

  var arr = [];
  if ($('#txtPatientComplains').val() != "") {
    var list = JSON.parse($('#txtPatientComplains').val());
    $(list).each(function (k, v) {
      if (v.readonly != true) {
        arr.push(v.value);
      }
    });
  }

  if (arr.length != 0) {

    //=========== Get/Set Complains Concept UUID =============================
    var uuidOfComplainsConcept = "";

    $.ajax({
      url: '/openmrs/ws/rest/v1/concept?name=Complains',
      type: 'GET',
      dataType: 'json',
      async: false,
      data: {},
      headers: {
        'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
        'Content-Type': 'application/json'
      },
      success: function (data) {

        uuidOfComplainsConcept = data.results[0].uuid;
      }
    });

    //=========== Save Complains to Observation =============================
    var raw = JSON.stringify({ "person": personUUID, "concept": uuidOfComplainsConcept, "encounter": encounterUUID, "obsDatetime": (new Date()).toISOString(), "value": arr.toString() });

    $.ajax({
      url: '/openmrs/ws/rest/v1/obs',
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
          message: 'Complain Saved Successfully!',
          position: 'topRight'
        });
      }
    });

  }
}

function probableDiagnosisSave(phnNo, personUUID, encounterUUID) {

  var arr = [];
  if ($('#txtPatientDiagnose').val() != "") {
    var list = JSON.parse($('#txtPatientDiagnose').val());
    $(list).each(function (k, v) {
      if (v.readonly != true) {
        arr.push(v.value);
      }
    });
  }

  if (arr.length != 0) {

    //=========== Get/Set Diagnosis Concept UUID =============================
    var uuidOfProbableDiagnosisConcept = "";

    $.ajax({
      url: '/openmrs/ws/rest/v1/concept?name=Probable Diagnosis',
      type: 'GET',
      dataType: 'json',
      async: false,
      data: {},
      headers: {
        'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
        'Content-Type': 'application/json'
      },
      success: function (data) {

        uuidOfProbableDiagnosisConcept = data.results[0].uuid;
      }
    });

    //=========== Save Diagnosis to Observation =============================
    var raw = JSON.stringify({ "person": personUUID, "concept": uuidOfProbableDiagnosisConcept, "encounter": encounterUUID, "obsDatetime": (new Date()).toISOString(), "value": arr.toString() });

    $.ajax({
      url: '/openmrs/ws/rest/v1/obs',
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
          message: 'Probable Diagnosis Saved Successfully!',
          position: 'topRight'
        });
      }
    });

  }
}


function labTestSave(phnNo) {

  if ($('#labTestTbody tr').length != 0) {

    var cby = userUuid();

    var selected = new Array();
    $('#labTestTbody tr').each(function () {
      var Tests = $(this).find('td:nth-child(1)').attr('attr-val');
      var Priority = $(this).find('td:nth-child(2)').text();
      var Laboratory = $(this).find('td:nth-child(3)').attr('attr-val');
      if (Laboratory == "null") {
        Laboratory = null;
      }
      var SpecialNotes = $(this).find('td:nth-child(4)').text();
      var AntibioticGiven = $(this).find('td:nth-child(5)').text();
      var AntibioticDetails = $(this).find('td:nth-child(6)').text();
      selected.push([Tests, Priority, Laboratory, SpecialNotes, AntibioticGiven, AntibioticDetails]);
    });

    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
    myHeaders.append("Cookie", "JSESSIONID=4F55735593751E224686B006CD388234");

    $.ajax({
      url: returnUrl() + '/SaveLabTest',
      type: 'POST',
      dataType: 'json',
      headers: myHeaders,
      async: false,
      data: {
        phnNo: phnNo,
        selected: selected,
        cby: cby
      },
      success: function (data) {
        iziToast.success({
          title: 'OK',
          message: 'Lab Test Saved Successfully!',
          position: 'topRight'
        });
      }
    });
  }
}

loadSavedTestGroups()
function loadSavedTestGroups() {

  var cby = userUuid();
  var insUUid = instituteUuid();
  var unit = availableUnitForUser(cby, insUUid);

  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
  myHeaders.append("Cookie", "JSESSIONID=4F55735593751E224686B006CD388234");

  $.ajax({
    url: returnUrl() + '/LoadSavedTestGroups',
    type: 'POST',
    dataType: 'json',
    headers: myHeaders,
    data: {
      cby: cby,
      unit: unit
    },
    success: function (data) {

      var options = "";
      options += "<option disabled selected>--Select--</option>";
      $(data).each(function (key, val) {
        options += "<option value='" + val.testgroupname + "'>" + (val.testgroupname) + "</option>";
      });

      $('#drpTestGroups').html("");
      $('#drpTestGroups').html(options);
    }
  });
}

$('#drpTestGroups').on('change', function () {

  var testGroup = $(this).val();

  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
  myHeaders.append("Cookie", "JSESSIONID=4F55735593751E224686B006CD388234");

  $.ajax({
    url: returnUrl() + '/LoadTestGroupsData',
    type: 'POST',
    dataType: 'json',
    headers: myHeaders,
    data: {
      testGroup: testGroup,
    },
    success: function (data) {
      var tr = "";
      $(data).each(function (key, val) {
        tr += "<tr>";
        tr += "<td>" + val.testname + "</td>";
        tr += "<td>" + val.priority + "</td>";
        tr += "<td>" + val.testname + "</td>";
        tr += "<td>" + val.specialnotes + "</td>";
        tr += "<td>" + val.antibioticgiven + "</td>";
        if (val.antibioticdetails != null) {
          tr += "<td>" + val.antibioticdetails + "</td>";
        } else {
          tr += "<td></td>";
        }
        tr += '<td class="text-center"><span class="fa fa-close deleteLabTestRow" style="color: red;"></span></td>';
        tr += "<td style='display: none;'>" + val.labtestsid + "</td>";
        tr += "</tr>";
      });

      $('#labTestTbody').html("");
      $('#labTestTbody').html(tr);
    }
  });

});

function radiologySave(phnNo) {

  if ($('#radiologyTbody tr').length != 0) {

    var cby = userUuid();

    var selected = new Array();
    $('#radiologyTbody tr').each(function () {
      var Test = $(this).find('td:nth-child(1)').attr('attr-val');
      var Region = $(this).find('td:nth-child(2)').attr('attr-val');
      var Localization = $(this).find('td:nth-child(3)').attr('attr-val');
      var Position = $(this).find('td:nth-child(4)').attr('attr-val');
      var Comments = $(this).find('td:nth-child(5)').text();
      var Priority = $(this).find('td:nth-child(6)').text();
      selected.push([Test, Region, Localization, Position, Comments, Priority]);
    });

    $.ajax({
      url: returnUrl() + '/SaveRadiology',
      type: 'POST',
      dataType: 'json',
      async: false,
      data: {
        phnNo: phnNo,
        selected: selected,
        cby: cby
      },
      success: function (data) {
        iziToast.success({
          title: 'OK',
          message: 'Radiology Saved Successfully!',
          position: 'topRight'
        });
      }
    });
  }
}

function prescribingSave(phnNo) {

  if ($('#drugPrescribingTbody tr').length != 0) {

    var cby = userUuid();

    var selected = new Array();
    $('#drugPrescribingTbody tr').each(function () {
      var Drug = $(this).find('td:nth-child(1)').attr('attr-val');
      var Dose = $(this).find('td:nth-child(2)').attr('attr-val');
      var Frequency = $(this).find('td:nth-child(3)').attr('attr-val');
      var DoseComment = $(this).find('td:nth-child(4)').text();
      var Period = $(this).find('td:nth-child(5)').text();
      var Pharmacy = $(this).find('td:nth-child(6)').text();
      selected.push([Drug, Dose, Frequency, DoseComment, Period, Pharmacy]);
    });

    $.ajax({
      url: returnUrl() + '/SavePrescribing',
      type: 'POST',
      dataType: 'json',
      async: false,
      data: {
        phnNo: phnNo,
        selected: selected,
        cby: cby
      },
      success: function (data) {
        iziToast.success({
          title: 'OK',
          message: 'Prescribing Saved Successfully!',
          position: 'topRight'
        });
      }
    });
  }
}

loadProcedureTypes();
function loadProcedureTypes() {

  fetch(returnUrl() + '/LoadProcedureTypes', {
    method: 'POST',
  })
    .then(response => response.json())
    .then(result => {

      var options = "";
      options += "<option disabled selected>--Select--</option>";
      $(result).each(function (key, val) {
        options += "<option value='" + val.proceduretypeid + "'>" + (val.proceduretype) + "</option>";
      });

      $('#drpProcedureType').html("");
      $('#drpProcedureType').html(options);

    }).catch(error => console.log('error', error));
}

function proceduresSave(phnNo) {

  if ($('#procedurestbody tr').length != 0) {

    var cby = userUuid();

    var selected = new Array();
    $('#procedurestbody tr').each(function () {
      var procedureType = $(this).find('td:nth-child(1)').attr('attr-val');
      var Injection = $(this).find('td:nth-child(2)').text();
      var Remarks = $(this).find('td:nth-child(3)').text();
      var Type = $(this).find('td:nth-child(4)').text();
      selected.push([procedureType, Injection, Remarks, Type]);
    });

    $.ajax({
      url: returnUrl() + '/SaveProcedures',
      type: 'POST',
      dataType: 'json',
      async: false,
      data: {
        phnNo: phnNo,
        selected: selected,
        cby: cby
      },
      success: function (data) {
        iziToast.success({
          title: 'OK',
          message: 'Procedures Saved Successfully!',
          position: 'topRight'
        });
      }
    });
  }
}

function wardReferralSave(phnNo) {

  var drpWardWardReferral = $('#drpWardWardReferral').val();
  var txtWardRemarks = $('#txtWardRemarks').val();

  if (drpWardWardReferral != "") {

    var cby = userUuid();

    $.ajax({
      url: returnUrl() + '/SaveWardReferral',
      type: 'POST',
      dataType: 'json',
      async: false,
      data: {
        phnNo: phnNo, ward: drpWardWardReferral, wardRemarks: txtWardRemarks, cby: cby
      },
      success: function (data) {
        iziToast.success({
          title: 'OK',
          message: 'Ward Referral Saved Successfully!',
          position: 'topRight'
        });
      }
    });
  }
}

function clinicReferralSave(phnNo) {

  var drpclinicReferral = $('#drpclinicReferral').val();
  var txtClinicRemarks = $('#txtClinicRemarks').val();

  if (drpclinicReferral != "") {

    var cby = userUuid();

    $.ajax({
      url: returnUrl() + '/SaveClinicReferral',
      type: 'POST',
      dataType: 'json',
      async: false,
      data: {
        phnNo: phnNo, clinic: drpclinicReferral, clinicRemarks: txtClinicRemarks, cby: cby
      },
      success: function (data) {
        iziToast.success({
          title: 'OK',
          message: 'Clinic Referral Saved Successfully!',
          position: 'topRight'
        });
      }
    });
  }
}

$('#btnSaveTestGroupLabTest').on('click', function () {
  if ($('#labTestTbody tr').length != 0) {

    var cby = userUuid();

    var selected = new Array();
    $('#labTestTbody tr').each(function () {
      var Tests = $(this).find('td:nth-child(1)').attr('attr-val');
      var Priority = $(this).find('td:nth-child(2)').text();
      var Laboratory = $(this).find('td:nth-child(3)').attr('attr-val');
      if (Laboratory == "null") {
        Laboratory = null;
      }
      var SpecialNotes = $(this).find('td:nth-child(4)').text();
      var AntibioticGiven = $(this).find('td:nth-child(5)').text();
      var AntibioticDetails = $(this).find('td:nth-child(6)').text();
      selected.push([Tests, Priority, Laboratory, SpecialNotes, AntibioticGiven, AntibioticDetails]);
    });

    var testGroupName = $('#txtTestGroupName').val();
    if (testGroupName == "") {
      iziToast.error({
        title: 'Error',
        message: 'Test Group Name Required!',
        position: 'topRight'
      });

      return;
    }

    var type = $('input[name="type"]:checked').val();
    var unit = "all";
    if (type == "Save for unit") {
      var insuuid = instituteUuid();
      unit = availableUnitForUser(cby, insuuid);
    } else if (type == "Save for me only") {
      unit = cby;
    }

    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
    myHeaders.append("Cookie", "JSESSIONID=4F55735593751E224686B006CD388234");

    $.ajax({
      url: returnUrl() + '/SaveLabTestTestGroup',
      type: 'POST',
      dataType: 'json',
      headers: myHeaders,
      data: {
        selected: selected,
        testGroupName: testGroupName,
        type: type,
        unit: unit,
        cby: cby
      },
      success: function (data) {
        if (data == true) {
          iziToast.success({
            title: 'OK',
            message: 'Test Group Saved Successfully!',
            position: 'topRight'
          });
        } else {
          iziToast.error({
            title: 'Error',
            message: 'Test Group Already Exsits!',
            position: 'topRight'
          });
        }

      }
    });
  }
});

$('#btnSaveTestGroupPrescribing').on('click', function () {
  if ($('#drugPrescribingTbody tr').length != 0) {

    var cby = userUuid();

    var selected = new Array();
    $('#drugPrescribingTbody tr').each(function () {
      var Drug = $(this).find('td:nth-child(1)').attr('attr-val');
      var Dose = $(this).find('td:nth-child(2)').attr('attr-val');
      var Frequency = $(this).find('td:nth-child(3)').attr('attr-val');
      var DoseComment = $(this).find('td:nth-child(4)').text();
      var Period = $(this).find('td:nth-child(5)').text();
      var Pharmacy = $(this).find('td:nth-child(6)').text();
      selected.push([Drug, Dose, Frequency, DoseComment, Period, Pharmacy]);
    });


    var testGroupName = $('#txtTestGroupNamePrescribing').val();
    if (testGroupName == "") {
      iziToast.error({
        title: 'Error',
        message: 'Test Group Name Required!',
        position: 'topRight'
      });

      return;
    }

    var type = $('input[name="typePrescribing"]:checked').val();
    var unit = "all";
    if (type == "Save for unit") {
      var insuuid = instituteUuid();
      unit = availableUnitForUser(cby, insuuid);
    } else if (type == "Save for me only") {
      unit = cby;
    }

    $.ajax({
      url: returnUrl() + '/SaveLabTestPrescribing',
      type: 'POST',
      dataType: 'json',
      data: {
        selected: selected,
        testGroupName: testGroupName,
        type: type,
        unit: unit,
        cby: cby
      },
      success: function (data) {
        if (data == true) {
          iziToast.success({
            title: 'OK',
            message: 'Drug Group Saved Successfully!',
            position: 'topRight'
          });
        } else {
          iziToast.error({
            title: 'Error',
            message: 'Drug Group Already Exsits!',
            position: 'topRight'
          });
        }

      }, complee: function () {
        loadSavedDrugGroups()
      }
    });
  }
});

loadSavedDrugGroups()
function loadSavedDrugGroups() {

  var cby = userUuid();
  var insUUid = instituteUuid();
  var unit = availableUnitForUser(cby, insUUid);

  $.ajax({
    url: returnUrl() + '/LoadSavedDrugGroups',
    type: 'POST',
    dataType: 'json',
    data: {
      cby: cby,
      unit: unit
    },
    success: function (data) {

      var options = "";
      options += "<option disabled selected>--Select--</option>";
      $(data).each(function (key, val) {
        options += "<option value='" + val.druggroupname + "'>" + (val.druggroupname) + "</option>";
      });

      $('#drugGroups').html("");
      $('#drugGroups').html(options);
    }
  });
}

$('#drugGroups').on('change', function () {

  var testGroup = $(this).val();

  $.ajax({
    url: returnUrl() + '/LoadDrugGroupsData',
    type: 'POST',
    dataType: 'json',
    data: {
      testGroup: testGroup,
    },
    success: function (data) {
      var tr = "";
      $(data).each(function (key, val) {
        tr += "<tr>";
        tr += "<td>" + val.drug + "</td>";
        tr += "<td>" + val.dose + "</td>";
        tr += "<td>" + val.frequency + "</td>";
        tr += "<td>" + val.dosecomment + "</td>";
        tr += "<td>" + val.period + "</td>";
        tr += "<td>" + val.pharmacy + "</td>";
        tr += '<td class="text-center"><span class="fa fa-close deleteDrugGroupsDataRow" style="color: red;"></span></td>';
        tr += "<td style='display: none;'>" + val.druggroupid + "</td>";
        tr += "</tr>";
      });

      $('#drugPrescribingTbody').html("");
      $('#drugPrescribingTbody').html(tr);
    }
  });

});

$('#btnOpenHistory').on('click', function () {
  var patientUuid = $('#patientUuid').val();
  window.open('/owa/patienthistory/index.html?uuid=' + patientUuid, '_self')
});