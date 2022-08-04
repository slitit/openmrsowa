/* * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
import $ from 'jquery';
import 'bootstrap/dist/js/bootstrap.bundle.js';
import JsBarcode from 'jsbarcode';
import iziToast from 'izitoast';
import "izitoast/dist/css/iziToast.min.css";


(function () {
  'use strict';
  document.addEventListener("DOMContentLoaded", function (event) {
    console.log('Radiology Test OpenMRS Open Web App Started.');
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
          loadPendingList();

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


//=========================================================================


function loadPendingList() {

  $.ajax({
    url: returnUrl() + '/LoadPendingListForRadiologyTests',
    type: 'POST',
    dataType: 'json',
    data: {
      InstituteUuid: InstituteUuid
    },
    success: function (data) {

      var tr = "";
      $(data).each(function (key, val) {

        var age = (val.age == null) ? '' : val.age;
        var multi = "<td></td>";
        if (parseInt(val.countSample) > 1) {
          multi = "<td class='muliProc' style='color: blue; cursor:pointer;'>Multiple</td>";
        } else {
          multi = "<td class='muliProc' style='color: blue; cursor:pointer;'>Test Name</td>";
        }

        var orderBy = "";
        $.ajax({
          url: '/openmrs/ws/rest/v1/user/' + val.orderbyuuid,
          type: 'GET',
          dataType: 'json',
          async: false,
          data: {},
          success: function (data) {
            orderBy = data.person.display;
          }
        });

        tr += "<tr attr-uuid='" + val.person_id + "' attr-encounter='" + val.encounteruuid + "'>";
        tr += "<td>OPD</td>";
        tr += "<td>" + val.phn + "</td>";
        tr += "<td>" + val.namefull + "</td>";
        tr += "<td>" + val.gender + "</td>";
        tr += "<td>" + age + "</td>";
        tr += "<td>" + val.orderbydate + "</td>";
        tr += "<td>" + orderBy + "</td>";
        tr += "<td>" + val.orderbydate + "</td>";
        tr += multi;
        tr += '<td style="text-align: center; padding: 6px;">\
                     <button class="btn btn-warning btnSelectRow" type="button" \
                     style="padding: 2px 16px;border: 2px solid;border-radius: 15px;background: #ffc107;">\
                     Select</button></td>';
        tr += "</tr>";
      });

      $('#tblRadiologyTestsMainContent').html("");
      $('#tblRadiologyTestsMainContent').html(tr);
    }
  });
}

$(document).on('click', '.muliProc', function () {

  var phn = $(this).parents('tr').find('td:nth-child(2)').text();
  var date = $(this).parents('tr').find('td:nth-child(8)').text();
  var encounteruuid = $(this).parents('tr').attr('attr-encounter');

  var con = "";
  $.ajax({
    url: returnUrl() + '/LoadListForRadiologyTestFromPHN',
    type: 'POST',
    dataType: 'json',
    async: false,
    data: {
      phn: phn,
      date: date,
      encounteruuid: encounteruuid
    },
    success: function (data) {

      $(data).each(function (key, val) {
        var testUuid = val.test;
        var test = ReturnConceptByUuid(testUuid).display.split("@@")[1];
        con += "<div>" + (key + 1) + ").  " + test + "</div>";
      });
    }
  });

  $(this).popover({
    placement: 'left',
    html: true,
    content: function () {
      return con;
    }, title: function () {
      return 'Test List';
    }
  });

});

var phnVal = ""
$(document).on('click', '.btnSelectRow', function () {

  $('#tblRadiologyTestsMainContent tr').removeClass('SelectedRowMain');
  $(this).parents('tr').addClass('SelectedRowMain');

  var section = $(this).parents('tr').find('td:nth-child(1)').text();
  var phn = phnVal = $(this).parents('tr').find('td:nth-child(2)').text();
  var fullName = $(this).parents('tr').find('td:nth-child(3)').text();
  var gender = $(this).parents('tr').find('td:nth-child(4)').text();
  var age = $(this).parents('tr').find('td:nth-child(5)').text();
  var patientUuid = $(this).parents('tr').attr('attr-uuid');

  $('#txtFullName').val(fullName);
  $('#txtSection').val(section);
  $('#txtPhn').val(phn);
  $('#txtGender').val(gender);
  $('#txtAge').val(age);

  JsBarcode("#barcodeFullName", fullName);
  $('#barcodeFullName').css({ "width": "100%" });
  JsBarcode("#barcodePhn", phn);
  $('#barcodePhn').css({ "width": "100%" });
  JsBarcode("#barcodeAge", age);
  $('#barcodeAge').css({ "width": "100%" });

  $.ajax({
    url: '/openmrs/ws/rest/v1/patient/' + patientUuid,
    type: 'GET',
    dataType: 'json',
    async: false,
    data: {},
    success: function (data) {
      $(data.person.attributes).each(function (k, v) {
        if (v.display != null) {
          if ($.trim(v.display.split("=")[0]) == "ProfileImage") {
            $('#file_upload').attr('src', returnUrl() + '/storage/documents/' + $.trim(v.display.split("=")[1]));
          }
        }
      });
    }
  });

  var date = $(this).parents('tr').find('td:nth-child(6)').text();
  var encounteruuid = $(this).parents('tr').attr('attr-encounter');

  $.ajax({
    url: returnUrl() + '/LoadListForRadiologyTestFromPHN',
    type: 'POST',
    dataType: 'json',
    data: {
      phn: phn,
      date: date,
      encounteruuid: encounteruuid
    },
    success: function (data) {

      var tr = "";
      $(data).each(function (key, val) {

        var orderBy = "";
        $.ajax({
          url: '/openmrs/ws/rest/v1/user/' + val.cby,
          type: 'GET',
          dataType: 'json',
          async: false,
          data: {},
          success: function (data) {
            orderBy = data.person.display;
          }
        });

        var test = ReturnConceptByUuid(val.test).display.split("@@")[1];
        var region = ReturnConceptByUuid(val.region).display;
        var localization = ReturnConceptByUuid(val.localization).display;
        var position = "";
        if (val.position != null) {
          position = ReturnConceptByUuid(val.position).display;
        }


        tr += "<tr attr-id='" + val.radiologyid + "'>";
        tr += "<td>" + test + "</td>";
        tr += "<td>" + region + "</td>";
        tr += "<td>" + localization + "</td>";
        tr += "<td>" + position + "</td>";
        tr += "<td>" + val.comments + "</td>";
        tr += "<td>" + val.priority + "</td>";
        tr += "<td>" + orderBy + "</td>";
        tr += "<td>" + val.cdate + "</td>";
        tr += '<td style="text-align: center; padding: 6px;">\
                       <button class="btn btn-warning btnSelectProcRow" type="button" \
                       style="padding: 2px 16px;border: 2px solid;border-radius: 15px;background: #ffc107;">\
                       Select</button></td>';
        tr += "</tr>";
      });

      $('#procConTbody').html("");
      $('#procConTbody').html(tr);
    }
  });

});

$('#attachment').on('change', function () {
  var total_file = document.getElementById("attachment").files.length;
  var fileSize = 0;
  for (var i = 0; i < total_file; i++) {

    fileSize = event.target.files[i].size;

    $('#containerImage').append(`<div class="col-md-3"><img src="${URL.createObjectURL(event.target.files[i])}" style="width: 100%; height: 150px; border: 4px solid black; padding: 1px;"/></div>`);
  }

  if (fileSize > 2097152) {
    alert('File size must not be more than 2 MB');
    $('#attachment').val('');
    $('#containerImage').html("");
  }
});

$(document).on('click', '.btnSelectProcRow', function () {

  $('#procConTbody tr').removeClass('SelectedRow');
  $(this).parents('tr').addClass('SelectedRow');
});

$('#btnsave').on('click', function () {

  var form_data = new FormData();
  var totalfiles = document.getElementById('attachment').files.length;
  for (var index = 0; index < totalfiles; index++) {
    form_data.append("files[]", document.getElementById('attachment').files[index]);
  }

  var encounteruuid = $('.SelectedRowMain').attr('attr-encounter');

  if (totalfiles == 0) {

    var phn = phnVal;
    var datetime = $('.SelectedRow td:nth-child(8)').text();
    var date = $('#Date').val();
    var time = $('#Time').val();
    var clinicStatus = $('#clinicStatus').val();
    var Reason = $('#Reason').val();
    var remark = $('#remark').val();

    $.ajax({
      url: returnUrl() + '/SaveRadiologyTestData',
      type: 'POST',
      dataType: 'json',
      async: false,
      data: {
        phnNo: phn,
        encounteruuid: encounteruuid,
        datetime: datetime,
        date: date,
        time: time,
        clinicStatus: clinicStatus,
        reason: Reason,
        remarks: remark,
        images: "",
        cby: userUuid()
      },
      success: function (data) {
        iziToast.success({
          title: 'OK',
          message: 'Radiology Test Data Saved Successfully!',
          position: 'topRight',
          onClosed: function () { location.reload(); },
        });
      }
    });
  } else {

    fetch(returnUrl() + '/UploadingRadiologyFiles', {
      method: 'POST',
      body: form_data,
    })
      .then(response => response.json())
      .then(data => {

        var images = data.toString();

        var phn = phnVal;
        var datetime = $('.SelectedRow td:nth-child(8)').text();
        var date = $('#Date').val();
        var time = $('#Time').val();
        var clinicStatus = $('#clinicStatus').val();
        var Reason = $('#Reason').val();
        var remark = $('#remark').val();

        $.ajax({
          url: returnUrl() + '/SaveRadiologyTestData',
          type: 'POST',
          dataType: 'json',
          async: false,
          data: {
            phnNo: phn,
            encounteruuid: encounteruuid,
            datetime: datetime,
            date: date,
            time: time,
            clinicStatus: clinicStatus,
            reason: Reason,
            remarks: remark,
            images: images,
            cby: userUuid()
          },
          success: function (data) {
            iziToast.success({
              title: 'OK',
              message: 'Radiology Test Data Saved Successfully!',
              position: 'topRight',
              timeout: 1000,
              onClosed: function () { location.reload(); },
            });
          }
        });
      })
      .catch(error => {
        console.error(error)
      });
  }





});

$('#btnClear').on('click', function () {
  location.reload();
});