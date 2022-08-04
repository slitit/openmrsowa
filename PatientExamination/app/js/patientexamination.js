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


// Get the element
let topBtn = document.querySelector(".top-btn");
// On Click, Scroll to the page's top, replace 'smooth' with 'auto' if you don't want smooth scrolling
topBtn.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
// On scroll, Show/Hide the btn with animation
window.onscroll = () => window.scrollY > 200 ? topBtn.style.opacity = 1 : topBtn.style.opacity = 0

var sketchpad = new Sketchpad({
  element: '#sketchpad',
  width: 300,
  height: 210
});

$('#clear').on('click', function () {
  var canvas = document.getElementById("sketchpad");
  var context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
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

$('#threeD .button').on('click', function (e) {
  $('html,body').animate({
    scrollTop: $("#panelBodyCon").offset().top
  }, 'slow');
});

buttonClickPN('.threeD');
function buttonClickPN(string) {
  $(string).find(".button").on('click', function () {
    if (!$(this).hasClass('active')) {
      $(string + ' .active').removeClass('active');
      $(string + ' .prev').removeClass('prev');
      $(string + ' .next').removeClass('next');
      $(this).addClass('active');
      $(this).prev().addClass('prev');
      $(this).next().addClass('next');
    }
  })
}

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

$('#file_upload').attr('src', returnUrl() + "/storage/documents/useremprty.png");

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

//================================================================================

LoadProbibleDiagnoseListFunc();
function LoadProbibleDiagnoseListFunc() {
  var uuidOfConcept = "";

  $.ajax({
    url: '/openmrs/ws/rest/v1/concept?name=DiagnoseList',
    type: 'GET',
    dataType: 'json',
    async: false,
    data: {},
    headers: {
      'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
      'Content-Type': 'application/json'
    },
    success: function success(data) {

      uuidOfConcept = data.results[0].uuid;
    }
  });

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

      var setArrayDiagnose = [];
      $(data.setMembers).each(function (key, val) {
        setArrayDiagnose.push(val.display);
      });

      tagifyDiagnose.settings.whitelist = setArrayDiagnose;
    }
  });
}

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
          $('#txtPhnNo').val(result.data);
          LoadDataByToken(result.data);
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

      $.ajax({
        url: returnUrlQmsApi() + '/tokenissue/getTokenNumberWisePHN/' + unitid[0] + '/' + insuuid + '/' + result.status,
        type: 'POST',
        dataType: 'json',
        data: {},
        success: function (result) {
          $('#txtPhnNo').val(result.data).change();
        }
      });
    }
  });


});

function LoadDataByToken(phnVal) {
  if (phnVal != "") {
    $.ajax({
      url: returnUrl() + "/getPersonUUidFromPHN",
      type: "POST",
      dataType: "json",
      data: { phn: phnVal },
      success: function (data) {
        loadFormData(data.uuid, phnVal);
      }
    });
  }
}

var stat = 0;
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
$('#txtPhnNo').on('change', function () {

  var phnVal = $(this).val();

  $('#file_upload').attr('src', returnUrl() + '/storage/documents/useremprty.png');
  $('.rof').val("");

  if (phnVal != "") {

    var count = CheckPhnExistForTodayFunc(phnVal, InstituteUuid);

    if (count > 0) {
      Swal.fire({
        icon: 'warning',
        html: 'Do you want to load the last visit data and edit it or create new visit!',
        showCloseButton: true,
        showCancelButton: true,
        focusConfirm: false,
        confirmButtonText: 'New Visit!',
        confirmButtonAriaLabel: 'Thumbs up, great!',
        cancelButtonText: 'Edit Last Visit!',
        cancelButtonAriaLabel: 'Thumbs down'
      }).then((result) => {
        if (result.isConfirmed) {

          $.ajax({
            url: returnUrl() + "/getPersonUUidFromPHN",
            type: "POST",
            dataType: "json",
            data: { phn: phnVal },
            success: function (data) {
              loadFormData(data.uuid, phnVal);
            }
          });

        } else if (result.dismiss === Swal.DismissReason.cancel) {

          stat = 1;

          //Get Encounter Uuid ==========================================================
          var encounteruuid = "";
          $.ajax({
            url: returnUrl() + "/GetMaxEncounterForPhn",
            type: "POST",
            dataType: "json",
            async: false,
            data: { phn: phnVal },
            success: function (data) {
              encounteruuid = data.encounteruuid;
              $('#txtEncounterUUID').val(encounteruuid);
            }
          });

          //Get Patient Uuid =============================================================
          var patientuuid = "";
          $.ajax({
            url: returnUrl() + "/getPersonUUidFromPHN",
            type: "POST",
            dataType: "json",
            async: false,
            data: { phn: phnVal },
            success: function (data) {
              patientuuid = data.uuid;
            }
          });

          //Load Basic Data (Visible part) ==========================================================
          $.ajax({
            url: "/openmrs/ws/rest/v1/patient/" + patientuuid,
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

              fetch("/openmrs/ws/rest/v1/person/" + patientuuid + "/address", requestOptions)
                .then(response => response.json())
                .then(resultzx => {

                  $('#txtAddress').text($.trim(resultzx.results[0].address1) + ", " + $.trim(resultzx.results[0].address2) + ", " + $.trim(resultzx.results[0].cityVillage));

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

            }
          });

          //---------Load General Examination & Other Data----------------------------------------------

          $.ajax({
            url: "/openmrs/ws/rest/v1/obs?encounter=" + encounteruuid,
            type: "GET",
            dataType: "json",
            async: false,
            success: function (data) {

              $(data.results).each(function (k, v) {

                if (v.display.split(": ")[0] == "Symptoms") {
                  tagifySym.addTags(v.display.split(": ")[2].split(","));
                  symptomsObsUuid = v.uuid;
                }

                if (v.display.split(": ")[0] == "Complains") {
                  tagifyCom.addTags(v.display.split(": ")[2].split(","));
                  complaintsObsUuid = v.uuid;
                }

                if (v.display.split(": ")[0] == "Probable Diagnosis") {
                  tagifyDiagnose.addTags(v.display.split(": ")[2].split(","));
                  probableDiagnosisObsUuid = v.uuid;
                }

                if (v.display.split(": ")[0] == "Basic Examination") {
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
                      $('.calBMI').keyup();
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
                      sketchpad = new Sketchpad(settings);
                    }

                  });
                }

                //===================================================================

                if (v.display.split(": ")[0] == "History") {
                  tagifyHistory.addTags(v.display.split(": ")[2].split(","));
                  historyObsUuid = v.uuid;
                }

                //===================================================================

                if (v.display.split(": ")[0] == "Allergy") {
                  var allergyStr = (v.display.substring(v.display.indexOf('::') + 3));
                  allergyObsUuid = v.uuid;
                  $(allergyStr.split(",")).each(function (k, v) {
                    var trdata = v.split("@@");

                    $('#AllergyTbody').append(`<tr>
                    <td>${trdata[0]}</td>
                    <td>${trdata[1]}</td>\
                    <td>${trdata[2]}</td>\
                    <td class="text-center"><span class="fa fa-close deleteAllergyRow" style="color: red;"></span></td></tr>`);
                  });
                }

                //===================================================================

                if (v.display.split(": ")[0] == "Cardio Vascular System") {
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

          //---------Load Lab Test Data----------------------------------------------

          $.ajax({
            url: returnUrl() + "/LoadLabTestDataPE",
            type: "POST",
            dataType: "json",
            data: {
              phn: phnVal,
              encounteruuid: encounteruuid,
            },
            success: function (data) {

              $(data).each(function (k, v) {

                var testName = ReturnConceptByUuid(v.tests).display.split('@@')[3];

                var tr = "";
                tr += "<tr>";
                tr += "<td attr-uuid='" + v.tests + "'>" + testName + "</td>";
                tr += "<td>" + v.priority + "</td>";
                tr += "<td attr-uuid='" + v.laboratory + "'>" + v.name + "</td>";
                tr += "<td>" + v.specialnotes + "</td>";
                tr += "<td>" + v.antibioticgiven + "</td>";
                tr += "<td>" + v.antibioticdetails + "</td>";
                tr += '<td class="text-center"><span class="fa fa-close deleteLabTestRow" style="color: red;"></span></td>';
                tr += "<td style='display: none;'>" + v.labtestsid + "</td>";
                tr += "</tr>";

                $('#labTestTbody').append(tr);

              });
            }
          });

          //---------Load Radiology Test Data----------------------------------------------

          $.ajax({
            url: returnUrl() + "/LoadRadiologyTestDataPE",
            type: "POST",
            dataType: "json",
            data: {
              phn: phnVal,
              encounteruuid: encounteruuid,
            },
            success: function (data) {

              $(data).each(function (k, v) {

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
                tr += '<td class="text-center"><span class="fa fa-close deleteRowRadiology" style="color: red;"></span></td>';
                tr += "<td style='display: none;'>" + v.radiologyid + "</td>";
                tr += "</tr>";

                $('#radiologyTbody').append(tr);

              });
            }
          });

          //---------Load Prescribe Data----------------------------------------------

          $.ajax({
            url: returnUrl() + "/LoadPrescribingTestDataPE",
            type: "POST",
            dataType: "json",
            data: {
              phn: phnVal,
              encounteruuid: encounteruuid,
            },
            success: function (data) {

              $(data).each(function (k, v) {

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
                tr += '<td class="text-center"><span class="fa fa-close deletePrescribeRow" style="color: red;"></span></td>';
                tr += "<td style='display: none;'>" + v.prescribingid + "</td>";
                tr += "</tr>";

                $('#drugPrescribingTbody').append(tr);
              });
            }
          });

          //---------Load Treatment & Procedure Data----------------------------------------------

          $.ajax({
            url: returnUrl() + "/LoadTreatmentProcedureTestDataPE",
            type: "POST",
            dataType: "json",
            data: {
              phn: phnVal,
              encounteruuid: encounteruuid,
            },
            success: function (data) {

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
                tr += '<td class="text-center"><span class="fa fa-close deleteProcRow" style="color: red;"></span></td>';
                tr += "<td style='display: none;'>" + v.proceduresid + "</td>";
                tr += "</tr>";

                $('#procedurestbody').append(tr);

              });
            }
          });

          //---------Load Ward Referral Data----------------------------------------------

          $.ajax({
            url: returnUrl() + "/LoadWardReferralTestDataPE",
            type: "POST",
            dataType: "json",
            data: {
              phn: phnVal,
              encounteruuid: encounteruuid,
            },
            success: function (data) {

              if (data[0] != undefined) {
                wardRefObsUuid = data[0].wardreferralid;
                $('#drpclinicReferral').val(data[0].ward).trigger('change.select2');
                $('#txtWardRemarks').val(data[0].remarks);
              }
            }
          });

          //---------Load Clinic Referral Data----------------------------------------------

          $.ajax({
            url: returnUrl() + "/LoadClinicReferralTestDataPE",
            type: "POST",
            dataType: "json",
            data: {
              phn: phnVal,
              encounteruuid: encounteruuid,
            },
            success: function (data) {

              if (data[0] != undefined) {
                clinicRefObsUuid = data[0].clinicreferralid;
                $('#drpclinicReferral').val(data[0].clinic).trigger('change.select2');
                $('#txtWardRemarks').val(data[0].remarks);
              }
            }
          });

        }
      })
    } else {

      stat = 0;

      $.ajax({
        url: returnUrl() + "/getPersonUUidFromPHN",
        type: "POST",
        dataType: "json",
        data: { phn: phnVal },
        success: function success(data) {
          loadFormData(data.uuid, phnVal);
        },
      });
    }
  }
});

function CheckPhnExistForTodayFunc(phnVal, instituteUuid) {
  var result = "";
  $.ajax({
    url: returnUrl() + "/CheckPhnExistForToday",
    type: "POST",
    dataType: "json",
    async: false,
    data: { phn: phnVal, instituteUuid: instituteUuid },
    success: function (data) {
      result = data.count;
    }
  });
  return result;
}

var telNo = "";
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

      //============================== Create Visit =====================================
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

  $.ajax({
    url: returnUrl() + "/DeleteVoidRecordObs",
    type: "POST",
    dataType: "json",
    async: false,
    data: {},
    success: function (data) {
    }
  });

  Swal.fire({
    title: 'Are you sure you want to end visit?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, End!'
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.setItem("refresh", "ok");
      location.reload();
    }
  });

});

