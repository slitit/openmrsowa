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
import "select2/dist/css/select2.min.css";

(function () {
  'use strict';
  document.addEventListener("DOMContentLoaded", function (event) {
    console.log('Authorization Required Drugs For Prescribing OpenMRS Open Web App Started.');
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
          LoadUsers();
          LoadSectionNamesForInstituteFun();
          LoadHistoryAuthorizedDrugsFun();

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

      $('#drpCategories').html("");
      $('#drpCategories').html(option);
    }
  });
}

$('#drpCategories').on('change', function () {

  var categoryId = $(this).val();

  $.ajax({
    url: returnUrl() + '/LoadDrugNamesInCategory',
    type: "POST",
    dataType: "json",
    async: false,
    data: { categoryId: categoryId },
    success: function (data) {

      var option = "";
      option += '<option value="" selected disabled>--- Select ---</option>';
      $(data).each(function (key, val) {

        var GenericName = val.name.split("@@")[1];
        option += `<option attr-value="${val.name}" value="${val.conceptuuid}">${GenericName}</option>`;
      });

      $('#drpDrugName').html("");
      $('#drpDrugName').html(option);

      $('#drpDrugName').select2({
        dropdownAutoWidth: true,
        width: '100%'
      });
    }
  });
});

function LoadUsers() {

  fetch(returnUrl() + '/LoadUsers', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      InstituteUuid: InstituteUuid,
      superuser: 0
    })
  })
    .then(response => response.json())
    .then(result => {

      var options = "";
      options += "<option disabled selected>--Select--</option>";

      $(result).each(function (key, val) {
        options += "<option value='" + val.useruuid + "'>" + val.name + "-" + val.username + "</option>";
      });

      $('#drpUsers').html("");
      $('#drpUsers').html(options);

    })
    .catch(error => console.log('error', error));
}

function LoadSectionNamesForInstituteFun() {

  $.ajax({
    url: returnUrl() + '/LoadSectionNamesForInstitute',
    type: "POST",
    dataType: "json",
    async: false,
    data: { InstituteUuid: InstituteUuid },
    success: function (data) {

      var options = "";
      options += "<option disabled selected>--Select--</option>";
      $(data).each(function (key, val) {
        options += "<option value='" + val.uuid + "'>" + (val.name) + "</option>";
      });

      $('#drpAssignedSections').html("");
      $('#drpAssignedSections').html(options);

      $('#drpAssignedSections').select2({
        dropdownAutoWidth: true,
        width: '100%'
      });
    }
  });
}

$('#btnAddToGridUsers').on('click', function () {

  let drpUsers = $("#drpUsers").val();
  let drpUsersText = $("#drpUsers option:selected").text();

  var exist = false;
  $('#tbodyUsers').find("tr").each(function () {
    var check_value = $(this).find('td:nth-child(1)').text();
    if (check_value == drpUsersText) {
      exist = true;
    }
  });

  if (exist) {
    alert("User exist");
  } else {

    if (drpUsers == "") {
      alert("Please Select Users!");
    } else {

      $("#tbodyUsers").append(
        "<tr attr-val='" + drpUsers + "'><td>" + drpUsersText + "</td>\
      <td style=\"text-align: center;\"><button type='button' attr-value='0' style='font-size:18px;color:red;border: none;background: none;'  class='btn btn-link deleteBtn'><span class='fa fa-close'></span></button></td></tr>"
      );
    }
  }

  $("#drpUsers").val("").trigger('change.select2');
});

$('#btnAddToGridAssignedSections').on('click', function () {

  let drpAssignedSections = $("#drpAssignedSections").val();
  let drpAssignedSectionsText = $("#drpAssignedSections option:selected").text();

  var exist = false;
  $('#tbodySections').find("tr").each(function () {
    var check_value = $(this).find('td:nth-child(1)').text();
    if (check_value == drpAssignedSectionsText) {
      exist = true;
    }
  });

  if (exist) {
    alert("Section exist");
  } else {

    if (drpAssignedSections == "") {
      alert("Please Select Assigned Sections!");
    } else {

      $("#tbodySections").append(
        "<tr attr-val='" + drpAssignedSections + "'><td>" + drpAssignedSectionsText + "</td>\
         <td style=\"text-align: center;\"><button type='button' attr-value='0' style='font-size:18px;color:red;border: none;background: none;'  class='btn btn-link deleteBtn'><span class='fa fa-close'></span></button></td></tr>"
      );
    }
  }

  $("#drpAssignedSections").val("").trigger('change.select2');
});

