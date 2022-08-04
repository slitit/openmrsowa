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
    console.log('Radiology Investigation OpenMRS Open Web App Started.');
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


$('#btnAddRegion').on('click', function () {

  var txtRegion = $('#txtRegion').val();

  if (txtRegion == "") {
    alert('Region Can\'t be Empty!');
    return;
  }

  //Get uuid Of Data Type
  var uuidOFDataType = ReturnDataType('Text');

  //Get uuid Of Concept Class
  var uuidOFConceptClass = ReturnUuidOfConceptClass('Region');

  var raw = JSON.stringify({
    "names": [{ "name": txtRegion, "locale": "en", "localePreferred": true, "conceptNameType": "FULLY_SPECIFIED" }],
    "datatype": uuidOFDataType, "version": "1.2.2", "conceptClass": uuidOFConceptClass,
  });

  //Create Concept Of Region
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

  //Get Uuid Of Regions Concept
  var uuidOfConceptMain = ReturnUuidOfConceptByName('Regions');


  //Get Uuid Of Exising Members Of Test Group Concept
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

  var raw = JSON.stringify({ "setMembers": arrOfExistMembers });

  $.ajax({
    url: '/openmrs/ws/rest/v1/concept/' + uuidOfConceptMain,
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
        message: 'Region Saved Successfully!',
        position: 'topRight'
      });

      $('#txtRegion').val("");

      LoadRegions();
    }
  });
});

LoadRegions();
function LoadRegions() {

  var uuidOfConcept = ReturnUuidOfConceptByName('Regions');

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
        option += '<option value="' + val.uuid + '">' + val.display + '</option>';
      });

      $('#drpRegion').html("");
      $('#drpRegion').html(option);
    }
  });
}

$('#btnAddLocalization').on('click', function () {

  var txtValue = $('#txtLocalization').val();

  if (txtValue == "") {
    alert('Localization Can\'t be Empty!');
    return;
  }

  //Get uuid Of Data Type
  var uuidOFDataType = ReturnDataType('Text');

  //Get uuid Of Concept Class
  var uuidOFConceptClass = ReturnUuidOfConceptClass('Misc');

  var raw = JSON.stringify({
    "names": [{ "name": txtValue, "locale": "en", "localePreferred": true, "conceptNameType": "FULLY_SPECIFIED" }],
    "datatype": uuidOFDataType, "version": "1.2.2", "conceptClass": uuidOFConceptClass,
  });

  //Create Concept Of Region
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

  //Get Uuid Of Regions Concept
  var uuidOfConceptMain = ReturnUuidOfConceptByName('Localization');

  //Get Uuid Of Exising Members Of Test Group Concept
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

  var raw = JSON.stringify({ "setMembers": arrOfExistMembers });

  $.ajax({
    url: '/openmrs/ws/rest/v1/concept/' + uuidOfConceptMain,
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
        message: 'Localization Saved Successfully!',
        position: 'topRight'
      });

      $('#txtLocalization').val("");

      LoadLocalization();
    }
  });
});

LoadLocalization();
function LoadLocalization() {

  var uuidOfConcept = ReturnUuidOfConceptByName('Localization');

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
        option += '<option value="' + val.uuid + '">' + val.display + '</option>';
      });

      $('#drpLocalization').html("");
      $('#drpLocalization').html(option);
    }
  });
}

$('#btnAddPosition').on('click', function () {

  var txtValue = $('#txtPosition').val();

  if (txtValue == "") {
    alert('Position Can\'t be Empty!');
    return;
  }

  //Get uuid Of Data Type
  var uuidOFDataType = ReturnDataType('Text');

  //Get uuid Of Concept Class
  var uuidOFConceptClass = ReturnUuidOfConceptClass('Misc');

  var raw = JSON.stringify({
    "names": [{ "name": txtValue, "locale": "en", "localePreferred": true, "conceptNameType": "FULLY_SPECIFIED" }],
    "datatype": uuidOFDataType, "version": "1.2.2", "conceptClass": uuidOFConceptClass,
  });

  //Create Concept Of Position
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

  //Get Uuid Of Main Concept
  var uuidOfConceptMain = ReturnUuidOfConceptByName('Position');


  //Get Uuid Of Exising Members Of Main Concept
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

  var raw = JSON.stringify({ "setMembers": arrOfExistMembers });

  $.ajax({
    url: '/openmrs/ws/rest/v1/concept/' + uuidOfConceptMain,
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
        message: 'Position Saved Successfully!',
        position: 'topRight'
      });

      $('#txtPosition').val("");

      LoadPosition();
    }
  });
});

LoadPosition();
function LoadPosition() {

  var uuidOfConcept = ReturnUuidOfConceptByName('Position');

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
        option += '<option value="' + val.uuid + '">' + val.display + '</option>';
      });

      $('#drpPosititon').html("");
      $('#drpPosititon').html(option);
    }
  });
}

$('#btnAddToGrid').on('click', function () {

  let regionVal = $("#drpRegion").val();
  var regionValText = $("#drpRegion :selected").text();
  var localizationVal = $("#drpLocalization").val();
  var localizationValText = $("#drpLocalization :selected").text();
  var positionVal = $("#drpPosititon").val();
  var positionText = $("#drpPosititon :selected").text();

  if (regionVal == null || localizationVal == null || positionVal == null) {
    alert("Please Select Region, Localization and Position!");
  } else {

    $("#regiondataBody").append(
      "<tr><td style='display:none'>" + regionVal + "</td>\
      <td>" + regionValText + "</td>\
      <td style='display:none'>" + localizationVal + "</td>\
      <td>" + localizationValText + "</td>\
      <td style='display:none'>" + positionVal + "</td>\
      <td>" + positionText + "</td>\
      <td style=\"text-align: center;\"><button type='button' attr-value='0' style='font-size:18px;color:red;border: none;background: none;'  class='btn btn-link deleteBtn'><span class='fa fa-close'></span></button></td></tr>"
    );
  }

  $("#drpRegion").val(null);
  $("#drpLocalization").val(null);
  $("#drpPosititon").val(null);
});

