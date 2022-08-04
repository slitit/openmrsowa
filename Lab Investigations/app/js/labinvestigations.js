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
    console.log('Lab Investigations OpenMRS Open Web App Started.');
  });
}());


getInstitute();
function getInstitute() {
  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
  myHeaders.append("Cookie", "JSESSIONID=2D158E83ACFB788998C7DB495F07C1B9");
  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };
  fetch("/openmrs/ws/rest/v1/session", requestOptions)
    .then(function (response) {
      return response.json();
    })
    .then(function (result) {
      var personuuid = result.user.person.uuid;

      var requestHeaders = new Headers();
      requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
      requestHeaders.append(
        "Cookie",
        "JSESSIONID=ED9DBD5CFD355A973EFFECD642D8331D"
      );
      var requestOptions = {
        method: "GET",
        headers: requestHeaders,
        redirect: "follow",
      };
      //person rest API
      fetch("/openmrs/ws/rest/v1/person/" + personuuid, requestOptions)
        .then(function (response) {
          return response.json();
        })
        .then(function (result) {

          var InstituteUuid = "";
          $(result.attributes).each(function (k, v) {
            if (v.display != null) {
              if ($.trim(v.display.split("=")[0]) == "Institute Id") {
                InstituteUuid = $.trim(v.display.split("=")[1]); //get the user's institute id
              }
            }
          });

          var requestHeaders = new Headers();
          requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
          requestHeaders.append(
            "Cookie",
            "JSESSIONID=24D0761924138ED7E55C2CB6806B0633"
          );

          var requestOptions = {
            method: "GET",
            headers: requestHeaders,
            redirect: "follow",
          };

          //location rest API
          fetch("/openmrs/ws/rest/v1/location/" + InstituteUuid, requestOptions)
            .then(function (response) {
              return response.json();
            })
            .then(function (result) {
              $(result.attributes).each(function (k, v) {

                if (v.display != null) {

                  var locationId = "";
                  if ($.trim(v.display.split(":")[0]) == "Location Id") {

                    locationId = $.trim(v.display.split(":")[1]);

                    var instituteName = result.display;

                    $('#institute_id').val(InstituteUuid);
                    $('#institute').val(instituteName);
                    $('#lblInstituteName').text(instituteName);
                  }
                }
              });
            })
            .catch(function (error) {
              return console.log("error", error);
            });
        })
        .catch(function (error) {
          return console.log("error", error);
        });
    })
    .catch(function (error) {
      return console.log("error", error);
    });
}


loadTestType();
function loadTestType() {

  var uuidOfTestTypeConcept = "";

  $.ajax({
    url: '/openmrs/ws/rest/v1/concept?name=Test Type',
    type: 'GET',
    dataType: 'json',
    async: false,
    data: {},
    headers: {
      'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
      'Content-Type': 'application/json'
    },
    success: function success(data) {

      uuidOfTestTypeConcept = data.results[0].uuid;
    }
  });

  $.ajax({
    url: '/openmrs/ws/rest/v1/concept/' + uuidOfTestTypeConcept,
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
        option += '<option value="' + val.uuid + '">' + val.display + '</option>';
      });

      $('#TestType').html("");
      $('#TestType').html(option);
    }
  });

}


