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
    console.log('Frequently Used Drugs By Section OpenMRS Open Web App Started.');
  });
}());

$('.selectTwo').select2({
  dropdownAutoWidth: true,
  width: '100%'
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
          LoadSectionsForInstituteFun();
          LoadDrugsForInstituteFun();


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


//============================================================================


var UuidMain = "";
$('#drpSectionNames').on('change', function () {

  var secUuid = $(this).val();

  $('#drugNameFreqTBody').html("");

  $.ajax({
    url: returnUrl() + "/LoadAvailableFrequentlyUsedDrugsBySection",
    type: 'POST',
    dataType: 'json',
    async: false,
    data: { InstituteUuid: InstituteUuid, sectionUuid: secUuid },
    success: function (data) {

      if (data.length > 0) {
        var tr = "";
        UuidMain = data[0].conceptuuid;
        $(data[0].gridFull.split('###')).each(function (k, v) {
          tr += `<tr attr-val='${v}' class="sav">
                 <td>${ReturnConceptByUuid(v).display.split("@@")[1]}-${ReturnConceptByUuid(v).display.split("@@")[2]}</td>
                 <td style="text-align: center;"><button type='button' style='font-size:18px; color:red; border: none; background: none;' class='btn btn-link deleteBtn'><span class='fa fa-close'></span></button></td>
                 <td style="display: none;">${v}</td>
                 </tr>`;
        });

        $('#drugNameFreqTBody').html("");
        $('#drugNameFreqTBody').html(tr);
      }
    }
  });
});

function LoadSectionsForInstituteFun() {
  $.ajax({
    url: returnUrl() + "/LoadSectionNamesForInstitute",
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

      $('#drpSectionNames').html("");
      $('#drpSectionNames').html(options);
    }
  });
}

function LoadDrugsForInstituteFun() {
  $.ajax({
    url: returnUrl() + "/LoadDrugNamesForInstitute",
    type: 'POST',
    dataType: 'json',
    async: false,
    data: { InstituteUuid: InstituteUuid },
    success: function (data) {

      var options = "";
      options += "<option disabled selected value=''>--Select--</option>";
      $(data).each(function (key, val) {

        var name = `${val.name.split("@@")[1]} - ${val.name.split("@@")[2]}`;
        options += "<option attr-val='" + val.name + "' value='" + val.conceptuuid + "'>" + name + "</option>";
      });

      $('#drpDrugName').html("");
      $('#drpDrugName').html(options);
    }
  });
}

$('#btnAddToGrid').on('click', function () {

  var drugName = $('#drpDrugName option:selected').text();
  var drugVal = $('#drpDrugName').val();

  var tr = "<tr attr-val='" + drugVal + "'>\
  <td>" + drugName + "</td>\
  <td style=\"text-align: center;\"><button type='button' style='font-size:18px;color:red;border: none;background: none;'  class='btn btn-link deleteBtn'><span class='fa fa-close'></span></button></td><td style='display: none;'>0</td></tr>";

  $('#drugNameFreqTBody').append(tr);

  $('#drpDrugName').val("");
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

$(document).on('click', '#btnMainSave', function (e) {
  e.preventDefault();

  var sectionId = $('#drpSectionNames').val();

  var strGrid = "";
  $('#drugNameFreqTBody tr').each(function (k) {
    var $this = $(this);
    var drugId = $this.attr('attr-val');

    if (k == 0) {
      strGrid += `${drugId}`;
    } else {
      strGrid += `###${drugId}`;
    }
  });

  var stringFull = `${InstituteUuid}@@${sectionId}@@${strGrid}@@FrequentlyUsedDrugsBySections`;

  //Get uuid Of Data Type
  var uuidOFDataType = ReturnDataType('Text');

  //Get uuid Of Concept Class
  var uuidOFConceptClass = ReturnUuidOfConceptClass('Drug');

  var raw = JSON.stringify({
    "names": [{ "name": stringFull, "locale": "en", "localePreferred": true, "conceptNameType": "FULLY_SPECIFIED" }],
    "datatype": uuidOFDataType, "version": "1.2.2", "conceptClass": uuidOFConceptClass,
  });

  if ($('#drugNameFreqTBody tr.sav').length > 0) {

    $.ajax({
      url: '/openmrs/ws/rest/v1/concept/' + UuidMain,
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
          message: 'Frequently Used Drugs By Section Data Updated Successfully!',
          position: 'topRight'
        });
        
      }, complete: function () {

        $('#btnSave').text('Save').attr('disabled', false);
      }
    });

  } else {

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
    var uuidOfConceptMain = ReturnUuidOfConceptByName('Frequently Used Drugs By Section');

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
          message: 'Frequently Used Drugs By Section Data Saved Successfully!',
          position: 'topRight',
          timeout: 1000,
          onClosed: function () {
            location.reload();
          }
        });
      }
    });
  }


});

$('#btnCancel').on('click', function (e) {
  location.reload();
});