if (localStorage.getItem("refresh") == "ok") {
  localStorage.removeItem("refresh");
  $('#btnCallNext').click();
}

$('#btnCompleteForm').on('click', function () {

  $.ajax({
    url: returnUrl() + "/DeleteVoidRecordObs",
    type: "POST",
    dataType: "json",
    async: false,
    data: {},
    success: function (data) {
    }
  });

  Swal.fire({
    title: 'Are you sure you want to end visit?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, End!'
  }).then((result) => {
    if (result.isConfirmed) {
      location.reload();
    }
  })
});


var myHeaders = new Headers();
myHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
myHeaders.append("Content-Type", "application/json");
myHeaders.append("Cookie", "JSESSIONID=56AEC369713B93BCB5B9BC7B34AA6E5F");

//==============================================================================

$('#btnSaveGeneralExamination').on('click', function () {

  $('#btnSaveGeneralExamination').attr('disabled', true);

  var phnNo = $('#txtPhnNo').val();
  var personUUID = $('#txtPersonUUID').val();
  var encounterUUID = $('#txtEncounterUUID').val();

  if (phnNo == "" || phnNo == null) {

    iziToast.error({
      title: 'Error',
      message: 'Phn Can\'t be empty!',
      position: 'topRight'
    });

    $('#btnSaveGeneralExamination').attr('disabled', false);

    return;
  }

  basicExaminationSave(phnNo, personUUID, encounterUUID);
  symptomsSave(phnNo, personUUID, encounterUUID);
  complaintSave(phnNo, personUUID, encounterUUID);
  probableDiagnosisSave(phnNo, personUUID, encounterUUID);

  iziToast.success({
    title: 'OK',
    message: 'General Examination Saved Successfully!',
    position: 'topRight'
  });

});

//-----------------------------------------------------------------------------------

function basicExaminationSave(phnNo, personUUID, encounterUUID) {

  var examinationDate = $('#txtExaminationDate').val();
  var beHeight = $('#txtBEHeight').val();
  var beWeight = $('#txtBEWeight').val();
  var beWaist = $('#txtBEWaist').val();
  var temperature = $('#txtTemperatre').val();
  var remarks = $('#txtPatientGERemark').val();
  var sketchPadJson = sketchpad.toJSON();

  var str = `ExaminationDate:${examinationDate}@@Height:${beHeight}@@Weight:${beWeight}@@Waist:${beWaist}@@Temperature:${temperature}@@Remarks:${remarks}@@SketchPadJson:${sketchPadJson.toString()}`;

  if (stat == 0) {
    GeneralExaminationInsert(personUUID, phnNo, encounterUUID, str);
  } else if (stat == 1) {
    GeneralExaminationUpdate(str);
  }
}

function GeneralExaminationInsert(personUUID, phnNo, encounterUUID, str) {

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
  var raw = JSON.stringify({ "person": personUUID, "comment": phnNo, "concept": uuidOfBasicExaminationConcept, "encounter": encounterUUID, "obsDatetime": (new Date()).toISOString(), "value": str });

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
    }
  });

}

function GeneralExaminationUpdate(str) {

  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Cookie", "JSESSIONID=56AEC369713B93BCB5B9BC7B34AA6E5F");

  var raw = JSON.stringify({ "value": str });

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  fetch("/openmrs/ws/rest/v1/obs/" + generalExaminationObsUuid, requestOptions)
    .then(response => response.json())
    .then(result => {
      console.log(result);
    })
    .catch(error => console.log('error', error));

}

//-----------------------------------------------------------------------------------

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

  if (stat == 0) {
    SymptomsInsert(personUUID, phnNo, encounterUUID, arr);
  } else if (stat == 1) {
    SymptomsUpdate(arr);
  }
}

function SymptomsInsert(personUUID, phnNo, encounterUUID, arr) {
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
    var raw = JSON.stringify({ "person": personUUID, "comment": phnNo, "concept": uuidOfSymptomsConcept, "encounter": encounterUUID, "obsDatetime": (new Date()).toISOString(), "value": `Symptoms: ${arr.toString()}` });

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
      }
    });

  }
}

function SymptomsUpdate(arr) {

  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Cookie", "JSESSIONID=56AEC369713B93BCB5B9BC7B34AA6E5F");

  var raw = JSON.stringify({ "value": `Symptoms: ${arr.toString()}` });

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  fetch("/openmrs/ws/rest/v1/obs/" + symptomsObsUuid, requestOptions)
    .then(response => response.json())
    .then(result => {
      console.log(result);
    })
    .catch(error => console.log('error', error));

}

//-----------------------------------------------------------------------------------

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

  if (stat == 0) {
    ComplaintInsert(personUUID, phnNo, encounterUUID, arr);
  } else if (stat == 1) {
    ComplaintUpdate(arr);
  }
}

function ComplaintInsert(personUUID, phnNo, encounterUUID, arr) {
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
    var raw = JSON.stringify({ "person": personUUID, "comment": phnNo, "concept": uuidOfComplainsConcept, "encounter": encounterUUID, "obsDatetime": (new Date()).toISOString(), "value": `Complains: ${arr.toString()}` });

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
      }
    });

  }
}

function ComplaintUpdate(arr) {

  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Cookie", "JSESSIONID=56AEC369713B93BCB5B9BC7B34AA6E5F");

  var raw = JSON.stringify({ "value": `Complains: ${arr.toString()}` });

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  fetch("/openmrs/ws/rest/v1/obs/" + complaintsObsUuid, requestOptions)
    .then(response => response.json())
    .then(result => {
      console.log(result);
    })
    .catch(error => console.log('error', error));

}

//-----------------------------------------------------------------------------------

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

  if (stat == 0) {
    DiagnosisInsert(personUUID, phnNo, encounterUUID, arr);
  } else if (stat == 1) {
    DiagnosisUpdate(arr);
  }
}