$('#TestGroupSave').on('click', function () {

  var testGroupName = $('#testGroupName').val();

  if (testGroupName == "") {
    alert('Test Group Can\'t be Empty!');
    return;
  }

  //Get uuid Of Data Type
  var uuidOFDataType = "";
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
        if (val.display == 'Text') {
          uuidOFDataType = (val.uuid);
        }
      });
    },
    complete: function () {
      $('#testGroupName').val("");
    },
    error: function (data) {

      if (data.responseJSON.message == "Unable to invoke administrationService.validate(Object, Errors) via reflection") {
        iziToast.error({
          title: 'Error!',
          message: data.responseJSON.cause.cause.message,
          position: 'topRight'
        });
      }
    }
  });

  //Get uuid Of Concept Class
  var uuidOFConceptClass = "";
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
        if (val.display == 'Test Group') {
          uuidOFConceptClass = (val.uuid);
        }
      });
    },
    complete: function () {
      $('#testGroupName').val("");
    },
    error: function (data) {

      if (data.responseJSON.message == "Unable to invoke administrationService.validate(Object, Errors) via reflection") {
        iziToast.error({
          title: 'Error!',
          message: data.responseJSON.cause.cause.message,
          position: 'topRight'
        });
      }
    }
  });

  var raw = JSON.stringify({
    "names": [{ "name": testGroupName, "locale": "en", "localePreferred": true, "conceptNameType": "FULLY_SPECIFIED" }],
    "datatype": uuidOFDataType, "version": "1.2.2", "conceptClass": uuidOFConceptClass,
  });

  //Create Concept Test Group
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

  //Get Uuid Of Test Group Concept
  var uuidOfTestGroupConcept = "";
  $.ajax({
    url: '/openmrs/ws/rest/v1/concept?name=Test Group',
    type: 'GET',
    dataType: 'json',
    async: false,
    data: {},
    headers: {
      'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
      'Content-Type': 'application/json'
    },
    success: function success(data) {

      uuidOfTestGroupConcept = data.results[0].uuid;
    }
  });

  //Get Uuid Of Exising Members Of Test Group Concept
  var arrOfExistMembers = [];
  $.ajax({
    url: '/openmrs/ws/rest/v1/concept/' + uuidOfTestGroupConcept,
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

  var raw = JSON.stringify({ "setMembers": arrOfExistMembers });

  $.ajax({
    url: '/openmrs/ws/rest/v1/concept/' + uuidOfTestGroupConcept,
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
        message: 'Test Group Saved Successfully!',
        position: 'topRight'
      });

      $('#testGroupName').val("");

      loadTestGroup();
    }
  });
});


loadTestGroup();
function loadTestGroup() {

  var uuidOfTestGroupConcept = "";

  $.ajax({
    url: '/openmrs/ws/rest/v1/concept?name=Test Group',
    type: 'GET',
    dataType: 'json',
    async: false,
    data: {},
    headers: {
      'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
      'Content-Type': 'application/json'
    },
    success: function success(data) {

      uuidOfTestGroupConcept = data.results[0].uuid;
    }
  });

  $.ajax({
    url: '/openmrs/ws/rest/v1/concept/' + uuidOfTestGroupConcept,
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
        option += '<option value="' + val.uuid + '">' + val.display + '</option>';
      });

      $('#testGroup').html("");
      $('#testGroup').html(option);
    }
  });
}


$('#sampleTypeSave').on('click', function () {

  var specimanTypeName = $('#sampleTypeName').val();

  if (specimanTypeName == "") {
    alert('Speciman Type Name Can\'t be Empty!');
    return;
  }

  //Get uuid Of Data Type
  var uuidOFDataType = "";
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
        if (val.display == 'Text') {
          uuidOFDataType = (val.uuid);
        }
      });
    }
  });

  //Get uuid Of Concept Class
  var uuidOFConceptClass = "";
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
        if (val.display == 'Misc') {
          uuidOFConceptClass = (val.uuid);
        }
      });
    },
    complete: function () {
      $('#sampleTypeName').val("");
    },
    error: function (data) {

      if (data.responseJSON.message == "Unable to invoke administrationService.validate(Object, Errors) via reflection") {
        iziToast.error({
          title: 'Error!',
          message: data.responseJSON.cause.cause.message,
          position: 'topRight'
        });
      }
    }
  });

  var raw = JSON.stringify({
    "names": [{ "name": specimanTypeName, "locale": "en", "localePreferred": true, "conceptNameType": "FULLY_SPECIFIED" }],
    "datatype": uuidOFDataType, "version": "1.2.2", "conceptClass": uuidOFConceptClass,
  });

  //Create Concept Speciman Type
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
    },
    complete: function () {
      $('#sampleTypeName').val("");
    },
    error: function (data) {

      if (data.responseJSON.message == "Unable to invoke administrationService.validate(Object, Errors) via reflection") {
        iziToast.error({
          title: 'Error!',
          message: data.responseJSON.cause.cause.message,
          position: 'topRight'
        });
      }
    }
  });

  //Get Uuid Of Speciman Type Concept
  var uuidOfSpecimanTypeConcept = "";
  $.ajax({
    url: '/openmrs/ws/rest/v1/concept?name=Speciman Type',
    type: 'GET',
    dataType: 'json',
    async: false,
    data: {},
    headers: {
      'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
      'Content-Type': 'application/json'
    },
    success: function success(data) {

      uuidOfSpecimanTypeConcept = data.results[0].uuid;
    }
  });

  //Get Uuid Of Exising Members Of Speciman Type Concept
  var arrOfExistMembers = [];
  $.ajax({
    url: '/openmrs/ws/rest/v1/concept/' + uuidOfSpecimanTypeConcept,
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

  var raw = JSON.stringify({ "setMembers": arrOfExistMembers });

  $.ajax({
    url: '/openmrs/ws/rest/v1/concept/' + uuidOfSpecimanTypeConcept,
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
        message: 'Speciman Type Saved Successfully!',
        position: 'topRight'
      });

      $('#sampleTypeName').val("");

      loadSpecimanTypes();
    }
  });
});


