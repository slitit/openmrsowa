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
    console.log('Receive Drugs Approval OpenMRS Open Web App Started.');
  });
}());


var sectionId = "";
var InstituteUuid = "";
var LocationId = "";
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

          LoadPendingData();

          fetch("/openmrs/ws/rest/v1/location/" + InstituteUuid, requestOptions)
            .then(response => response.json())
            .then(result => {

              var instituteName = result.display;
              $("#lblInstituteName").text(instituteName);

              $(result.attributes).each(function (k, v) {
                if (v.display != null) {

                  if ($.trim(v.display.split(":")[0]) == "Location Id") {
                    LocationId = $.trim(v.display.split(":")[1]);
                  }
                }
              });


              console.log('Location Id: ' + LocationId)
            })
            .catch(error => console.log('error', error));

        })
        .catch(error => console.log('error', error));
    })
    .catch(error => console.log('error', error));
}

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

function cbyUuid() {

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

//======================================================================


function LoadPendingData() {
  $.ajax({
    url: returnUrl() + '/LoadPendingDrugReceive',
    type: 'POST',
    dataType: 'json',
    data: { InstituteUuid: InstituteUuid },
    success: function (data) {

      $('#tblDrugReceivePendingList').html("");

      $(data).each(function (k, v) {
        $('#tblDrugReceivePendingList').append(`<tr attr-id="${v.id}" attr-data="${v.receive_drug_details}">
          <td>${(v.received_from == null) ? "" : v.received_from}</td>
          <td>${(v.received_to == null) ? "" : v.received_to}</td>
          <td>${(v.order_no == null) ? "" : v.order_no}</td>
          <td>${(v.supliers == null) ? "" : v.supliers}</td>
          <td>${v.grn_no}</td>
          <td>${(v.receive_date == null) ? "" : v.receive_date}</td>  
          <td>${(v.remarks == null) ? "" : v.remarks}</td>      
        </tr>`);
      });
    }
  });
}


var serial = 0;
$(document).on('click', '#tblDrugReceivePendingList tr', function () {
  var tr = $(this);

  $('#drpReceivedFrom').val("");
  $('#drpReceivedTo').val("");
  $('#drpOrderNo').val("");
  $('#txtRemark').val("");
  $('#txtSupplier').val("");
  $('#txtReceiveDate').val("");
  $('#tblDrugReceive').html("");

  var value = serial = tr.attr('attr-id');

  $.ajax({
    url: returnUrl() + '/LoadDataWithGrnNoPending',
    type: 'POST',
    dataType: 'json',
    data: { GrnNo: value },
    success: function (datax) {

      var data = datax.receivedrugs[0];

      $('#drpReceivedFrom').val(data.received_from);
      $('#drpReceivedTo').val(data.received_to);
      $('#drpOrderNo').val(data.order_no);
      $('#txtRemark').val(data.remarks);
      $('#txtSupplier').val(data.supliers);
      $('#txtReceiveDate').val(data.receive_date);

      $(datax.receivedrugsdetails).each(function (key, val) {

        var drugUuid = val.drug_uuid;
        var drugName = val.drug_name;
        var expiryDate = (val.expire_date == null) ? "" : val.expire_date;
        var batchNo = (val.batch_no == null) ? "" : val.batch_no;
        var qty = (val.quantity == null) ? "" : val.quantity;
        var unitPrice = (val.unit_price == null) ? "" : val.unit_price;
        var remarks = (val.remarks == null) ? "" : val.remarks;

        $('#tblDrugReceive').append(`<tr attr-id="${val.id}">
            <td attr-uuid="${drugUuid}">${drugName}</td>
            <td>${expiryDate}</td>
            <td>${batchNo}</td>
            <td>${qty}</td>
            <td>${unitPrice}</td>
            <td>${remarks}</td>
            <td><input type="radio" name="drugApproval${key}" value="Approve" class="rdoApprove radionBtn"/></td>
            <td><input type="radio" name="drugApproval${key}" value="Reject" class="rdoReject radionBtn"/></td>
          </tr>`);
      });
    }
  });

});


$(document).on('change', '.radionBtn', function () {
  var value = $(this).val();
  $(this).parents('tr').attr('attr-type', value);
});


$('#btnSave').on('click', function () {

  var tr = $('#tblDrugReceive tr').length;

  var serialX = serial;

  var array = [];
  var co = 0;
  $('#tblDrugReceive tr').each(function () {

    var $this = $(this);

    if ($this.attr('attr-type')) {
      co++;
    }

    var id = $this.attr('attr-id');
    var stat = $this.attr('attr-type');
    var strength = $this.find('td:nth-child(1)').text().split(')')[1].split('-')[1].trim();
    var drug = $this.find('td:nth-child(1)').attr('attr-uuid');
    var qty = $this.find('td:nth-child(4)').text();
    var batch_no = $this.find('td:nth-child(3)').text();

    array.push([id, stat, drug, strength, qty, batch_no]);
  });

  if (tr != co) {
    iziToast.error({
      title: 'Error',
      message: 'Please select type for all rows!',
      position: 'topRight',
      timeout: 5000,
    });

    return;
  }

  $.ajax({
    url: returnUrl() + '/UpdateApprovalReceiveDrugs',
    type: 'POST',
    dataType: 'json',
    data: {
      serialX: serialX, array: array, cby: cbyUuid(), InstituteUuid: InstituteUuid
    },
    success: function (data) {

      iziToast.success({
        title: 'OK',
        message: 'Data Saved Successfully!',
        position: 'topRight',
        timeout: 1000,
        onClosing: function () {
          location.reload();
        }
      });
    }
  });
});


$('#btnCancel').on('click', function () {
  location.reload();
});