function DiagnosisInsert(personUUID, phnNo, encounterUUID, arr) {
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
    var raw = JSON.stringify({ "person": personUUID, "comment": phnNo, "concept": uuidOfProbableDiagnosisConcept, "encounter": encounterUUID, "obsDatetime": (new Date()).toISOString(), "value": `ProbableDiagnosis: ${arr.toString()}` });

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
      }
    });

  }
}

function DiagnosisUpdate(arr) {

  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Cookie", "JSESSIONID=56AEC369713B93BCB5B9BC7B34AA6E5F");

  var raw = JSON.stringify({ "value": `ProbableDiagnosis: ${arr.toString()}` });

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  fetch("/openmrs/ws/rest/v1/obs/" + probableDiagnosisObsUuid, requestOptions)
    .then(response => response.json())
    .then(result => {
      console.log(result);
    })
    .catch(error => console.log('error', error));

}

//=================================================================================

$('#btnSaveHistory').on('click', function () {
  var $this = $(this);
  $this.attr('disabled', true);

  var phnNo = $('#txtPhnNo').val();
  var personUUID = $('#txtPersonUUID').val();
  var encounterUUID = $('#txtEncounterUUID').val();

  if (phnNo == "" || phnNo == null) {

    iziToast.error({
      title: 'Error',
      message: 'Phn Can\'t be empty!',
      position: 'topRight'
    });

    $this.attr('disabled', false);

    return;
  }

  historySave(phnNo, personUUID, encounterUUID);
});

function historySave(phnNo, personUUID, encounterUUID) {

  var arr = [];
  if ($('#txtPatientHistory').val() != "") {
    var list = JSON.parse($('#txtPatientHistory').val());
    $(list).each(function (k, v) {
      if (v.readonly != true) {
        arr.push(v.value);
      }
    });
  }

  if (stat == 0) {
    HistoryInsert(personUUID, phnNo, encounterUUID, arr);
  } else if (stat == 1) {
    HistoryUpdate(arr);
  }
}

function HistoryInsert(personUUID, phnNo, encounterUUID, arr) {
  if (arr.length != 0) {

    //=========== Get/Set Symptoms Concept UUID =============================
    var uuidOfHistoryConcept = "";

    $.ajax({
      url: '/openmrs/ws/rest/v1/concept?name=History',
      type: 'GET',
      dataType: 'json',
      async: false,
      data: {},
      headers: {
        'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
        'Content-Type': 'application/json'
      },
      success: function (data) {

        uuidOfHistoryConcept = data.results[0].uuid;
      }
    });

    //=========== Save History to Observation =============================
    var raw = JSON.stringify({ "person": personUUID, "comment": phnNo, "concept": uuidOfHistoryConcept, "encounter": encounterUUID, "obsDatetime": (new Date()).toISOString(), "value": `History: ${arr.toString()}` });

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
          message: 'History Saved Successfully!',
          position: 'topRight'
        });

      }
    });

  }
}

function HistoryUpdate(arr) {

  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Cookie", "JSESSIONID=56AEC369713B93BCB5B9BC7B34AA6E5F");

  var raw = JSON.stringify({ "value": `History: ${arr.toString()}` });

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  fetch("/openmrs/ws/rest/v1/obs/" + historyObsUuid, requestOptions)
    .then(response => response.json())
    .then(result => {
      console.log(result);
    })
    .catch(error => console.log('error', error));

}

//=================================================================================

$('#btnSaveAllergies').on('click', function () {
  var $this = $(this);
  $this.attr('disabled', true);

  var phnNo = $('#txtPhnNo').val();
  var personUUID = $('#txtPersonUUID').val();
  var encounterUUID = $('#txtEncounterUUID').val();

  if (phnNo == "" || phnNo == null) {

    iziToast.error({
      title: 'Error',
      message: 'Phn Can\'t be empty!',
      position: 'topRight'
    });

    $this.attr('disabled', false);

    return;
  }

  allergySave(phnNo, personUUID, encounterUUID);
});

function allergySave(phnNo, personUUID, encounterUUID) {

  if ($('#AllergyTbody tr').length != 0) {

    var arr = new Array();
    $('#AllergyTbody tr').each(function () {
      var Allergy = $(this).find('td:nth-child(1)').text();
      var Status = $(this).find('td:nth-child(2)').text();
      var Remarks = $(this).find('td:nth-child(3)').text();
      arr.push(`${Allergy}@@${Status}@@${Remarks}`);
    });

    if (stat == 0) {
      AllergyInsert(personUUID, phnNo, encounterUUID, arr);
    } else if (stat == 1) {
      AllergyUpdate(arr);
    }

  }
}

function AllergyInsert(personUUID, phnNo, encounterUUID, arr) {
  //=========== Get/Set Allergy Concept UUID =============================
  var uuidOfAllergyConcept = "";

  $.ajax({
    url: '/openmrs/ws/rest/v1/concept?name=Allergy',
    type: 'GET',
    dataType: 'json',
    async: false,
    data: {},
    headers: {
      'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
      'Content-Type': 'application/json'
    },
    success: function (data) {

      uuidOfAllergyConcept = data.results[0].uuid;
    }
  });

  //=========== Save Allergy to Observation =============================
  var raw = JSON.stringify({ "person": personUUID, "comment": phnNo, "concept": uuidOfAllergyConcept, "encounter": encounterUUID, "obsDatetime": (new Date()).toISOString(), "value": `Allergy:: ${arr.toString()}` });

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
        message: 'Allergy Saved Successfully!',
        position: 'topRight'
      });
    }
  });
}

function AllergyUpdate(arr) {

  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Cookie", "JSESSIONID=56AEC369713B93BCB5B9BC7B34AA6E5F");

  var raw = JSON.stringify({ "value": `Allergy:: ${arr.toString()}` });

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  fetch("/openmrs/ws/rest/v1/obs/" + allergyObsUuid, requestOptions)
    .then(response => response.json())
    .then(result => {
      console.log(result);
    })
    .catch(error => console.log('error', error));

}

//=================================================================================

$('#btnSaveCardioVasculorSystem').on('click', function () {
  var $this = $(this);
  $this.attr('disabled', true);

  var phnNo = $('#txtPhnNo').val();
  var personUUID = $('#txtPersonUUID').val();
  var encounterUUID = $('#txtEncounterUUID').val();

  if (phnNo == "" || phnNo == null) {

    iziToast.error({
      title: 'Error',
      message: 'Phn Can\'t be empty!',
      position: 'topRight'
    });

    $this.attr('disabled', false);

    return;
  }

  cardioVascularSystemSave(phnNo, personUUID, encounterUUID);
});

function cardioVascularSystemSave(phnNo, personUUID, encounterUUID) {

  var pulseRate = $('#txtPulseRate').val();
  var systolicBP = $('#txtSystolicBP').val();
  var diastolicBP = $('#txtDiastolicBP').val();
  var remarks = $('#txtRemarksCardioVascularSystem').val();

  if (pulseRate == "" && systolicBP == "" && diastolicBP == "" && remarks == "") {

  } else {

    var str = `PulseRate:${pulseRate}@@SystolicBP:${systolicBP}@@DiastolicBP:${diastolicBP}@@Remarks:${remarks}`;

    if (stat == 0) {
      CardioVascularSystemInsert(personUUID, phnNo, encounterUUID, str);
    } else if (stat == 1) {
      CardioVascularSystemUpdate(str);
    }
  }
}

function CardioVascularSystemInsert(personUUID, phnNo, encounterUUID, str) {
  //=========== Get/Set CardioVascularSystem Concept UUID =============================
  var uuidOfCardioVascularSystemConcept = "";

  $.ajax({
    url: '/openmrs/ws/rest/v1/concept?name=Cardio Vascular System',
    type: 'GET',
    dataType: 'json',
    async: false,
    data: {},
    headers: {
      'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
      'Content-Type': 'application/json'
    },
    success: function (data) {

      uuidOfCardioVascularSystemConcept = data.results[0].uuid;
    }
  });

  //=========== Save CardioVascularSystem to Observation =============================
  var raw = JSON.stringify({ "person": personUUID, "comment": phnNo, "concept": uuidOfCardioVascularSystemConcept, "encounter": encounterUUID, "obsDatetime": (new Date()).toISOString(), "value": `CardioVascularSystem:: ${str}` });

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
        message: 'Cardio Vascular System Data Saved Successfully!',
        position: 'topRight'
      });
    }
  });
}

function CardioVascularSystemUpdate(arr) {

  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Cookie", "JSESSIONID=56AEC369713B93BCB5B9BC7B34AA6E5F");

  var raw = JSON.stringify({ "value": `CardioVascularSystem:: ${str}` });

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  fetch("/openmrs/ws/rest/v1/obs/" + cardioVascularSystemObsUuid, requestOptions)
    .then(response => response.json())
    .then(result => {
      console.log(result);
    })
    .catch(error => console.log('error', error));

}

//=================================================================================

$('#btnSaveRespiratorySystem').on('click', function () {
  var $this = $(this);
  $this.attr('disabled', true);

  var phnNo = $('#txtPhnNo').val();
  var personUUID = $('#txtPersonUUID').val();
  var encounterUUID = $('#txtEncounterUUID').val();

  if (phnNo == "" || phnNo == null) {

    iziToast.error({
      title: 'Error',
      message: 'Phn Can\'t be empty!',
      position: 'topRight'
    });

    $this.attr('disabled', false);

    return;
  }

  respiratorySystemSave(phnNo, personUUID, encounterUUID);
});