$(document).on('click', '.deleteBtn', function () {
  var $this = $(this);

  swal({
    title: "Are you sure want to delete this row?",
    text: "Once deleted, you will not be able to recover this row!",
    icon: "warning",
    buttons: true,
  }).then((willDelete) => {
    if (willDelete) {
      $($this).parents('tr').remove();
      swal("This row has been deleted!", {
        icon: "success",
      });
    }
  });
});

var stat = 0;
$('#btnSubmit').on('click', function (e) {
  e.preventDefault();

  $('#nameBtn').text('Please Wait....').attr('disabled', true);

  var TestID = $('#txtTestID').val();
  var TestName = $('#txtTestName').val();
  var Status = $('#drpStatus').val();

  if (stat == 1) {
    TestID = $('#drpTestId option:selected').text();
  }

  var strGrid = "";
  $('#regiondataBody tr').each(function (k) {
    var $this = $(this);
    var region = $this.find('td:nth-child(1)').text();
    var localization = $this.find('td:nth-child(3)').text();
    var position = $this.find('td:nth-child(5)').text();

    if (k == 0) {
      strGrid += `${region}^^^${localization}^^^${position}`;
    } else {
      strGrid += `###${region}^^^${localization}^^^${position}`;
    }
  });

  var stringFull = `${TestID}@@${TestName}@@${Status}@@${strGrid}@@${InstituteUuid}@@RadiologyInvestigation`;

  //Get uuid Of Data Type
  var uuidOFDataType = ReturnDataType('Text');

  //Get uuid Of Concept Class
  var uuidOFConceptClass = ReturnUuidOfConceptClass('Misc');

  var raw = JSON.stringify({
    "names": [{ "name": stringFull, "locale": "en", "localePreferred": true, "conceptNameType": "FULLY_SPECIFIED" }],
    "datatype": uuidOFDataType, "version": "1.2.2", "conceptClass": uuidOFConceptClass,
  });

  if (stat == 0) {

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
    var uuidOfConceptMain = ReturnUuidOfConceptByName('Radiology Investigation');

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
          message: 'Radiology Investigations Saved Successfully!',
          position: 'topRight'
        });

        $('#txtTestID').val("");
        $('#txtTestName').val("");
        $('#drpStatus').val("");
        $('#regiondataBody').html("");

        $('#nameBtn').text('Save').attr('disabled', false);
      }
    });
  } else {

    var uuid = $('#drpTestId').val();

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
          message: 'Radiology Investigations Updated Successfully!',
          position: 'topRight'
        });

        $('#txtTestID').val("");
        $('#txtTestName').val("");
        $('#drpStatus').val("");
        $('#regiondataBody').html("");

        $('#nameBtn').text('Save').attr('disabled', false);

        $(".InstituteCont").hide();
        $(".InstituteContHide").show();
      }
    });
  }

});

$('#btnLookup').on('click', function (e) {

  $(".InstituteCont").show();
  $(".InstituteContHide").hide();

  $('#nameBtn').text('Update');
  stat = 1;

  LoadRadiologyTestID();
});

function LoadRadiologyTestID() {

  var uuidOfConcept = ReturnUuidOfConceptByName('Radiology Investigation');

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

        var testId = val.display.split("@@")[0];
        option += '<option attr-value="' + val.display + '" value="' + val.uuid + '">' + testId + '</option>';
      });

      $('#drpTestId').html("");
      $('#drpTestId').html(option);
    }
  });
}

$('#btnCancel').on('click', function (e) {
  location.reload();
});

$(document).on('change', '#drpTestId', function () {

  $('#txtTestID').val("");
  $('#txtTestName').val("");
  $('#drpStatus').val("");
  $('#regiondataBody').html("");

  var OtherData = $('#drpTestId option:selected').attr('attr-value');

  var testId = OtherData.split("@@")[0];
  var testName = OtherData.split("@@")[1];
  var status = OtherData.split("@@")[2];

  $('#txtTestName').val(testName);
  $('#drpStatus').val(status);

  var gridData = (OtherData.split("@@")[3]).split("###");

  for (var x = 0; x < gridData.length; x++) {
    var regionUuid = gridData[x].split("^^^")[0];
    var localizationUuid = gridData[x].split("^^^")[1];
    var positionUuid = gridData[x].split("^^^")[2];

    var region = ReturnConceptByUuid(regionUuid).display;
    var localization = ReturnConceptByUuid(localizationUuid).display;
    var position = ReturnConceptByUuid(positionUuid).display;

    $("#regiondataBody").append(
      "<tr><td style='display:none'>" + regionUuid + "</td>\
      <td>" + region + "</td>\
      <td style='display:none'>" + localizationUuid + "</td>\
      <td>" + localization + "</td>\
      <td style='display:none'>" + positionUuid + "</td>\
      <td>" + position + "</td>\
      <td style=\"text-align: center;\"><button type='button' style='font-size:18px;color:red;border: none;background: none;'  class='btn btn-link deleteBtn'><span class='fa fa-close'></span></button></td></tr>"
    );
  }


});