$('#btnSave').on('click', function (e) {

  var drpCategories = $('#drpCategories').val();
  var drpDrugName = $('#drpDrugName').val();

  var strGridUsers = "";
  $('#tbodyUsers tr').each(function (k) {
    var $this = $(this);
    var data = $this.attr('attr-val');

    if (k == 0) {
      strGridUsers += `${data}`;
    } else {
      strGridUsers += `###${data}`;
    }
  });

  var strGridSections = "";
  $('#tbodySections tr').each(function (k) {
    var $this = $(this);
    var data = $this.attr('attr-val');

    if (k == 0) {
      strGridSections += `${data}`;
    } else {
      strGridSections += `###${data}`;
    }
  });

  var stringFull = `${InstituteUuid}@@${drpCategories}@@${drpDrugName}@@${strGridUsers}@@${strGridSections}@@AuthorizationRequiredDrugsForPrescribing`;

  //Get uuid Of Data Type
  var uuidOFDataType = ReturnDataType('Text');

  //Get uuid Of Concept Class
  var uuidOFConceptClass = ReturnUuidOfConceptClass('Misc');

  var raw = JSON.stringify({
    "names": [{ "name": stringFull, "locale": "en", "localePreferred": true, "conceptNameType": "FULLY_SPECIFIED" }],
    "datatype": uuidOFDataType, "version": "1.2.2", "conceptClass": uuidOFConceptClass,
  });

  if (uuid == "") {

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
    var uuidOfConceptMain = ReturnUuidOfConceptByName('Authorization Required Drugs For Prescribing');

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
          message: 'Authorization Required Drugs For Prescribing Data Saved Successfully!',
          position: 'topRight',
          timeout: 10000,
        });

        $("#drpCategories").val("").trigger('change.select2');
        $('#drpDrugName').val("").trigger('change.select2');
        $('#tbodyUsers').html("");
        $('#tbodySections').html("");
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
          message: 'Authorization Required Drugs For Prescribing Data Updated Successfully!',
          position: 'topRight'
        });

        $("#drpCategories").val("").trigger('change.select2');
        $('#drpDrugName').val("").trigger('change.select2');
        $('#tbodyUsers').html("");
        $('#tbodySections').html("");
      }
    });
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

function LoadHistoryAuthorizedDrugsFun() {

  $.ajax({
    url: returnUrl() + '/LoadHistoryAuthorizedDrugs',
    type: "POST",
    dataType: "json",
    async: false,
    data: { InstituteUuid: InstituteUuid },
    success: function (data) {

      var tr = "";
      $(data).each(function (key, val) {

        var categoryUuid = val.name.split("@@")[1];
        var drugUuid = val.name.split("@@")[2];

        tr += "<tr>";
        tr += "<td>" + ReturnConceptByUuid(categoryUuid).display + "</td>";
        tr += "<td>" + ReturnConceptByUuid(drugUuid).display.split("@@")[1] + "</td>";
        tr += "</tr>";
      });

      $('#tbodyDet').html("");
      $('#tbodyDet').html(tr);
    }
  });
}

$('#btnCancel').on('click', function () {
  location.reload();
});

var uuid = "";
$('#drpDrugName').on('change', function () {

  var categories = $('#drpCategories').val();
  var drug = $(this).val();

  $.ajax({
    url: returnUrl() + '/LoadAvailableDataAuthorizedReqDrugs',
    type: "POST",
    dataType: "json",
    async: false,
    data: { categories: categories, drug: drug, InstituteUuid: InstituteUuid },
    success: function (data) {

      uuid = data[0].conceptuuid;
      var usersLi = (data[0].name.split("@@")[3]).split("###");
      var sectionsLi = (data[0].name.split("@@")[4]).split("###");

      var tr = "";
      $(usersLi).each(function (key, val) {

        var user = "";
        var uuid = "";
        $.ajax({
          url: `/openmrs/ws/rest/v1/user/${val}`,
          type: "GET",
          dataType: "json",
          async: false,
          data: {},
          success: function (data) {
            user = `${data.person.display}-${data.username}`;            
          }
        });

        tr += "<tr attr-val='" + val + "'>";
        tr += `<td>${user}</td>`;
        tr += `<td style="text-align: center;"><button type='button' attr-value='0' style='font-size:18px;color:red;border: none;background: none;'  class='btn btn-link deleteBtn'><span class='fa fa-close'></span></button></td>`;
        tr += "</tr>";
      });

      $('#tbodyUsers').html("");
      $('#tbodyUsers').html(tr);

      //========================================================================

      var tr1 = "";
      $(sectionsLi).each(function (key, val) {

        var section = "";
        $.ajax({
          url: `/openmrs/ws/rest/v1/location/${val}`,
          type: "GET",
          dataType: "json",
          async: false,
          data: {},
          success: function (data) {
            section = `${data.display}`;
          }
        });

        tr1 += "<tr attr-val='" + val + "'>";
        tr1 += `<td>${section}</td>`;
        tr1 += `<td style="text-align: center;"><button type='button' attr-value='0' style='font-size:18px;color:red;border: none;background: none;'  class='btn btn-link deleteBtn'><span class='fa fa-close'></span></button></td>`;
        tr1 += "</tr>";
      });

      $('#tbodySections').html("");
      $('#tbodySections').html(tr1);
    }
  });

});