function respiratorySystemSave(phnNo, personUUID, encounterUUID) {

  var respiratoryRate = $('#txtRespiratoryRate').val();
  var chkCrepsL = $('#chkCrepsL').is(':checked');
  var chkRhonchiL = $('#chkRhonchiL').is(':checked');
  var chkCrepsR = $('#chkCrepsR').is(':checked');
  var chkRhonchiR = $('#chkRhonchiR').is(':checked');
  var drpRhythm = $('#drpRhythm').val();
  var drpSound = $('#drpSound').val();
  var remarks = $('#txtRemarksRespiratory').val();

  if (respiratoryRate == "" && chkCrepsL == false && chkRhonchiL == false && chkCrepsR == false && chkRhonchiR == false && drpRhythm == "" && drpSound == "" && remarks == "") {

  } else {
    var str = `RespiratoryRate:${respiratoryRate}@@CrepsL:${chkCrepsL}@@RhonchiL:${chkRhonchiL}@@CrepsR:${chkCrepsR}@@RhonchiR:${chkRhonchiR}@@Rhythm:${drpRhythm}@@Sound:${drpSound}@@Remarks:${remarks}`;

    if (stat == 0) {
      RespiratorySystemInsert(personUUID, phnNo, encounterUUID, str);
    } else if (stat == 1) {
      RespiratorySystemUpdate(str);
    }
  }
}

function RespiratorySystemInsert(personUUID, phnNo, encounterUUID, str) {
  //=========== Get/Set Respiratory System Concept UUID =============================
  var uuidOfRespiratorySystemConcept = "";

  $.ajax({
    url: '/openmrs/ws/rest/v1/concept?name=Respiratory System',
    type: 'GET',
    dataType: 'json',
    async: false,
    data: {},
    headers: {
      'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
      'Content-Type': 'application/json'
    },
    success: function (data) {

      uuidOfRespiratorySystemConcept = data.results[0].uuid;
    }
  });

  //=========== Save Respiratory System to Observation =============================
  var raw = JSON.stringify({ "person": personUUID, "comment": phnNo, "concept": uuidOfRespiratorySystemConcept, "encounter": encounterUUID, "obsDatetime": (new Date()).toISOString(), "value": `RespiratorySystem:: ${str}` });

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
        message: 'Respiratory System Data Saved Successfully!',
        position: 'topRight'
      });
    }
  });
}

function RespiratorySystemUpdate(arr) {

  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Cookie", "JSESSIONID=56AEC369713B93BCB5B9BC7B34AA6E5F");

  var raw = JSON.stringify({ "value": `RespiratorySystem:: ${str}` });

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  fetch("/openmrs/ws/rest/v1/obs/" + respiratorySystemObsUuid, requestOptions)
    .then(response => response.json())
    .then(result => {
      console.log(result);
    })
    .catch(error => console.log('error', error));

}

//=================================================================================

$('#btnSaveAbdomenSystem').on('click', function () {
  var $this = $(this);
  $this.attr('disabled', true);

  var phnNo = $('#txtPhnNo').val();
  var personUUID = $('#txtPersonUUID').val();
  var encounterUUID = $('#txtEncounterUUID').val();

  if (phnNo == "" || phnNo == null) {

    iziToast.error({
      title: 'Error',
      message: 'Phn Can\'t be empty!',
      position: 'topRight'
    });

    $this.attr('disabled', false);

    return;
  }

  abdomenSystemSave(phnNo, personUUID, encounterUUID);
});

function abdomenSystemSave(phnNo, personUUID, encounterUUID) {

  var drpTypeAbdomen = $('#drpTypeAbdomen').val();
  var drpLiverAbdomen = $('#drpLiverAbdomen').val();
  var drpSpleenAbdomen = $('#drpSpleenAbdomen').val();
  var drpBowelSoundAbdomen = $('#drpBowelSoundAbdomen').val();
  var remarks = $('#txtRemarksAbdomen').val();

  if (drpTypeAbdomen == "" && drpLiverAbdomen == "" && drpSpleenAbdomen == "" && drpBowelSoundAbdomen == "" && remarks == "") {

  } else {
    var str = `Type:${drpTypeAbdomen}@@LiverAbdomen:${drpLiverAbdomen}@@SpleenAbdomen:${drpSpleenAbdomen}@@SoundAbdomen:${drpBowelSoundAbdomen}@@Remarks:${remarks}`;

    if (stat == 0) {
      AbdomenSystemInsert(personUUID, phnNo, encounterUUID, str);
    } else if (stat == 1) {
      AbdomenSystemUpdate(str);
    }
  }
}

function AbdomenSystemInsert(personUUID, phnNo, encounterUUID, str) {
  //=========== Get/Set Abdomen System Concept UUID =============================
  var uuidOfAbdomenSystemConcept = "";

  $.ajax({
    url: '/openmrs/ws/rest/v1/concept?name=Abdomen System',
    type: 'GET',
    dataType: 'json',
    async: false,
    data: {},
    headers: {
      'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
      'Content-Type': 'application/json'
    },
    success: function (data) {

      uuidOfAbdomenSystemConcept = data.results[0].uuid;
    }
  });

  //=========== Save Abdomen System to Observation =============================
  var raw = JSON.stringify({ "person": personUUID, "comment": phnNo, "concept": uuidOfAbdomenSystemConcept, "encounter": encounterUUID, "obsDatetime": (new Date()).toISOString(), "value": `AbdomenSystem:: ${str}` });

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
        message: 'Abdomen System Data Saved Successfully!',
        position: 'topRight'
      });
    }
  });
}

function AbdomenSystemUpdate(str) {

  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Cookie", "JSESSIONID=56AEC369713B93BCB5B9BC7B34AA6E5F");

  var raw = JSON.stringify({ "value": `AbdomenSystem:: ${str}` });

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  fetch("/openmrs/ws/rest/v1/obs/" + abdomenSystemObsUuid, requestOptions)
    .then(response => response.json())
    .then(result => {
      console.log(result);
    })
    .catch(error => console.log('error', error));

}

//=================================================================================

$('#btnSaveOtherSystem').on('click', function () {
  var $this = $(this);
  $this.attr('disabled', true);

  var phnNo = $('#txtPhnNo').val();
  var personUUID = $('#txtPersonUUID').val();
  var encounterUUID = $('#txtEncounterUUID').val();

  if (phnNo == "" || phnNo == null) {

    iziToast.error({
      title: 'Error',
      message: 'Phn Can\'t be empty!',
      position: 'topRight'
    });

    $this.attr('disabled', false);

    return;
  }

  otherSystemsSave(phnNo, personUUID, encounterUUID);
});

function otherSystemsSave(phnNo, personUUID, encounterUUID) {

  var txtCNS = $('#txtCNS').val();
  var LocomotorSystem = $('#txtLocomotorSystem').val();
  var Genitourinary = $('#txtGenitourinary').val();
  var Other = $('#txtOther').val();

  if (txtCNS == "" && LocomotorSystem == "" && Genitourinary == "" && Other == "") {

  } else {

    var str = `CNS:${txtCNS}@@LiverAbdomen:${LocomotorSystem}@@Genitourinary:${Genitourinary}@@Other:${Other}`;

    if (stat == 0) {
      OtherSystemsInsert(personUUID, phnNo, encounterUUID, str);
    } else if (stat == 1) {
      OtherSystemsUpdate(str);
    }
  }
}

function OtherSystemsInsert(personUUID, phnNo, encounterUUID, str) {
  //=========== Get/Set Other System Concept UUID =============================
  var uuidOfOtherSystemsConcept = "";

  $.ajax({
    url: '/openmrs/ws/rest/v1/concept?name=Other Systems',
    type: 'GET',
    dataType: 'json',
    async: false,
    data: {},
    headers: {
      'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
      'Content-Type': 'application/json'
    },
    success: function (data) {

      uuidOfOtherSystemsConcept = data.results[0].uuid;
    }
  });

  //=========== Save Other System to Observation =============================
  var raw = JSON.stringify({ "person": personUUID, "comment": phnNo, "concept": uuidOfOtherSystemsConcept, "encounter": encounterUUID, "obsDatetime": (new Date()).toISOString(), "value": `OtherSystem:: ${str}` });

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
        message: 'Other Systems Data Saved Successfully!',
        position: 'topRight'
      });
    }
  });
}

function OtherSystemsUpdate(str) {

  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Cookie", "JSESSIONID=56AEC369713B93BCB5B9BC7B34AA6E5F");

  var raw = JSON.stringify({ "value": `OtherSystem:: ${str}` });

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  fetch("/openmrs/ws/rest/v1/obs/" + otherSystemsObsUuid, requestOptions)
    .then(response => response.json())
    .then(result => {
      console.log(result);
    })
    .catch(error => console.log('error', error));

}

//=================================================================================

