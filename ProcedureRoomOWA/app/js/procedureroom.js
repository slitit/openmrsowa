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
import 'datatables';
import 'datatables/media/css/jquery.dataTables.min.css';

(function () {
  'use strict';
  document.addEventListener("DOMContentLoaded", function (event) {
    console.log('Procedure room OpenMRS Open Web App Started.');
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

//==========================================================================

loadPendingList();
function loadPendingList() {

  fetch(returnUrl() + '/LoadPendingListProcedures', {
    method: 'POST',
  })
    .then(response => response.json())
    .then(result => {

      var tr = "";
      $(result).each(function (key, val) {
        tr += "<tr>";
        tr += "<td attrval='" + val.phn + "'>" + val.phn + "</td>";
        tr += "<td>" + val.given_name + "</td>";
        tr += "<td>" + val.family_name + "</td>";
        tr += "<td>" + val.examinationdate + "</td>";
        tr += '<td style="text-align: center; padding: 6px;">\
        <button class="btn btn-warning btnselectRow" type="button" \
        style="padding: 2px 16px;border: 2px solid;border-radius: 15px;background: #ffc107;"\
        >Select</button></td>';
        tr += "</tr>";
      });

      $('#listTbody').html("");
      $('#listTbody').html(tr);


      $('.tblPendingList').dataTable();
    }).catch(error => console.log('error', error));
}

$(document).on('click', '.btnselectRow', function () {

  var currTrPhn = $(this).parents('tr').find('td:nth-child(1)').text();
  var visitDate = $(this).parents('tr').find('td:nth-child(4)').text();
  var useruuid = userUuid();
  var insuuid = instituteUuid();
  var unitid = availableUnitForUser(useruuid, insuuid);

  $.ajax({
    url: returnUrl() + '/SetStatusPhnProcedure',
    type: 'post',
    dataType: 'json',
    data: {
      currTrPhn: currTrPhn,
      unit: unitid[0],
      counter: unitid[1],
      insuuid: insuuid,
      visitDate: visitDate,
      sectionId: sectionId
    },
    success: function (data) {

      var t5 = "";
      $(data.procres).each(function (k, v) {
        t5 += "<tr>";
        t5 += "<th style='vertical-align: middle;' attr-val='" + v.procedureType + "'>" + v.proceduretype + "</th>";
        if (v.injection != "null") {
          t5 += "<th></th>";
        } else {
          t5 += "<th style='vertical-align: middle;'>" + v.injection + "</th>";
        }
        t5 += "<th style='vertical-align: middle;'>" + v.remarks + "</th>";
        t5 += "<th style='vertical-align: middle;'>" + v.type + "</th>";
        t5 += "<th style='text-align: center; vertical-align: middle;'><input type='checkbox' class='chkAdministered'/></th>";
        t5 += "<th style=\"padding: 0 5px;\">";
        t5 += "<select class='form-control drpBadgeNo'>";
        var option = "";
        option += "<option value='' selected>--Select--</option>";
        $(data.batdata).each(function (k, v) {
          option += "<option value='" + v.stockid + "'>" + v.batch_no + "</option>";
        });
        t5 += option;
        t5 += "</select>";
        t5 += "</th></tr>";
        t5 += "</tr>";
      });
      $('#tblBodyProc').html("");
      $('#tblBodyProc').html(t5);

    }, complete: function () {
      loadPendingList();
    }
  });

  $('#selPhn').val(currTrPhn);

});

$('#btnSave').on('click', function () {

  var selected = new Array();
  $('#tblBodyProc tr').each(function () {
    var proctype = $(this).find('th:nth-child(1)').attr('attr-val');
    var injection = $(this).find('th:nth-child(2)').text();
    var remark = $(this).find('th:nth-child(3)').text();
    var type = $(this).find('th:nth-child(4)').text();
    var chk = false;
    if ($(this).find('th:nth-child(5) .chkAdministered').is(":checked")) {
      chk = true;
    }
    var batchno = $(this).find('th:nth-child(6) select option:selected').val();

    selected.push([proctype, injection, remark, type, chk, batchno]);
  });

  var phnNo = $('#selPhn').val();
  var remarkMain = $('#textRemark').val();
  var nextInjection = $('#txtNextInjectionDate').val();
  var cby = userUuid();

  $.ajax({
    url: returnUrl() + '/SaveProcedureRoom',
    type: 'POST',
    dataType: 'json',
    data: {
      phnNo: phnNo,
      selected: selected,
      remarkMain: remarkMain,
      nextInjection: nextInjection,
      cby: cby
    },
    success: function (data) {

      iziToast.success({
        title: 'OK',
        message: 'Saved Successfully!',
        position: 'topRight'
      });

      // setDataPrint(phnNo);
    }
  });
});

$('#btnCallNext').on('click', function () {
  var useruuid = userUuid();
  var insuuid = instituteUuid();
  var unitid = availableUnitForUser(useruuid, insuuid);

  $.ajax({
    url: returnUrl() + '/LoadTokenProcedureRoom',
    type: 'POST',
    dataType: 'json',
    data: {
      unit: unitid[0],
      counter: unitid[1],
      insuuid: insuuid,
      sectionId: sectionId
    },
    success: function (result) {

      $('#currentToken').text(result.resp.token_number);

      var today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0');
      var yyyy = today.getFullYear();

      today = yyyy + '-' + mm + '-' + dd;

      var t5 = "";
      $(result.procres).each(function (k, v) {
        t5 += "<tr>";
        t5 += "<th style='vertical-align: middle;' attr-val='" + v.procedureType + "'>" + v.proceduretype + "</th>";
        if (v.injection != "null") {
          t5 += "<th></th>";
        } else {
          t5 += "<th style='vertical-align: middle;'>" + v.injection + "</th>";
        }
        t5 += "<th style='vertical-align: middle;'>" + v.remarks + "</th>";
        t5 += "<th style='vertical-align: middle;'>" + v.type + "</th>";
        t5 += "<th style='text-align: center; vertical-align: middle;'><input type='checkbox' class='chkAdministered'/></th>";
        t5 += "<th style=\"padding: 0 5px;\">";
        t5 += "<select class='form-control drpBadgeNo'>";
        var option = "";
        option += "<option value='' selected>--Select--</option>";
        $(result.batdata).each(function (k, v) {
          option += "<option value='" + v.stockid + "'>" + v.batch_no + "</option>";
        });
        t5 += option;
        t5 += "</select>";
        t5 += "</th></tr>";
        t5 += "</tr>";
      });
      $('#tblBodyProc').html("");
      $('#tblBodyProc').html(t5);

      $.ajax({
        url: returnUrl() + '/GetPHNFromTokenNo',
        type: 'POST',
        dataType: 'json',
        data: {
          unit: unitid[0],
          insuuid: insuuid,
          token_number: result.resp.token_number
        },
        success: function (result) {

          $('#selPhn').val(result.phn);

          loadPendingList();
        }
      });
    }
  });
});

$('#btnSaveCallNext').on('click', function () {
  $('#btnSave').click();
  $('#btnCallNext').click();
});

$('#btnCallSpecificToken').on('click', function () {

  var tokenNo = $('#txtSpecToken').val();
  if (tokenNo == "") {
    iziToast.error({
      title: 'Error',
      message: 'Token Can\'t be null!',
      position: 'topRight'
    });
  }

  var useruuid = userUuid();
  var insuuid = instituteUuid();
  var unitid = availableUnitForUser(useruuid, insuuid);

  $.ajax({
    url: returnUrl() + '/CallSpecificTokenProcRoom',
    type: 'POST',
    dataType: 'json',
    data: {
      unit: unitid[0],
      insuuid: insuuid,
      tokenNo: tokenNo,
      sectionId: sectionId
    },
    success: function (result) {

      $('#currentToken').text(result.token_number);
      $('#txtPhnNo').val(result.phn);
      $('#selPhn').val(result.phn);


      var today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0');
      var yyyy = today.getFullYear();

      today = yyyy + '-' + mm + '-' + dd;

      loadPendingList();
    }
  });
});

function filterColumn(i) {
  $('.tblPendingList').DataTable().column(i).search(
    $('#txtPhnNo').val(), true, true
  ).draw();
}

$('#txtPhnNo').on('keyup', function () {
  filterColumn(0);
});