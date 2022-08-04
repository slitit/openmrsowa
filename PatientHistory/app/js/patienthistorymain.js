/* * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
import $ from 'jquery';
import Tagify from '@yaireo/tagify';
import "@yaireo/tagify/dist/tagify.css";
import 'select2/dist/js/select2.full.min.js';
import 'select2/dist/css/select2.min.css';

(function () {
  'use strict';
  document.addEventListener("DOMContentLoaded", function (event) {
    console.log('Patient History OpenMRS Open Web App Started.');
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

          var InstituteUuid = "";
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

//================================================================================

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

var phnVal = ""
$(document).on('click', '#tBodyPatientHistory tr', function () {

  $('#tBodyPatientHistory tr').removeClass('SelectedRowMain');
  $(this).addClass('SelectedRowMain');
  phnVal = $(this).find('td:nth-child(3)').text();

  var patientUuid = $(this).find('td:nth-child(2)').text();

  //--------- Load Encounter Data ----------------------------------------------
  LoadEncountersList(patientUuid);

  //--------- Load Basic Data (Visible part) ----------------------------------------------
  LoadBasicData(patientUuid);
});

function LoadEncountersList(patientUuid) {
  $.ajax({
    url: `/openmrs/ws/rest/v1/encounter?patient=${patientUuid}&&v=default`,
    type: 'GET',
    dataType: 'json',
    data: {},
    headers: {
      'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
      'Content-Type': 'application/json'
    },
    success: function (data) {

      var datax = data.results.sort(function compare(a, b) {
        var dateA = new Date(a.encounterDatetime);
        var dateB = new Date(b.encounterDatetime);
        return dateB - dateA;
      });

      var option = "";
      option += '<option value="" selected>--Select--</option>';
      $(datax).each(function (k, v) {
        option += `<option value="${v.uuid}">${(k + 1)}). Encounter ${v.encounterDatetime.replace(".000+0530", "").replace("T", " ")}</option>`;
      });

      $('#drpEncounter').html("");
      $('#drpEncounter').html(option);
    }
  });
}

function LoadBasicData(patientUuid) {
  $.ajax({
    url: "/openmrs/ws/rest/v1/patient/" + patientUuid,
    type: "GET",
    dataType: "json",
    async: false,
    success: function (result) {

      $('#txtPersonUUID').val($.trim(result.person.uuid));
      $('#txtFullName').text($.trim(result.person.display));
      $('#txtGender').text($.trim(result.person.gender));
      $('#txtDob').text($.trim(result.person.birthdate).split("T")[0]);

      if ($.trim(result.person.gender) == "F") {
        $('.showFemalOnlyPanel').show();
      } else {
        $('.showFemalOnlyPanel').hide();
      }

      if (result.person.birthdate != null) {
        getAge($.trim(result.person.birthdate))
      }

      var telNo = "";
      $(result.person.attributes).each(function (k, v) {
        if (v.display != null) {

          if ($.trim(v.display.split("=")[0]) == "Title") {
            $('#drpTitle').val($.trim(v.display.split("=")[1]));
          }
          if ($.trim(v.display.split("=")[0]) == "Civil Status") {
            $('#txtCivilStatus').text($.trim(v.display.split("=")[1]));
          }
          if ($.trim(v.display.split("=")[0]) == "Ethnicity") {
            $('#txtEthnicity').text($.trim(v.display.split("=")[1]));
          }
          if ($.trim(v.display.split("=")[0]) == "Race") {
            $('#txtRace').text($.trim(v.display.split("=")[1]));
          }
          if ($.trim(v.display.split("=")[0]) == "Blood Group") {
            $('#txtBloodGroup').text($.trim(v.display.split("=")[1]));
          }
          if ($.trim(v.display.split("=")[0]) == "NIC No") {
            $('#txtNICNo').text($.trim(v.display.split("=")[1]));
          }
          if ($.trim(v.display.split("=")[0]) == "Telephone Home") {
            $('#txtTelephoneHome').text($.trim(v.display.split("=")[1]));
            telNo += `${$.trim(v.display.split("=")[1])},`;
          }
          if ($.trim(v.display.split("=")[0]) == "Telephone Number") {
            $('#txtTelephoneMobile').text($.trim(v.display.split("=")[1]));
            telNo += $.trim(v.display.split("=")[1]);
          }
          if ($.trim(v.display.split("=")[0]) == "Guardian Name") {
            $('#txtGurdianInfo').text($.trim(v.display.split("=")[1]));
          }
          if ($.trim(v.display.split("=")[0]) == "ProfileImage") {
            $('#file_upload').attr('src', returnUrl() + '/storage/documents/' + $.trim(v.display.split("=")[1]));
          }
          if ($('#txtDob').val() == "") {
            if ($.trim(v.display.split("=")[0]) == "Years") {
              $('#txtYears').text($.trim(v.display.split("=")[1]));
            }
            if ($.trim(v.display.split("=")[0]) == "Months") {
              $('#txtMonths').text($.trim(v.display.split("=")[1]));
            }
            if ($.trim(v.display.split("=")[0]) == "Days") {
              $('#txtDays').text($.trim(v.display.split("=")[1]));
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
          $('#txtAddress').text($.trim(resultzx.results[0].address1) + ", " + $.trim(resultzx.results[0].address2) + ", " + $.trim(resultzx.results[0].cityVillage));
        })
        .catch(error => console.log('error', error));

    }
  });
}


var generalExaminationObsUuid = "";
var symptomsObsUuid = "";
var complaintsObsUuid = "";
var probableDiagnosisObsUuid = "";
var historyObsUuid = "";
var allergyObsUuid = "";
var cardioVascularSystemObsUuid = "";
var respiratorySystemObsUuid = "";
var abdomenSystemObsUuid = "";
var otherSystemsObsUuid = "";
var pregnancyDetailsObsUuid = "";
$('#drpEncounter').on('change', function () {

  $('input').val("");
  $('table:not(.dataTablex) tbody').html("");
  $('select:not(#drpEncounter)').val("");

  var encounterUuid = $(this).val();
  var patientUuid = $('#tBodyPatientHistory tr.SelectedRowMain').find('td:nth-child(2)').text();

  //--------- Load General Examination & Other Data ----------------------------------------------
  LoadGeneralExaminationAndOtherData(patientUuid, encounterUuid);
  
  //--------- Load Lab Test Data ----------------------------------------------
  LoadLabTestData(patientUuid, encounterUuid);

  //--------- Load Radiology Test Data ----------------------------------------------
  LoadRadiologyTestData(patientUuid, encounterUuid);

  //--------- Load Prescribe Data ----------------------------------------------
  LoadPrescribeData(patientUuid, encounterUuid);

  //--------- Load Treatment & Procedure Data ----------------------------------------------
  LoadTreatmentProcedureData(patientUuid, encounterUuid);

  //--------- Load Ward Referral Data ----------------------------------------------
  LoadWardReferralData(patientUuid, encounterUuid);

  //---------Load Clinic Referral Data----------------------------------------------
  LoadClinicReferralData(patientUuid, encounterUuid);
});


function LoadGeneralExaminationAndOtherData(patientUuid, encounteruuid) {

  var generalExam = 0;
  var historyVis = 0;
  var allergyVis = 0;
  var cardioVascularVis = 0;
  var respiratoryVis = 0;
  var abdomenVis = 0;
  var otherVis = 0;
  var pregnancyVis = 0;

  $.ajax({
    url: "/openmrs/ws/rest/v1/obs?encounter=" + encounteruuid,
    type: "GET",
    dataType: "json",
    async: false,
    success: function (data) {

      $(data.results).each(function (k, v) {

        if (v.display.split(": ")[0] == "Symptoms") {
          generalExam = 1;
          tagifySym.addTags(v.display.split(": ")[2].split(","));
          symptomsObsUuid = v.uuid;
        }

        if (v.display.split(": ")[0] == "Complains") {
          generalExam = 1;
          tagifyCom.addTags(v.display.split(": ")[2].split(","));
          complaintsObsUuid = v.uuid;
        }

        if (v.display.split(": ")[0] == "Probable Diagnosis") {
          generalExam = 1;
          tagifyDiagnose.addTags(v.display.split(": ")[2].split(","));
          probableDiagnosisObsUuid = v.uuid;
        }

        if (v.display.split(": ")[0] == "Basic Examination") {
          generalExam = 1;
          var otherStr = (v.display.split(": ")[1]).split("@@");
          generalExaminationObsUuid = v.uuid;

          $(otherStr).each(function (ke, val) {
            if (val.split(":")[0] == "ExaminationDate") {
              $('#txtExaminationDate').val(val.split(":")[1]);
            }
            if (val.split(":")[0] == "Height") {
              $('#txtBEHeight').val(val.split(":")[1]);
            }
            if (val.split(":")[0] == "Weight") {
              $('#txtBEWeight').val(val.split(":")[1]);
              calculateBMI();
            }
            if (val.split(":")[0] == "Waist") {
              $('#txtBEWaist').val(val.split(":")[1]);
            }
            if (val.split(":")[0] == "Temperature") {
              $('#txtTemperatre').val(val.split(":")[1]);
            }
            if (val.split(":")[0] == "Remarks") {
              $('#txtPatientGERemark').val(val.split(":")[1]);
            }
            if (val.split(":")[0] == "SketchPadJson") {
              var strokes = (val);
              strokes = JSON.parse(strokes.substring(strokes.indexOf(':') + 1));

              var settings = strokes;
              settings.element = '#sketchpad';
              settings.strokes = strokes.strokes
              var sketchpad = new Sketchpad(settings);
            }

          });
        }

        //===================================================================

        if (v.display.split(": ")[0] == "History") {
          historyVis = 1;
          tagifyHistory.addTags(v.display.split(": ")[2].split(","));
          historyObsUuid = v.uuid;
        }

        //===================================================================

        if (v.display.split(": ")[0] == "Allergy") {
          allergyVis = 1;
          var allergyStr = (v.display.substring(v.display.indexOf('::') + 3));
          allergyObsUuid = v.uuid;
          $('#AllergyTbody').html("");
          $(allergyStr.split(",")).each(function (k, v) {
            var trdata = v.split("@@");

            $('#AllergyTbody').append(`<tr>
            <td>${trdata[0]}</td>
            <td>${trdata[1]}</td>\
            <td>${trdata[2]}</td>\
            </tr>`);
          });
        }

        //===================================================================

        if (v.display.split(": ")[0] == "Cardio Vascular System") {
          cardioVascularVis = 1;
          var dataStr = (v.display.substring(v.display.indexOf('::') + 3)).split('@@');
          cardioVascularSystemObsUuid = v.uuid;
          $(dataStr).each(function (k, v) {
            if (v.split(':')[0] == "PulseRate") {
              $('#txtPulseRate').val(v.split(':')[1]);
            }
            if (v.split(':')[0] == "SystolicBP") {
              $('#txtSystolicBP').val(v.split(':')[1]);
            }
            if (v.split(':')[0] == "DiastolicBP") {
              $('#txtDiastolicBP').val(v.split(':')[1]);
            }
            if (v.split(':')[0] == "Remarks") {
              $('#txtRemarksCardioVascularSystem').val(v.split(':')[1]);
            }
          });
        }

        //===================================================================

        if (v.display.split(": ")[0] == "Respiratory System") {
          respiratoryVis = 1;
          var dataStr = (v.display.substring(v.display.indexOf('::') + 3)).split('@@');
          respiratorySystemObsUuid = v.uuid;
          $(dataStr).each(function (k, v) {
            if (v.split(':')[0] == "RespiratoryRate") {
              $('#txtRespiratoryRate').val(v.split(':')[1]);
            }
            if (v.split(':')[0] == "CrepsL") {
              if (v.split(':')[1] == "true") {
                $('#chkCrepsL').attr('checked', true);
              } else {
                $('#chkCrepsL').attr('checked', false);
              }
            }
            if (v.split(':')[0] == "RhonchiL") {
              if (v.split(':')[1] == "true") {
                $('#chkRhonchiL').attr('checked', true);
              } else {
                $('#chkRhonchiL').attr('checked', false);
              };
            }
            if (v.split(':')[0] == "CrepsR") {
              if (v.split(':')[1] == "true") {
                $('#chkCrepsR').attr('checked', true);
              } else {
                $('#chkCrepsR').attr('checked', false);
              }
            }
            if (v.split(':')[0] == "RhonchiR") {
              if (v.split(':')[1] == "true") {
                $('#chkRhonchiR').attr('checked', true);
              } else {
                $('#chkRhonchiR').attr('checked', false);
              }
            }
            if (v.split(':')[0] == "Rhythm") {
              $('#drpRhythm').val(v.split(':')[1]);
            }
            if (v.split(':')[0] == "Sound") {
              $('#drpSound').val(v.split(':')[1]);
            }
            if (v.split(':')[0] == "Remarks") {
              $('#txtRemarksRespiratory').val(v.split(':')[1]);
            }
          });
        }

        //===================================================================

        if (v.display.split(": ")[0] == "Abdomen System") {
          abdomenVis = 1;
          var dataStr = (v.display.substring(v.display.indexOf('::') + 3)).split('@@');
          abdomenSystemObsUuid = v.uuid;
          $(dataStr).each(function (k, v) {

            if (v.split(':')[0] == "Type") {
              $('#drpTypeAbdomen').val(v.split(':')[1]);
            }
            if (v.split(':')[0] == "LiverAbdomen") {
              $('#drpLiverAbdomen').val(v.split(':')[1]);
            }
            if (v.split(':')[0] == "SpleenAbdomen") {
              $('#drpSpleenAbdomen').val(v.split(':')[1]);
            }
            if (v.split(':')[0] == "SoundAbdomen") {
              $('#drpBowelSoundAbdomen').val(v.split(':')[1]);
            }
            if (v.split(':')[0] == "Remarks") {
              $('#txtRemarksAbdomen').val(v.split(':')[1]);
            }
          });
        }

        //===================================================================

        if (v.display.split(": ")[0] == "Other Systems") {
          otherVis = 1;
          var dataStr = (v.display.substring(v.display.indexOf('::') + 3)).split('@@');
          otherSystemsObsUuid = v.uuid;
          $(dataStr).each(function (k, v) {
            if (v.split(':')[0] == "CNS") {
              $('#txtCNS').val(v.split(':')[1]);
            }
            if (v.split(':')[0] == "LiverAbdomen") {
              $('#txtLocomotorSystem').val(v.split(':')[1]);
            }
            if (v.split(':')[0] == "Genitourinary") {
              $('#txtGenitourinary').val(v.split(':')[1]);
            }
            if (v.split(':')[0] == "Other") {
              $('#txtOther').val(v.split(':')[1]);
            }
          });
        }

        //===================================================================

        if (v.display.split(": ")[0] == "Pregnancy Details") {
          pregnancyVis = 1;
          var dataStr = (v.display.substring(v.display.indexOf('::') + 3)).split('@@');
          pregnancyDetailsObsUuid = v.uuid;
          $(dataStr).each(function (k, v) {
            if (v.split(':')[0] == "LastMenstrualDate") {
              $('#txtLastMenstrualDate').val(v.split(':')[1]);
            }
            if (v.split(':')[0] == "PregnancyStatus") {
              $('#drpPregnancyStatus').val(v.split(':')[1]);
            }
            if (v.split(':')[0] == "NoOfWeeks") {
              $('#txtNoOfWeeks').val(v.split(':')[1]);
            }
          });
        }
      });
    }
  });


  if (parseInt(generalExam) > 0) {
    $('#tabGeneralExamination').attr('data-toggle', 'collapse').css({ "background": "linear-gradient(135deg, #549ee7, #36f1cf)" });
  } else {
    $('#tabGeneralExamination').removeAttr('data-toggle').css({ "background": "#935037" });
  }

  if (parseInt(historyVis) > 0) {
    $('#tabHistory').attr('data-toggle', 'collapse').css({ "background": "linear-gradient(135deg, #549ee7, #36f1cf)" });
  } else {
    $('#tabHistory').removeAttr('data-toggle').css({ "background": "#935037" });
  }

  if (parseInt(allergyVis) > 0) {
    $('#tabAllergy').attr('data-toggle', 'collapse').css({ "background": "linear-gradient(135deg, #549ee7, #36f1cf)" });
  } else {
    $('#tabAllergy').removeAttr('data-toggle').css({ "background": "#935037" });
  }

  if (parseInt(cardioVascularVis) > 0) {
    $('#tabCardioVascular').attr('data-toggle', 'collapse').css({ "background": "linear-gradient(135deg, #549ee7, #36f1cf)" });
  } else {
    $('#tabCardioVascular').removeAttr('data-toggle').css({ "background": "#935037" });
  }

  if (parseInt(respiratoryVis) > 0) {
    $('#tabRespiratory').attr('data-toggle', 'collapse').css({ "background": "linear-gradient(135deg, #549ee7, #36f1cf)" });
  } else {
    $('#tabRespiratory').removeAttr('data-toggle').css({ "background": "#935037" });
  }

  if (parseInt(abdomenVis) > 0) {
    $('#tabAbdomen').attr('data-toggle', 'collapse').css({ "background": "linear-gradient(135deg, #549ee7, #36f1cf)" });
  } else {
    $('#tabAbdomen').removeAttr('data-toggle').css({ "background": "#935037" });
  }

  if (parseInt(abdomenVis) > 0) {
    $('#tabAbdomen').attr('data-toggle', 'collapse').css({ "background": "linear-gradient(135deg, #549ee7, #36f1cf)" });
  } else {
    $('#tabAbdomen').removeAttr('data-toggle').css({ "background": "#935037" });
  }

  if (parseInt(otherVis) > 0) {
    $('#tabOther').attr('data-toggle', 'collapse').css({ "background": "linear-gradient(135deg, #549ee7, #36f1cf)" });
  } else {
    $('#tabOther').removeAttr('data-toggle').css({ "background": "#935037" });
  }

  if (parseInt(pregnancyVis) > 0) {
    $('#tabPregnancy').attr('data-toggle', 'collapse').css({ "background": "linear-gradient(135deg, #549ee7, #36f1cf)" });
  } else {
    $('#tabPregnancy').removeAttr('data-toggle').css({ "background": "#935037" });
  }
}

function LoadLabTestData(patientUuid, encounteruuid) {

  var labTestVis = 0;

  $.ajax({
    url: returnUrl() + "/LoadLabTestDataPE",
    type: "POST",
    dataType: "json",
    data: {
      phn: phnVal,
      encounteruuid: encounteruuid,
    },
    async: false,
    success: function (data) {

      $('#labTestTbody').html("");
      $(data).each(function (k, v) {

        labTestVis = 1;
        var testName = ReturnConceptByUuid(v.tests).display.split('@@')[3];

        var tr = "";
        tr += "<tr>";
        tr += "<td attr-uuid='" + v.tests + "'>" + testName + "</td>";
        tr += "<td>" + v.priority + "</td>";
        tr += "<td attr-uuid='" + v.laboratory + "'>" + v.name + "</td>";
        tr += "<td>" + v.specialnotes + "</td>";
        tr += "<td>" + v.antibioticgiven + "</td>";
        tr += "<td>" + v.antibioticdetails + "</td>";
        tr += "</tr>";

        $('#labTestTbody').append(tr);
      });
    }
  });

  if (parseInt(labTestVis) > 0) {
    $('#tabLabTest').attr('data-toggle', 'collapse').css({ "background": "linear-gradient(135deg, #549ee7, #36f1cf)" });
  } else {
    $('#tabLabTest').removeAttr('data-toggle').css({ "background": "#935037" });
  }

}

function LoadRadiologyTestData(patientUuid, encounteruuid) {

  var radiologyTestVis = 0;

  $.ajax({
    url: returnUrl() + "/LoadRadiologyTestDataPE",
    type: "POST",
    dataType: "json",
    data: {
      phn: phnVal,
      encounteruuid: encounteruuid,
    },
    async: false,
    success: function (data) {

      $('#radiologyTbody').html("");
      $(data).each(function (k, v) {

        radiologyTestVis = 1;
        var testName = ReturnConceptByUuid(v.test).display.split('@@')[0];
        var region = ReturnConceptByUuid(v.region).display;
        var localization = ReturnConceptByUuid(v.localization).display;
        var position = ReturnConceptByUuid(v.position).display;

        var tr = "";
        tr += "<tr>";
        tr += "<td attr-uuid='" + v.test + "'>" + testName + "</td>";
        tr += "<td attr-uuid='" + v.region + "'>" + region + "</td>";
        tr += "<td attr-uuid='" + v.localization + "'>" + localization + "</td>";
        tr += "<td attr-uuid='" + v.position + "'>" + position + "</td>";
        tr += "<td>" + v.comments + "</td>";
        tr += "<td>" + v.priority + "</td>";
        tr += "</tr>";

        $('#radiologyTbody').append(tr);
      });
    }
  });

  if (parseInt(radiologyTestVis) > 0) {
    $('#tabRadiologyTest').attr('data-toggle', 'collapse').css({ "background": "linear-gradient(135deg, #549ee7, #36f1cf)" });
  } else {
    $('#tabRadiologyTest').removeAttr('data-toggle').css({ "background": "#935037" });
  }
}

function LoadPrescribeData(patientUuid, encounteruuid) {

  var prescibeVis = 0;

  $.ajax({
    url: returnUrl() + "/LoadPrescribingTestDataPE",
    type: "POST",
    dataType: "json",
    data: {
      phn: phnVal,
      encounteruuid: encounteruuid,
    },
    async: false,
    success: function (data) {

      $('#drugPrescribingTbody').html("");
      $(data).each(function (k, v) {

        prescibeVis = 1;
        var drugname = `(${ReturnConceptByUuid(v.drug).display.split('@@')[1]}-${ReturnConceptByUuid(v.drug).display.split('@@')[2]}) - ${v.strength}`;
        var frequency = ReturnConceptByUuid(v.frequency).display.split('@@')[1];

        var tr = "";
        tr += `<tr attr-strength = '${v.strength}'>`;
        tr += "<td attr-uuid='" + v.drug + "'>" + drugname + "</td>";
        tr += "<td attr-uuid='" + v.dose + "'>" + v.dose + "</td>";
        tr += "<td attr-uuid='" + v.frequency + "'>" + frequency + "</td>";
        tr += "<td>" + v.dosecomment + "</td>";
        tr += "<td>" + v.period + "</td>";
        tr += "<td>" + v.pharmacy + "</td>";
        tr += "</tr>";

        $('#drugPrescribingTbody').append(tr);
      });
    }
  });

  if (parseInt(prescibeVis) > 0) {
    $('#tabPrescribing').attr('data-toggle', 'collapse').css({ "background": "linear-gradient(135deg, #549ee7, #36f1cf)" });
  } else {
    $('#tabPrescribing').removeAttr('data-toggle').css({ "background": "#935037" });
  }
}

function LoadTreatmentProcedureData(patientUuid, encounteruuid) {

  var treatmentProcedureVis = 0;

  $.ajax({
    url: returnUrl() + "/LoadTreatmentProcedureTestDataPE",
    type: "POST",
    dataType: "json",
    data: {
      phn: phnVal,
      encounteruuid: encounteruuid,
    },
    success: function (data) {

      $('#procedurestbody').html("");
      $(data).each(function (k, v) {

        var injection = ReturnConceptByUuid(v.injection).display;
        if (injection == undefined) {
          injection = "";
        }

        var tr = "";
        tr += `<tr>`;
        tr += "<td attr-uuid='" + v.procedureType + "'>" + v.proceduretype + "</td>";
        tr += "<td attr-uuid='" + v.injection + "'>" + injection + "</td>";
        tr += "<td>" + ((v.remarks == null) ? '' : v.remarks) + "</td>";
        tr += "<td>" + v.type + "</td>";
        tr += "</tr>";

        $('#procedurestbody').append(tr);
      });
    }
  });

  if (parseInt(treatmentProcedureVis) > 0) {
    $('#tabTreatmentsProcedure').attr('data-toggle', 'collapse').css({ "background": "linear-gradient(135deg, #549ee7, #36f1cf)" });
  } else {
    $('#tabTreatmentsProcedure').removeAttr('data-toggle').css({ "background": "#935037" });
  }
}

function LoadWardReferralData(patientUuid, encounteruuid) {

  var wardReferralVis = 0;

  $.ajax({
    url: returnUrl() + "/LoadWardReferralTestDataPE",
    type: "POST",
    dataType: "json",
    data: {
      phn: phnVal,
      encounteruuid: encounteruuid,
    },
    async: false,
    success: function (data) {

      if (data[0] != undefined) {
        wardReferralVis = 1;
        wardRefObsUuid = data[0].wardreferralid;
        $('#drpclinicReferral').val(data[0].ward).trigger('change.select2');
        $('#txtWardRemarks').val(data[0].remarks);
      }
    }
  });

  if (parseInt(wardReferralVis) > 0) {
    $('#tabWardReferral').attr('data-toggle', 'collapse').css({ "background": "linear-gradient(135deg, #549ee7, #36f1cf)" });
  } else {
    $('#tabWardReferral').removeAttr('data-toggle').css({ "background": "#935037" });
  }
}

function LoadClinicReferralData(patientUuid, encounteruuid) {

  var clinicReferralVis = 0;

  $.ajax({
    url: returnUrl() + "/LoadClinicReferralTestDataPE",
    type: "POST",
    dataType: "json",
    data: {
      phn: phnVal,
      encounteruuid: encounteruuid,
    },
    async: false,
    success: function (data) {

      if (data[0] != undefined) {
        clinicReferralVis = 1;
        clinicRefObsUuid = data[0].clinicreferralid;
        $('#drpclinicReferral').val(data[0].clinic).trigger('change.select2');
        $('#txtWardRemarks').val(data[0].remarks);
      }
    }
  });

  if (parseInt(clinicReferralVis) > 0) {
    $('#tabClinicReferral').attr('data-toggle', 'collapse').css({ "background": "linear-gradient(135deg, #549ee7, #36f1cf)" });
  } else {
    $('#tabClinicReferral').removeAttr('data-toggle').css({ "background": "#935037" });
  }
}

function calculateBMI() {
  let height = ($("#txtBEHeight").val());
  let weight = ($("#txtBEWeight").val());

  let result = document.querySelector("#txtBMI");

  if (height == "") {
    height = 0;
  }

  if (weight == "") {
    weight = 0;
  }

  let bmi = (parseInt(weight) / ((parseInt(height) * parseInt(height))
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

  $('#txtYears').text(years);
  $('#txtMonths').text(months);
  $('#txtDays').text(days);
}


//---------------------------------------------------------------

LoadWardsForInstituteFunc();
function LoadWardsForInstituteFunc() {

  $.ajax({
    url: returnUrl() + '/LoadDifSectionsForInstitute',
    type: "POST",
    dataType: "json",
    async: false,
    data: { InstituteUuid: InstituteUuid, type: 'Ward' },
    success: function (data) {

      var options = "";
      options += "<option disabled selected value=''>--Select--</option>";
      $(data).each(function (key, val) {
        options += "<option value='" + val.uuid + "'>" + (val.name) + "</option>";
      });

      $('#drpWardWardReferral').html("");
      $('#drpWardWardReferral').html(options);

      $('#drpWardWardReferral').select2({
        dropdownAutoWidth: true,
        width: '100%'
      });
    }
  });
}

LoadClinicsForInstituteFunc();
function LoadClinicsForInstituteFunc() {

  $.ajax({
    url: returnUrl() + '/LoadDifSectionsForInstitute',
    type: "POST",
    dataType: "json",
    async: false,
    data: { InstituteUuid: InstituteUuid, type: 'Clinic' },
    success: function (data) {

      var options = "";
      options += "<option disabled selected value=''>--Select--</option>";
      $(data).each(function (key, val) {
        options += "<option value='" + val.uuid + "'>" + (val.name) + "</option>";
      });

      $('#drpclinicReferral').html("");
      $('#drpclinicReferral').html(options);

      $('#drpclinicReferral').select2({
        dropdownAutoWidth: true,
        width: '100%'
      });
    }
  });
}