$('#btnSavePregnancyDetails').on('click', function () {
  var $this = $(this);
  $this.attr('disabled', true);

  var phnNo = $('#txtPhnNo').val();
  var personUUID = $('#txtPersonUUID').val();
  var encounterUUID = $('#txtEncounterUUID').val();

  if (phnNo == "" || phnNo == null) {

    iziToast.error({
      title: 'Error',
      message: 'Phn Can\'t be empty!',
      position: 'topRight'
    });

    $this.attr('disabled', false);

    return;
  }

  pregnancyDetailsSave(phnNo, personUUID, encounterUUID);
});

function pregnancyDetailsSave(phnNo, personUUID, encounterUUID) {

  var LastMenstrualDate = $('#txtLastMenstrualDate').val();
  var PregnancyStatus = $('#drpPregnancyStatus').val();
  var NoOfWeeks = $('#txtNoOfWeeks').val();
  if (LastMenstrualDate == "") {
    return;
  }

  var str = `LastMenstrualDate:${LastMenstrualDate}@@PregnancyStatus:${PregnancyStatus}@@NoOfWeeks:${NoOfWeeks}`;

  if (stat == 0) {

    PregnancyDetailsInsert(personUUID, phnNo, encounterUUID, str);
  } else if (stat == 1) {
    PregnancyDetailsUpdate(str);
  }
}

function PregnancyDetailsInsert(personUUID, phnNo, encounterUUID, str) {
  //=========== Get/Set Pregnancy Details Concept UUID =============================
  var uuidOfPregnancyDetailsConcept = "";

  $.ajax({
    url: '/openmrs/ws/rest/v1/concept?name=Pregnancy Details',
    type: 'GET',
    dataType: 'json',
    async: false,
    data: {},
    headers: {
      'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
      'Content-Type': 'application/json'
    },
    success: function (data) {

      uuidOfPregnancyDetailsConcept = data.results[0].uuid;
    }
  });

  //=========== Save Pregnancy Details to Observation =============================
  var raw = JSON.stringify({ "person": personUUID, "comment": phnNo, "concept": uuidOfPregnancyDetailsConcept, "encounter": encounterUUID, "obsDatetime": (new Date()).toISOString(), "value": `PregnancyDetails:: ${str}` });

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
        message: 'Pregnancy Details Data Saved Successfully!',
        position: 'topRight'
      });
    }
  });
}

function PregnancyDetailsUpdate(str) {

  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Cookie", "JSESSIONID=56AEC369713B93BCB5B9BC7B34AA6E5F");

  var raw = JSON.stringify({ "value": `PregnancyDetails:: ${str}` });

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  fetch("/openmrs/ws/rest/v1/obs/" + pregnancyDetailsObsUuid, requestOptions)
    .then(response => response.json())
    .then(result => {
      console.log(result);
    })
    .catch(error => console.log('error', error));

}


//-------------------------------------------------------------------------------------------------------------------


$('#btnSaveLabTests').on('click', function () {
  var $this = $(this);
  $this.attr('disabled', true);

  var phnNo = $('#txtPhnNo').val();
  var personUUID = $('#txtPersonUUID').val();
  var encounterUUID = $('#txtEncounterUUID').val();

  if (phnNo == "" || phnNo == null) {

    iziToast.error({
      title: 'Error',
      message: 'Phn Can\'t be empty!',
      position: 'topRight'
    });

    $this.attr('disabled', false);

    return;
  }

  labTestSave(phnNo, personUUID, encounterUUID);
});

function labTestSave(phnNo, personUUID, encounterUUID) {

  if ($('#labTestTbody tr').length != 0) {

    var cby = userUuid();

    var selected = new Array();
    $('#labTestTbody tr').each(function () {
      var Tests = $(this).find('td:nth-child(1)').attr('attr-uuid');
      var Priority = $(this).find('td:nth-child(2)').text();
      var Laboratory = $(this).find('td:nth-child(3)').attr('attr-uuid');
      if (Laboratory == "null") {
        Laboratory = "";
      }
      var SpecialNotes = $(this).find('td:nth-child(4)').text();
      var AntibioticGiven = $(this).find('td:nth-child(5)').text();
      var AntibioticDetails = $(this).find('td:nth-child(6)').text();
      var serialX = $(this).find('td:nth-child(8)').text();
      selected.push([Tests, Priority, Laboratory, SpecialNotes, AntibioticGiven, AntibioticDetails, serialX]);
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
        encounterUUID: encounterUUID,
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

LoadTests();
function LoadTests() {
  var uuidOfLabInvestigationsConcept = "";

  $.ajax({
    url: '/openmrs/ws/rest/v1/concept?name=Lab Investigations',
    type: 'GET',
    dataType: 'json',
    async: false,
    data: {},
    headers: {
      'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
      'Content-Type': 'application/json'
    },
    success: function success(data) {
      uuidOfLabInvestigationsConcept = data.results[0].uuid;
    }
  });

  $.ajax({
    url: '/openmrs/ws/rest/v1/concept/' + uuidOfLabInvestigationsConcept,
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
      option += '<option value="" selected disabled>--- Please Select ---</option>';
      $(data.setMembers).each(function (key, val) {

        var value = val.display.split("@@")[3];
        option += '<option attr-uuid="' + val.display + '" value="' + val.uuid + '">' + value + '</option>';
      });

      $('#drpTestLabTest').html("");
      $('#drpTestLabTest').html(option);

      $('#drpTestLabTest').select2({
        dropdownAutoWidth: true,
        width: '100%'
      });
    }
  });
}

LoadLaboratoriesForInstituteFunc();
function LoadLaboratoriesForInstituteFunc() {

  $.ajax({
    url: returnUrl() + '/LoadDifSectionsForInstitute',
    type: "POST",
    dataType: "json",
    async: false,
    data: { InstituteUuid: instituteUuid(), type: 'Laboratory' },
    success: function (data) {

      var options = "";
      options += "<option disabled selected value=\"\">--Select--</option>";
      $(data).each(function (key, val) {
        options += "<option value='" + val.uuid + "'>" + (val.name) + "</option>";
      });

      $('#drpLaboratoryLabTest').html("");
      $('#drpLaboratoryLabTest').html(options);

      $('#drpLaboratoryLabTest').select2({
        dropdownAutoWidth: true,
        width: '100%'
      });
    }
  });
}

$('#btnAddLabTest').on('click', function () {

  var drpTestLabTestValue = $('#drpTestLabTest').val();
  var drpTestLabTest = $('#drpTestLabTest option:selected').text();
  var drpPriorityLabTest = $('#drpPriorityLabTest').val();
  var drpLaboratoryLabTestValue = $('#drpLaboratoryLabTest').val();
  var drpLaboratoryLabTest = "";
  if (drpLaboratoryLabTestValue == "" || drpLaboratoryLabTestValue == null) {
  } else {
    drpLaboratoryLabTest = $('#drpLaboratoryLabTest option:selected').text();
  }
  var txtSpecialNotesLabTest = $('#txtSpecialNotesLabTest').val();
  var drpAntibioticGivenLabTest = $('#drpAntibioticGivenLabTest').val();
  var txtAntibioticDetails = $('#txtAntibioticDetails').val();

  var tr = "";
  tr += "<tr>";
  tr += "<td attr-uuid='" + drpTestLabTestValue + "'>" + drpTestLabTest + "</td>";
  tr += "<td>" + drpPriorityLabTest + "</td>";
  tr += "<td attr-uuid='" + drpLaboratoryLabTestValue + "'>" + drpLaboratoryLabTest + "</td>";
  tr += "<td>" + txtSpecialNotesLabTest + "</td>";
  tr += "<td>" + drpAntibioticGivenLabTest + "</td>";
  if (txtAntibioticDetails != null) {
    tr += "<td>" + txtAntibioticDetails + "</td>";
  } else {
    tr += "<td></td>";
  }
  tr += '<td class="text-center"><span class="fa fa-close deleteLabTestRow" style="color: red;"></span></td>';
  tr += "<td style='display: none;'>0</td>";
  tr += "</tr>";

  $('#labTestTbody').append(tr);
});

$('#btnSaveTestGroupLabTest').on('click', function () {
  if ($('#labTestTbody tr').length != 0) {

    var cby = userUuid();

    var selected = new Array();
    $('#labTestTbody tr').each(function () {
      var Tests = $(this).find('td:nth-child(1)').attr('attr-uuid');
      var Priority = $(this).find('td:nth-child(2)').text();
      var Laboratory = $(this).find('td:nth-child(3)').attr('attr-uuid');
      if (Laboratory == "null") {
        Laboratory = "";
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
      unit = availableUnitForUser(cby, insuuid)[0];
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

        $('#txtTestGroupName').val("");

        loadSavedTestGroups();
      }
    });
  }
});

loadSavedTestGroups();
function loadSavedTestGroups() {

  var cby = userUuid();
  var insUUid = instituteUuid();
  var unit = availableUnitForUser(cby, insUUid)[0];

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
      options += "<option disabled selected value=''>--Select--</option>";
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

        var testName = "";
        $.ajax({
          url: '/openmrs/ws/rest/v1/concept/' + val.tests,
          type: 'GET',
          dataType: 'json',
          async: false,
          data: {},
          headers: {
            'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
            'Content-Type': 'application/json'
          },
          success: function success(data) {
            testName = data.display.split("@@")[3];
          }
        });

        var labName = "";
        if (val.laboratory != null) {
          $.ajax({
            url: '/openmrs/ws/rest/v1/concept/' + val.laboratory,
            type: 'GET',
            dataType: 'json',
            async: false,
            data: {},
            headers: {
              'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
              'Content-Type': 'application/json'
            },
            success: function success(data) {
              labName = data.display.split("@@")[3];
            }
          });
        }

        tr += "<td>" + testName + "</td>";
        tr += "<td>" + val.priority + "</td>";
        tr += "<td>" + labName + "</td>";
        tr += "<td>" + val.specialnotes + "</td>";
        tr += "<td>" + val.antibioticgiven + "</td>";
        if (val.antibioticdetails != null) {
          tr += "<td>" + val.antibioticdetails + "</td>";
        } else {
          tr += "<td></td>";
        }
        tr += '<td class="text-center"><span class="fa fa-close deleteLabTestRow" style="color: red;"></span></td>';
        tr += "</tr>";
      });

      $('#labTestTbody').html("");
      $('#labTestTbody').html(tr);
    }
  });

});