loadSpecimanTypes();
function loadSpecimanTypes() {

  var uuidOfSpecimanTypeConcept = "";

  $.ajax({
    url: '/openmrs/ws/rest/v1/concept?name=Speciman Type',
    type: 'GET',
    dataType: 'json',
    async: false,
    data: {},
    headers: {
      'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
      'Content-Type': 'application/json'
    },
    success: function success(data) {
      uuidOfSpecimanTypeConcept = data.results[0].uuid;
    }
  });

  $.ajax({
    url: '/openmrs/ws/rest/v1/concept/' + uuidOfSpecimanTypeConcept,
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
        option += '<option value="' + val.uuid + '">' + val.display + '</option>';
      });

      $('#specimanTypes').html("");
      $('#specimanTypes').html(option);
    }
  });
}


loadLOINCCodes();
function loadLOINCCodes() {

  var uuidOfLOINCCodeConcept = "";

  $.ajax({
    url: '/openmrs/ws/rest/v1/concept?name=LOINC Codes',
    type: 'GET',
    dataType: 'json',
    async: false,
    data: {},
    headers: {
      'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
      'Content-Type': 'application/json'
    },
    success: function success(data) {
      uuidOfLOINCCodeConcept = data.results[0].uuid;
    }
  });

  $.ajax({
    url: '/openmrs/ws/rest/v1/concept/' + uuidOfLOINCCodeConcept,
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
        option += '<option value="' + val.uuid + '">' + val.display + '</option>';
      });

      $('#drpLOINCCodes').html("");
      $('#drpLOINCCodes').html(option);
    }
  });
}


$('#btnCancel').on('click', function (e) {
  $('#TestType').val("");
  $('#testGroup').val("");
  $('#testID').val("");
  $('#testName').val("");
  $('#specimanTypes').val("");
  $('#status').val("Active");
});

