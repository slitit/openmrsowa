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
    console.log('Drug Master OpenMRS Open Web App Started.');
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

$('#btnSaveNewCategory').on('click', function () {

  var txtCategoryName = $('#txtCategoryName').val();

  if (txtCategoryName == "") {
    alert('New Categoy Name Can\'t be Empty!');
    return;
  }

  //Get uuid Of Data Type
  var uuidOFDataType = ReturnDataType('Text');

  //Get uuid Of Concept Class
  var uuidOFConceptClass = ReturnUuidOfConceptClass('Misc');

  var raw = JSON.stringify({
    "names": [{ "name": txtCategoryName, "locale": "en", "localePreferred": true, "conceptNameType": "FULLY_SPECIFIED" }],
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
  var uuidOfConceptMain = ReturnUuidOfConceptByName('Drug Categories');

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
        message: 'Category Saved Successfully!',
        position: 'topRight'
      });

      $('#txtCategoryName').val("");

      LoadCategories();
    }
  });
});

LoadCategories();
function LoadCategories() {

  var uuidOfConcept = ReturnUuidOfConceptByName('Drug Categories');

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

      $('#drpCategory').html("");
      $('#drpCategory').html(option);
    }
  });
}

$('#btnAddToGrid').on('click', function () {

  let txtGridStrength = $("#txtGridStrength").val();
  var txtGridDosage = $("#txtGridDosage").val();
  var txtGridFactor = $("#txtGridFactor").val();

  if (txtGridStrength == "" || txtGridDosage == "" || txtGridFactor == "") {
    alert("Please Select Strength, Dosage and Factor!");
  } else {

    $("#drugSDFTBody").append(
      "<tr><td>" + txtGridStrength + "</td>\
      <td>" + txtGridDosage + "</td>\
      <td>" + txtGridFactor + "</td>\
      <td style=\"text-align: center;\"><button type='button' attr-value='0' style='font-size:18px;color:red;border: none;background: none;'  class='btn btn-link deleteBtn'><span class='fa fa-close'></span></button></td></tr>"
    );
  }

  $("#txtGridStrength").val("");
  $("#txtGridDosage").val("");
  $("#txtGridFactor").val("");
});

var stat = 0;
$(document).on('submit', 'form', function (e) {
  e.preventDefault();

  var Category = $('#drpCategory').val();
  var GenericName = $('#txtGenericName').val();
  var BrandName = $('#txtBrandName').val();
  var MeasuringUnit = $('#drpMeasuringUnit').val();
  var Route = $('#drpRoute').val();
  var Type = $('#drpType').val();
  var StorageUnit = $('#drpStorageUnit').val();
  var Comment = $('#txtComment').val();
  var Status = $('#drpStatus').val();

  var drugID = 0;
  if (stat == 1) {
    drugID = $('#drpDrugId').val();
  }

  var strGrid = "";
  $('#drugSDFTBody tr').each(function (k) {
    var $this = $(this);
    var Strength = $this.find('td:nth-child(1)').text();
    var Dosage = $this.find('td:nth-child(2)').text();
    var Factor = $this.find('td:nth-child(3)').text();

    if (k == 0) {
      strGrid += `${Strength}^^^${Dosage}^^^${Factor}`;
    } else {
      strGrid += `###${Strength}^^^${Dosage}^^^${Factor}`;
    }
  });

  var stringFull = `${Category}@@${GenericName}@@${BrandName}@@${MeasuringUnit}@@${Route}@@${Type}@@${StorageUnit}@@${Comment}@@${Status}@@${strGrid}@@DrugMaster@@${InstituteUuid}`;

  //Get uuid Of Data Type
  var uuidOFDataType = ReturnDataType('Text');

  //Get uuid Of Concept Class
  var uuidOFConceptClass = ReturnUuidOfConceptClass('Drug');

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
    var uuidOfConceptMain = ReturnUuidOfConceptByName('Drug Master');

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
          message: 'Drug Master Data Saved Successfully!',
          position: 'topRight',
          timeout: 10000,
        });

        $('#drpCategory').val("");
        $('#txtGenericName').val("");
        $('#txtBrandName').val("");
        $('#drpMeasuringUnit').val("");
        $('#drpRoute').val("");
        $('#drpType').val("");
        $('#drpStorageUnit').val("");
        $('#txtComment').val("");
        $('#drpStatus').val("");
        $('#drugSDFTBody').html("");

        $('#nameBtn').text('Save').attr('disabled', false);
      }
    });
  } else {

    $.ajax({
      url: '/openmrs/ws/rest/v1/concept/' + drugID,
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
          message: 'Drug Master Data Updated Successfully!',
          position: 'topRight'
        });

        $('#drpCategory').val("");
        $('#txtGenericName').val("");
        $('#txtBrandName').val("");
        $('#drpMeasuringUnit').val("");
        $('#drpRoute').val("");
        $('#drpType').val("");
        $('#drpStorageUnit').val("");
        $('#txtComment').val("");
        $('#drpStatus').val("");
        $('#drugSDFTBody').html("");

        $('#nameBtn').text('Save').attr('disabled', false);

        $("#panelDis").hide();
      }
    });
  }

});