$(document).on('click', '.deleteLabTestRow', function () {

  var serial = $(this).parents('tr').find('td:nth-child(8)').text();
  $(this).parents('tr').remove();
});

//=================================================================================

$('#btnSaveRadiologyTests').on('click', function () {
  var $this = $(this);
  $this.attr('disabled', true);

  var phnNo = $('#txtPhnNo').val();
  var personUUID = $('#txtPersonUUID').val();
  var encounterUUID = $('#txtEncounterUUID').val();

  if (phnNo == "" || phnNo == null) {

    iziToast.error({
      title: 'Error',
      message: 'Phn Can\'t be empty!',
      position: 'topRight'
    });

    $this.attr('disabled', false);

    return;
  }

  radiologySave(phnNo, personUUID, encounterUUID);
});

function radiologySave(phnNo, personUUID, encounterUUID) {

  if ($('#radiologyTbody tr').length != 0) {

    var cby = userUuid();

    var selected = new Array();
    $('#radiologyTbody tr').each(function () {
      var Test = $(this).find('td:nth-child(1)').attr('attr-uuid');
      var Region = $(this).find('td:nth-child(2)').attr('attr-uuid');
      var Localization = $(this).find('td:nth-child(3)').attr('attr-uuid');
      var Position = $(this).find('td:nth-child(4)').attr('attr-uuid');
      var Comments = $(this).find('td:nth-child(5)').text();
      var Priority = $(this).find('td:nth-child(6)').text();
      var serialX = $(this).find('td:nth-child(8)').text();
      selected.push([Test, Region, Localization, Position, Comments, Priority, serialX]);
    });

    $.ajax({
      url: returnUrl() + '/SaveRadiology',
      type: 'POST',
      dataType: 'json',
      async: false,
      data: {
        phnNo: phnNo,
        encounterUUID: encounterUUID,
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

LoadRadiologyInvestigationTestsFunc();
function LoadRadiologyInvestigationTestsFunc() {

  $.ajax({
    url: returnUrl() + '/LoadRadiologyInvestigationTests',
    type: "POST",
    dataType: "json",
    async: false,
    data: { InstituteUuid: instituteUuid() },
    success: function (data) {

      var options = "";
      options += "<option disabled selected value=''>--Select--</option>";
      $(data).each(function (key, val) {

        var name = (val.name).split("@@")[1];

        options += "<option value='" + val.conceptuuid + "'>" + name + "</option>";
      });

      $('#drpTestsRadiology').html("");
      $('#drpTestsRadiology').html(options);

      $('#drpTestsRadiology').select2({
        dropdownAutoWidth: true,
        width: '100%'
      });
    }
  });
}

$('#drpTestsRadiology').on('change', function () {
  var valueUuid = $(this).val();

  $.ajax({
    url: '/openmrs/ws/rest/v1/concept/' + valueUuid,
    type: 'GET',
    dataType: 'json',
    async: false,
    data: {},
    headers: {
      'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
      'Content-Type': 'application/json'
    },
    success: function success(data) {

      var array1 = [];
      var array2 = [];
      var array3 = [];

      var optionsRegion = "";
      var optionsLocalization = "";
      var optionsPosition = "";

      optionsRegion += "<option disabled selected value=''>--Select--</option>";
      optionsLocalization += "<option disabled selected value=''>--Select--</option>";
      optionsPosition += "<option disabled selected value=''>--Select--</option>";

      $(data.display.split("@@")[3].split("###")).each(function (k, v) {
        var regionUuid = v.split("^^^")[0];
        var localizationUuid = v.split("^^^")[1];
        var positionUuid = v.split("^^^")[2];

        $.ajax({
          url: '/openmrs/ws/rest/v1/concept/' + regionUuid,
          type: 'GET',
          dataType: 'json',
          async: false,
          data: {},
          headers: {
            'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
            'Content-Type': 'application/json'
          },
          success: function success(data) {
            if (!array1.includes(data.display)) {
              array1.push(data.display);
              optionsRegion += "<option value='" + regionUuid + "'>" + data.display + "</option>";
            }
          }
        });

        $.ajax({
          url: '/openmrs/ws/rest/v1/concept/' + localizationUuid,
          type: 'GET',
          dataType: 'json',
          async: false,
          data: {},
          headers: {
            'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
            'Content-Type': 'application/json'
          },
          success: function success(data) {
            if (!array2.includes(data.display)) {
              array2.push(data.display);
              optionsLocalization += "<option value='" + localizationUuid + "'>" + data.display + "</option>";
            }
          }
        });

        $.ajax({
          url: '/openmrs/ws/rest/v1/concept/' + positionUuid,
          type: 'GET',
          dataType: 'json',
          async: false,
          data: {},
          headers: {
            'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
            'Content-Type': 'application/json'
          },
          success: function success(data) {
            if (!array3.includes(data.display)) {
              array3.push(data.display);
              optionsPosition += "<option value='" + positionUuid + "'>" + data.display + "</option>";
            }
          }
        });


      });

      $('#drpRegionRadiology').html("");
      $('#drpRegionRadiology').html(optionsRegion);

      $('#drpRegionRadiology').select2({
        dropdownAutoWidth: true,
        width: '100%'
      });

      $('#drpLocalizationRadiology').html("");
      $('#drpLocalizationRadiology').html(optionsLocalization);

      $('#drpLocalizationRadiology').select2({
        dropdownAutoWidth: true,
        width: '100%'
      });

      $('#drpPositionRadiology').html("");
      $('#drpPositionRadiology').html(optionsPosition);

      $('#drpPositionRadiology').select2({
        dropdownAutoWidth: true,
        width: '100%'
      });
    }
  });

});

$('#btnAddRadiology').on('click', function () {

  var drpTestsRadiologyVal = $('#drpTestsRadiology').val();
  var drpTestsRadiology = $('#drpTestsRadiology option:selected').text();
  var drpRegionRadiologyVal = $('#drpRegionRadiology').val();
  var drpRegionRadiology = ($('#drpRegionRadiology option:selected').text() == "--Select--") ? "" : $('#drpRegionRadiology option:selected').text();
  var drpLocalizationRadiologyVal = $('#drpLocalizationRadiology').val();
  var drpLocalizationRadiology = ($('#drpLocalizationRadiology option:selected').text() == "--Select--") ? "" : $('#drpLocalizationRadiology option:selected').text();
  var drpPositionRadiologyVal = $('#drpPositionRadiology').val();
  var drpPositionRadiology = ($('#drpPositionRadiology option:selected').text() == "--Select--") ? "" : $('#drpPositionRadiology option:selected').text();
  var txtCommentRadiology = $('#txtCommentRadiology').val();
  var drpPriorityRadiology = $('#drpPriorityRadiology').val();

  var tr = "";
  tr += "<tr>";
  tr += "<td attr-uuid='" + drpTestsRadiologyVal + "'>" + drpTestsRadiology + "</td>";
  tr += "<td attr-uuid='" + drpRegionRadiologyVal + "'>" + drpRegionRadiology + "</td>";
  tr += "<td attr-uuid='" + drpLocalizationRadiologyVal + "'>" + drpLocalizationRadiology + "</td>";
  tr += "<td attr-uuid='" + drpPositionRadiologyVal + "'>" + drpPositionRadiology + "</td>";
  tr += "<td>" + txtCommentRadiology + "</td>";
  tr += "<td>" + drpPriorityRadiology + "</td>";
  tr += '<td class="text-center"><span class="fa fa-close deleteRowRadiology" style="color: red;"></span></td>';
  tr += "<td style='display: none;'>0</td>";
  tr += "</tr>";

  $('#radiologyTbody').append(tr);
});

$(document).on('click', '.deleteRowRadiology', function () {

  var serial = $(this).parents('tr').find('td:nth-child(8)').text();
  $(this).parents('tr').remove();
});

//=================================================================================

$('#btnSavePrescribingTests').on('click', function () {
  var $this = $(this);
  $this.attr('disabled', true);

  var phnNo = $('#txtPhnNo').val();
  var personUUID = $('#txtPersonUUID').val();
  var encounterUUID = $('#txtEncounterUUID').val();

  if (phnNo == "" || phnNo == null) {

    iziToast.error({
      title: 'Error',
      message: 'Phn Can\'t be empty!',
      position: 'topRight'
    });

    $this.attr('disabled', false);

    return;
  }

  prescribingSave(phnNo, personUUID, encounterUUID);
});

function prescribingSave(phnNo, personUUID, encounterUUID) {

  if ($('#drugPrescribingTbody tr').length != 0) {

    var cby = userUuid();

    var selected = new Array();
    $('#drugPrescribingTbody tr').each(function () {
      var Drug = $(this).find('td:nth-child(1)').attr('attr-uuid');
      var Dose = $(this).find('td:nth-child(2)').attr('attr-uuid');
      var Frequency = $(this).find('td:nth-child(3)').attr('attr-uuid');
      var DoseComment = $(this).find('td:nth-child(4)').text();
      var Period = $(this).find('td:nth-child(5)').text();
      var Pharmacy = $(this).find('td:nth-child(6)').text();
      var Strength = $(this).attr('attr-strength');
      var serialX = $(this).find('td:nth-child(8)').text();
      selected.push([Drug, Dose, Frequency, DoseComment, Period, Pharmacy, Strength, serialX]);
    });

    $.ajax({
      url: returnUrl() + '/SavePrescribing',
      type: 'POST',
      dataType: 'json',
      async: false,
      data: {
        phnNo: phnNo,
        encounterUUID: encounterUUID,
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

LoadAvailableDrugsFunc();
function LoadAvailableDrugsFunc() {

  $.ajax({
    url: returnUrl() + '/LoadAvailableDrugs',
    type: "POST",
    dataType: "json",
    async: false,
    data: {},
    success: function (data) {

      var array = [];
      var options = "";
      options += "<option disabled selected value=''>--Select--</option>";
      $(data).each(function (key, val) {
        $(val.fullStr.split('@@')[9].split('###')).each(function (k, v) {
          var strength = v.split('^^^')[0];
          if (!array.includes(`(${val.genericname}-${val.brandname}) - ${strength}`)) {
            array.push(`(${val.genericname}-${val.brandname}) - ${strength}`);
            options += `<option value='${val.conceptuuid}' attr-strength='${strength}' attr-qty='${val.totalqty}'>(${val.genericname}-${val.brandname}) - ${strength}</option>`;
          }
        });
      });

      $('#drpDrugNameAvaiable').html("");
      $('#drpDrugNameAvaiable').html(options);

      $('#drpDrugNameAvaiable').select2({
        dropdownAutoWidth: true,
        width: '100%',
        templateResult: function (option, container) {
          if ($(option.element).attr("attr-qty") == "0.00") {
            $(container).css({ "background": "rgb(255 158 158)" }).attr('title', 'Stock Qty is 0');
          }
          return option.text;
        }
      });
    }
  });

}

$('#drpDrugNameAvaiable').on('change', function () {

  var conceptUuid = $(this).val();

  $.ajax({
    url: '/openmrs/ws/rest/v1/concept/' + conceptUuid,
    type: "GET",
    dataType: "json",
    data: {},
    success: function (data) {

      var options = "";
      options += "<option disabled selected value=''>--Select--</option>";
      $(data.display.split("@@")[9].split("###")).each(function (key, val) {
        options += "<option>" + val.split("^^^")[1] + "</option>";
      });

      $('#drpDose').html("");
      $('#drpDose').html(options);

      $('#drpDose').select2({
        dropdownAutoWidth: true,
        width: '100%',
      });
    }
  });

});

LoadFrequenciesFunc();
function LoadFrequenciesFunc() {

  var uuidOfConcept = "";

  $.ajax({
    url: '/openmrs/ws/rest/v1/concept?name=Drugs Frequency',
    type: 'GET',
    dataType: 'json',
    async: false,
    data: {},
    headers: {
      'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
      'Content-Type': 'application/json'
    },
    success: function success(data) {

      uuidOfConcept = data.results[0].uuid;
    }
  });

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

      var options = "";
      options += "<option disabled value='' selected>--Select--</option>";
      $(data.setMembers).each(function (key, val) {

        options += "<option value='" + val.uuid + "'>" + val.display.split("@@")[1] + "</option>";
      });

      $('#drpFrequency').html("");
      $('#drpFrequency').html(options);
    }
  });

}

$('#addToTablePrescribing').on('click', function () {

  var drpDrugNameAvaiableValue = $('#drpDrugNameAvaiable').val();
  var drpDrugNameAvaiableText = $('#drpDrugNameAvaiable option:selected').text();
  var drpDoseValue = $('#drpDose').val();
  var drpDoseText = ($('#drpDose option:selected').text() == "--Select--") ? "" : $('#drpDose option:selected').text();
  var drpFrequencyValue = $('#drpFrequency').val();
  var drpFrequencyText = ($('#drpFrequency option:selected').text() == "--Select--") ? "" : $('#drpFrequency option:selected').text();
  var txtDoseComment = $('#txtDoseComment').val();
  var txtPeriodPrescribing = $('#txtPeriodPrescribing').val();
  var drpPharmacy = $('#drpPharmacy').val();
  var drugStrength = $('#drpDrugNameAvaiable option:selected').attr('attr-strength');

  var tr = "";
  tr += `<tr attr-strength = '${drugStrength}'>`;
  tr += "<td attr-uuid='" + drpDrugNameAvaiableValue + "'>" + drpDrugNameAvaiableText + "</td>";
  tr += "<td attr-uuid='" + drpDoseValue + "'>" + drpDoseText + "</td>";
  tr += "<td attr-uuid='" + drpFrequencyValue + "'>" + drpFrequencyText + "</td>";
  tr += "<td>" + txtDoseComment + "</td>";
  tr += "<td>" + txtPeriodPrescribing + "</td>";
  tr += "<td>" + drpPharmacy + "</td>";
  tr += '<td class="text-center"><span class="fa fa-close deletePrescribeRow" style="color: red;"></span></td>';
  tr += "<td style='display: none;'>0</td>";
  tr += "</tr>";

  $('#drugPrescribingTbody').append(tr);
  $('.drugrow').val("");
  $('#drpDrugNameAvaiable').val("").trigger('change.select2');
  $('#drpDose').val("").trigger('change.select2');
});

$('#btnSaveTestGroupPrescribing').on('click', function () {
  if ($('#drugPrescribingTbody tr').length != 0) {

    var cby = userUuid();

    var selected = new Array();
    $('#drugPrescribingTbody tr').each(function () {
      var Drug = $(this).find('td:nth-child(1)').attr('attr-uuid');
      var Dose = $(this).find('td:nth-child(2)').attr('attr-uuid');
      var Frequency = $(this).find('td:nth-child(3)').attr('attr-uuid');
      var DoseComment = $(this).find('td:nth-child(4)').text();
      var Period = $(this).find('td:nth-child(5)').text();
      var Pharmacy = $(this).find('td:nth-child(6)').text();
      var Strength = $(this).attr('attr-strength');
      selected.push([Drug, Dose, Frequency, DoseComment, Period, Pharmacy, Strength]);
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
      unit = availableUnitForUser(cby, insuuid)[0];
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

        $('#txtTestGroupNamePrescribing').val("");

      }, complete: function () {
        loadSavedDrugGroups()
      }
    });
  }
});

loadSavedDrugGroupsFunc()
function loadSavedDrugGroupsFunc() {

  var cby = userUuid();
  var insUUid = instituteUuid();
  var unit = availableUnitForUser(cby, insUUid)[0];

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
      options += "<option disabled selected value=''>--Select--</option>";
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

        var drugName = "";
        $.ajax({
          url: '/openmrs/ws/rest/v1/concept/' + val.drug,
          type: 'GET',
          dataType: 'json',
          async: false,
          data: {},
          headers: {
            'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
            'Content-Type': 'application/json'
          },
          success: function success(data) {
            drugName = data.display.split("@@")[1] + "-" + data.display.split("@@")[2];
          }
        });

        var frequencyName = "";
        $.ajax({
          url: '/openmrs/ws/rest/v1/concept/' + val.frequency,
          type: 'GET',
          dataType: 'json',
          async: false,
          data: {},
          headers: {
            'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
            'Content-Type': 'application/json'
          },
          success: function success(data) {
            frequencyName = data.display.split("@@")[1];
          }
        });

        tr += "<td>" + drugName + "</td>";
        tr += "<td>" + val.dose + "</td>";
        tr += "<td>" + frequencyName + "</td>";
        tr += "<td>" + val.dosecomment + "</td>";
        tr += "<td>" + val.period + "</td>";
        tr += "<td>" + val.pharmacy + "</td>";
        tr += '<td class="text-center"><span class="fa fa-close deleteDrugGroupsDataRow" style="color: red; font-size: 20px;"></span></td>';
        tr += "<td style='display: none;'>" + val.druggroupid + "</td>";
        tr += "</tr>";
      });

      $('#drugPrescribingTbody').html("");
      $('#drugPrescribingTbody').html(tr);
    }
  });

});