var stat = 0;
$('#btnSave').on('click', function (e) {
  e.preventDefault();

  $('#nameBtn').text('Please Wait....').attr('disabled', true);

  var TestType = $('#TestType').val();
  var TestGroup = $('#testGroup').val();
  var TestName = $('#testName').val();
  var SpecimanTypes = $('#specimanTypes').val();
  var SpecimanCount = $('#txtNoOfSamples').val();
  var LOINCCodes = $('#drpLOINCCodes').val();
  var Status = $('#status').val();

  //Get uuid Of Data Type
  var uuidOFDataType = "";
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
        if (val.display == 'Text') {
          uuidOFDataType = (val.uuid);
        }
      });
    }
  });

  //Get uuid Of Concept Class
  var uuidOFConceptClass = "";
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
        if (val.display == 'Test') {
          uuidOFConceptClass = (val.uuid);
        }
      });
    }
  });

  if (stat == 0) {

    var TestID = $('#testID').val();
    var stringFull = `${TestType}@@${TestGroup}@@${TestID}@@${TestName}@@${SpecimanTypes}@@${LOINCCodes}@@${Status}@@${SpecimanCount}`;

    var raw = JSON.stringify({
      "names": [{ "name": stringFull, "locale": "en", "localePreferred": true, "conceptNameType": "FULLY_SPECIFIED" }],
      "datatype": uuidOFDataType, "conceptClass": uuidOFConceptClass,
    });

    if (TestID == "" || TestName == "") {
      alert('Test Id & Test Name Can\'t be Empty!');
      return;
    }

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

    //Get Uuid Of Lab Investigations Concept
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

    //Get Uuid Of Exising Members Of Lab Investigations Concept
    var arrOfExistMembers = [];
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

        $(data.setMembers).each(function (k, v) {
          arrOfExistMembers.push(v.uuid);
        });
      }
    });

    arrOfExistMembers.push(uuidOfConcept);

    var rawx = JSON.stringify({ "setMembers": arrOfExistMembers });

    $.ajax({
      url: '/openmrs/ws/rest/v1/concept/' + uuidOfLabInvestigationsConcept,
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
          message: 'Lab Investigations Saved Successfully!',
          position: 'topRight'
        });

        $('#TestType').val("");
        $('#testGroup').val("");
        $('#testID').val("");
        $('#testName').val("");
        $('#specimanTypes').val("");
        $('#txtNoOfSamples').val("");
        $('#drpLOINCCodes').val("");
        $('#status').val("Active");

        $('#nameBtn').text('Save').attr('disabled', false);
      }
    });

  } else {

    var TestIDx = $('#drpTestId option:selected').text();
    var stringFull = `${TestType}@@${TestGroup}@@${TestIDx}@@${TestName}@@${SpecimanTypes}@@${LOINCCodes}@@${Status}@@${SpecimanCount}`;

    var raw = JSON.stringify({
      "names": [{ "name": stringFull, "locale": "en", "localePreferred": true, "conceptNameType": "FULLY_SPECIFIED" }],
      "datatype": uuidOFDataType, "conceptClass": uuidOFConceptClass,
    });

    var uuid = $('#drpTestId option:selected').attr('attr-uuid');

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
          message: 'Lab Investigations Update Successfully!',
          position: 'topRight'
        });

        $('#TestType').val("");
        $('#testGroup').val("");
        $('#testID').val("");
        $('#testName').val("");
        $('#txtNoOfSamples').val("");
        $('#specimanTypes').val("");
        $('#txtNoOfSamples').val("");
        $('#drpLOINCCodes').val("");
        $('#status').val("Active");
        $('#drpTestId').val("");

        $('#testID').show();
        $('#drpTestId').hide();

        $('#nameBtn').text('Save').attr('disabled', false);
      }
    });
  }

});


$('#btnLookup').on('click', function (e) {

  $('#testID').hide();
  $('#drpTestId').show();

  $('#nameBtn').text('Update');
  stat = 1;
});


$('#btnCancel').on('click', function (e) {

  location.reload();
});


$('#testGroup').on('change', function () {
  var testTypex = $('#TestType').val();
  var testGroupx = $(this).val();

  $('.clr').val("");

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

        var testType = val.display.split("@@")[0];
        var testGroup = val.display.split("@@")[1];
        var value = val.display.split("@@")[2];

        if (testTypex == testType && testGroupx == testGroup) {
          option += '<option attr-uuid="' + val.uuid + '" value="' + val.display + '">' + value + '</option>';
        }
      });

      $('#drpTestId').html("");
      $('#drpTestId').html(option);
    }
  });
});


$('#drpTestId').on('change', function () {

  var labInvId = $(this).val();

  var testName = labInvId.split("@@")[3];
  var specimanType = labInvId.split("@@")[4];
  var loincCode = labInvId.split("@@")[5];
  var status = labInvId.split("@@")[6];

  $('#testName').val(testName);
  $('#specimanTypes').val(specimanType);
  $('#drpLOINCCodes').val(loincCode);
  $('#status').val(status);
});