$('#btnCancel').on('click', function (e) {
  location.reload();
});

$('#btnLookup').on('click', function (e) {

  $("#panelDis").show();

  $('#nameBtn').text('Update');
  stat = 1;

  $("html, body").animate({ scrollTop: 0 }, "slow");

  LoadDrugNames();
});

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

        var GenericName = val.display.split("@@")[1];
        option += `<option attr-value="${val.display}" value="${val.uuid}">${GenericName}</option>`;
      });

      $('#drpDrugId').html("");
      $('#drpDrugId').html(option);
    }
  });

}

$(document).on('change', '#drpDrugId', function () {

  $('#drpCategory').val("");
  $('#txtGenericName').val("");
  $('#txtBrandName').val("");
  $('#drpMeasuringUnit').val("");
  $('#drpRoute').val("");
  $('#drpType').val("");
  $('#drpStorageUnit').val("");
  $('#txtComment').val("");
  $('#drpStatus').val("");
  $('#drugSDFTBody').html("");

  var OtherData = $('#drpDrugId option:selected').attr('attr-value');

  var Category = OtherData.split("@@")[0];
  var GenericName = OtherData.split("@@")[1];
  var BrandName = OtherData.split("@@")[2];
  var MeasuringUnit = OtherData.split("@@")[3];
  var Route = OtherData.split("@@")[4];
  var Type = OtherData.split("@@")[5];
  var StorageMethod = OtherData.split("@@")[6];
  var Comment = OtherData.split("@@")[7];
  var Status = OtherData.split("@@")[8];

  $('#drpCategory').val(Category);
  $('#txtGenericName').val(GenericName);
  $('#txtBrandName').val(BrandName);
  $('#drpMeasuringUnit').val(MeasuringUnit);
  $('#drpRoute').val(Route);
  $('#drpType').val(Type);
  $('#drpStorageUnit').val(StorageMethod);
  $('#txtComment').val(Comment);
  $('#drpStatus').val(Status);

  var gridData = (OtherData.split("@@")[9]).split("###");

  for (var x = 0; x < gridData.length; x++) {
    var Strength = gridData[x].split("^^^")[0];
    var Dosage = gridData[x].split("^^^")[1];
    var Factor = gridData[x].split("^^^")[2];

    if (Dosage != undefined) {
      $("#drugSDFTBody").append(
        "<tr><td>" + Strength + "</td>\
        <td>" + Dosage + "</td>\
        <td>" + Factor + "</td>\
        <td style=\"text-align: center;\"><button type='button' style='font-size:18px;color:red;border: none;background: none;'  class='btn btn-link deleteBtn'><span class='fa fa-close'></span></button></td></tr>"
      );
    }
  }


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

$('#txtGenericName').on('change', function () {

  var genericName = $(this).val();

  $.ajax({
    url: returnUrl() + '/CheckGenericNameExists',
    type: "POST",
    dataType: "json",
    async: false,
    data: { genericName: genericName },
    success: function (data) {

      if (data[0].countRow > 0) {
        iziToast.error({
          title: 'Error!',
          message: 'Drug Generic Name Already Exists!',
          position: 'topRight'
        });

        $('#txtGenericName').val("");
      }
    }
  });
});