$(document).on('click', '.deleteDrugGroupsDataRow', function () {

  var serial = $(this).parents('tr').find('td:nth-child(8)').text();
  $(this).parents('tr').remove();
});

//=================================================================================

$('#btnSaveTreatmentsAndProcedures').on('click', function () {
  var $this = $(this);
  $this.attr('disabled', true);

  var phnNo = $('#txtPhnNo').val();
  var personUUID = $('#txtPersonUUID').val();
  var encounterUUID = $('#txtEncounterUUID').val();

  if (phnNo == "" || phnNo == null) {

    iziToast.error({
      title: 'Error',
      message: 'Phn Can\'t be empty!',
      position: 'topRight'
    });

    $this.attr('disabled', false);

    return;
  }

  proceduresSave(phnNo, personUUID, encounterUUID);
});

function proceduresSave(phnNo, personUUID, encounterUUID) {

  if ($('#procedurestbody tr').length != 0) {

    var cby = userUuid();

    var selected = new Array();
    $('#procedurestbody tr').each(function () {
      var procedureType = $(this).find('td:nth-child(1)').attr('attr-uuid');
      var Injection = $(this).find('td:nth-child(2)').attr('attr-uuid');
      var Remarks = $(this).find('td:nth-child(3)').text();
      var Type = $(this).find('td:nth-child(4)').text();
      var serialX = $(this).find('td:nth-child(6)').text();
      selected.push([procedureType, Injection, Remarks, Type, serialX]);
    });

    $.ajax({
      url: returnUrl() + '/SaveProcedures',
      type: 'POST',
      dataType: 'json',
      async: false,
      data: {
        phnNo: phnNo,
        encounterUUID: encounterUUID,
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

loadProcedureTypes();
function loadProcedureTypes() {

  fetch(returnUrl() + '/LoadProcedureTypes', {
    method: 'POST',
  })
    .then(response => response.json())
    .then(result => {

      var options = "";
      options += "<option disabled selected value=''>--Select--</option>";
      $(result).each(function (key, val) {
        options += "<option value='" + val.proceduretypeid + "'>" + (val.proceduretype) + "</option>";
      });

      $('#drpProcedureType').html("");
      $('#drpProcedureType').html(options);

    }).catch(error => console.log('error', error));
}

loadInjections();
function loadInjections() {

  $.ajax({
    url: returnUrl() + "/LoadInjectionsForInstitute",
    type: 'POST',
    dataType: 'json',
    async: false,
    data: { InstituteUuid: InstituteUuid },
    success: function (data) {

      var options = "";
      options += "<option selected value=''>--Select--</option>";
      $(data).each(function (key, val) {

        var name = `${val.name.split("@@")[1]} - ${val.name.split("@@")[2]}`;
        options += "<option attr-val='" + val.name + "' value='" + val.uuid + "'>" + name + "</option>";
      });

      $('#drpInjectionsProcedures').html("");
      $('#drpInjectionsProcedures').html(options);

      $('#drpInjectionsProcedures').select2({
        dropdownAutoWidth: true,
        width: '100%'
      });
    }
  });

}

$('#btnAddTreatmentsProcedure').on('click', function () {

  var drpProcedureType = $('#drpProcedureType').val();
  var drpProcedureTypeText = $('#drpProcedureType option:selected').text();
  var drpInjectionsProcedures = $('#drpInjectionsProcedures').val();
  var drpInjectionsProceduresText = ($('#drpInjectionsProcedures option:selected').text() == "--Select--") ? "" : $('#drpInjectionsProcedures option:selected').text()
  var txtRemarksProcedures = $('#txtRemarksProcedures').val();
  var drpTypeProcedures = $('#drpTypeProcedures').val();

  var tr = "";
  tr += `<tr>`;
  tr += "<td attr-uuid='" + drpProcedureType + "'>" + drpProcedureTypeText + "</td>";
  tr += "<td attr-uuid='" + drpInjectionsProcedures + "'>" + drpInjectionsProceduresText + "</td>";
  tr += "<td>" + txtRemarksProcedures + "</td>";
  tr += "<td>" + drpTypeProcedures + "</td>";
  tr += '<td class="text-center"><span class="fa fa-close deleteProcRow" style="color: red;"></span></td>';
  tr += "<td style='display: none;'>0</td>";
  tr += "</tr>";

  $('#procedurestbody').append(tr);
  $('.procrow').val("");
  $('#drpProcedureType').val("").trigger('change.select2');
  $('#drpInjectionsProcedures').val("").trigger('change.select2');
});

//=================================================================================

$('#btnSaveWardReferral').on('click', function () {
  var $this = $(this);
  $this.attr('disabled', true);

  var phnNo = $('#txtPhnNo').val();
  var personUUID = $('#txtPersonUUID').val();
  var encounterUUID = $('#txtEncounterUUID').val();

  if (phnNo == "" || phnNo == null) {

    iziToast.error({
      title: 'Error',
      message: 'Phn Can\'t be empty!',
      position: 'topRight'
    });

    $this.attr('disabled', false);

    return;
  }

  wardReferralSave(phnNo, personUUID, encounterUUID);
});

function wardReferralSave(phnNo, personUUID, encounterUUID) {

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
        phnNo: phnNo, encounterUUID: encounterUUID, ward: drpWardWardReferral, wardRemarks: txtWardRemarks, cby: cby
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

LoadWardsForInstituteFunc();
function LoadWardsForInstituteFunc() {

  $.ajax({
    url: returnUrl() + '/LoadDifSectionsForInstitute',
    type: "POST",
    dataType: "json",
    async: false,
    data: { InstituteUuid: instituteUuid(), type: 'Ward' },
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

//-------------------------------------------

$('#btnSaveClinicReferral').on('click', function () {
  var $this = $(this);
  $this.attr('disabled', true);

  var phnNo = $('#txtPhnNo').val();
  var personUUID = $('#txtPersonUUID').val();
  var encounterUUID = $('#txtEncounterUUID').val();

  if (phnNo == "" || phnNo == null) {

    iziToast.error({
      title: 'Error',
      message: 'Phn Can\'t be empty!',
      position: 'topRight'
    });

    $this.attr('disabled', false);

    return;
  }

  clinicReferralSave(phnNo, personUUID, encounterUUID);
});

function clinicReferralSave(phnNo, personUUID, encounterUUID) {

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
        phnNo: phnNo, encounterUUID: encounterUUID, clinic: drpclinicReferral, clinicRemarks: txtClinicRemarks, cby: cby
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

LoadClinicsForInstituteFunc();
function LoadClinicsForInstituteFunc() {

  $.ajax({
    url: returnUrl() + '/LoadDifSectionsForInstitute',
    type: "POST",
    dataType: "json",
    async: false,
    data: { InstituteUuid: instituteUuid(), type: 'Clinic' },
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

//-------------------------------------------

$('#btnClear').on('click', function () {
  location.reload();
});


$('#btnOpenHistory').on('click', function () {
  var txtPhnNo = $('#txtPhnNo').val();
  var patientUuid = $('#patientUuid').val();
  window.open('/owa/patienthistorysingle/index.html?patientId=' + patientUuid + '&&phn=' + txtPhnNo);
});


$('#chkNotyInJSurSys').on('change', function () {
  if (this.checked) {
    $('#showHideDiv').show();
  } else {
    $('#showHideDiv').hide();
  }
});


$('#btnPrint').on('click', function () {

  $('#tdInsname').text($("#lblInstituteName").text());
  $('#tdPhn').text($('#txtPhnNo').val());
  $('#tdName').text($('#txtFullName').text());
  $('#tdAge').text($('#txtYears').text());
  $('#tdSex').text($('#txtGender').text());
  $('#tdContactNo').text(telNo);
  $('#tdDateOnSet').text($('#txtDateOfOnset').val());

  var curTime = $('#txtTimeOfInjury').val();

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

  var strArr = "";
  $('.chkW').each(function () {
    var chkThis = $(this);
    var idChk = chkThis.attr('id').split("chk")[1];

    if (chkThis.is(':checked')) {
      strArr += `${idChk}@@true,`;
      $(`.rowTd[attr-id="${idChk}"]`).html("");
      $(`.rowTd[attr-id="${idChk}"]`).html('<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Light_green_check.svg/600px-Light_green_check.svg.png" style="width: 12.3px !important; padding: 0px !important;">');
    } else {
      strArr += `${idChk}@@false,`;
    }
  });

  $('#txt28Span').text($('#txt28').val());
  $('#txt39Span').text($('#txt39').val());
  $('#txt49Span').text($('#txt49').val());
  $('#txt67Span').text($('#txt67').val());
  $('#txt99Span').text($('#txt99').val());

  var encounterUUID = $('#txtEncounterUUID').val();

  $.ajax({
    url: returnUrl() + '/SaveInjurySurveillance',
    type: 'POST',
    dataType: 'json',
    async: false,
    data: {
      phnNo: $('#txtPhnNo').val(), encounterUUID: encounterUUID, examinationaDate: $('#txtExaminationDate').val(),
      data: strArr.replace(/,\s*$/, ""), txt28: $('#txt28').val(), txt39: $('#txt39').val(),
      txt49: $('#txt49').val(), txt67: $('#txt67').val(), txt99: $('#txt99').val(), cby: userUuid(),
      time: curTime, dateonset: $('#txtDateOfOnset').val()
    },
    success: function (data) {

    }
  });

  var mywindow = window.open('', 'PRINT', 'height=400,width=600');

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

