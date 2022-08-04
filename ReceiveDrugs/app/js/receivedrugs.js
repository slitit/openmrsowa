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
    console.log('Receive Drugs OpenMRS Open Web App Started.');
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
          LoadReceiveToFun();

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


//=========================================================================================


function LoadReceiveToFun() {

  $.ajax({
    url: returnUrl() + '/LoadDifSectionsForInstitute',
    type: "POST",
    dataType: "json",
    async: false,
    data: { InstituteUuid: InstituteUuid, type: 'Store' },
    success: function success(data) {

      var options = "";
      options += "<option disabled selected>--Select--</option>";
      $(data).each(function (key, val) {
        options += "<option value='" + val.uuid + "'>" + val.name + "</option>";
      });

      $('#drpReceivedTo').html("");
      $('#drpReceivedTo').html(options);

      $('#drpReceivedTo').select2({
        dropdownAutoWidth: true,
        width: '100%'
      });
    }
  });
}

LoadDrugNames();
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

      var array = [];
      var option = "";
      option += '<option value="" selected disabled>--- Select ---</option>';
      $(data.setMembers).each(function (key, val) {

        var name = val.display.split("@@")[1] + ' - ' + val.display.split("@@")[2];
        var type = val.display.split("@@")[5];
        var measuringUnit = val.display.split("@@")[3];

        $(val.display.split("@@")[9].split("###")).each(function (k, v) {
          var strength = v.split("^^^")[0];
          if (!array.includes(name)) {
            array.push(name);
            option += `<option attr-value="${val.display}" value="${val.uuid}">(${name}) - ${strength} - ${type} - ${measuringUnit}</option>`;
          }
        });

      });

      $('#drpDrugName').html("");
      $('#drpDrugName').html(option);

      $('#drpDrugName').select2({
        placeholder: "(GenericName - BrandName) - Strength - Type - MeasuringUnit",
        dropdownAutoWidth: true,
        width: '100%'
      });
    }
  });
}

$('#btnAddToGrid').on('click', function () {
  var drugUuid = $('#drpDrugName').val();
  var drugName = $('#drpDrugName option:selected').text();
  var expiryDate = ($('#txtExpireDate').val() == "") ? '' : $('#txtExpireDate').val();
  var batchNo = ($('#txtBatchNo').val() == "") ? '' : $('#txtBatchNo').val();
  var qty = $('#txtQty').val();
  var unitPrice = $('#txtUnitPrice').val(); 
  var remark = ($('#txtRemarkGrid').val() == "") ? '' : $('#txtRemarkGrid').val();

  if (batchNo == "" || qty == "" || unitPrice == "") {
    iziToast.error({
      title: 'Error!',
      message: 'Qty, Batch No and Unit Price Required!',
      position: 'topRight',
      timeout: 2000,
    });

    return;
  }

  $('#tblDrugReceive').append(`<tr>
        <td attr-uuid="${drugUuid}">${drugName}</td>
        <td>${expiryDate}</td>
        <td>${batchNo}</td>
        <td>${qty}</td>
        <td>${parseFloat(unitPrice).toFixed(2)}</td>
        <td>${remark}</td>
        <td><span class="fa fa-close deleteRowRDs" style="color: red; font-size: 20px;"></span></td>
      </tr>`);

  $('.clrRow').val("");
  $("#drpDrugName").val("").trigger('change.select2');
});

var lookup = 0;
$('#btnSave').on('click', function () {

  var receivedFrom = $('#drpReceivedFrom').val();
  var receivedTo = $('#drpReceivedTo').val();
  var orderNo = $('#drpOrderNo').val();
  var remark = $('#txtRemark').val();
  var supplier = $('#txtSupplier').val();
  var receiveDate = $('#txtReceiveDate').val();

  if (receiveDate == "") {
    iziToast.error({
      title: 'Error!',
      message: 'Receive Date Required!',
      position: 'topRight',
      timeout: 2000,
    });

    return;
  }

  var array = [];
  $('#tblDrugReceive tr').each(function (k, v) {
    var $this = $(this);
    var drugUuid = $this.find('td:nth-child(1)').attr('attr-uuid');
    var drugText = $this.find('td:nth-child(1)').text();
    var expiryDate = $this.find('td:nth-child(2)').text();
    var batchNo = $this.find('td:nth-child(3)').text();
    var qty = $this.find('td:nth-child(4)').text();
    var unitPrice = $this.find('td:nth-child(5)').text();
    var remark = $this.find('td:nth-child(6)').text();

    array.push([drugUuid, expiryDate, batchNo, qty, unitPrice, remark, drugText]);
  });

  if (lookup == 0) {

    $.ajax({
      url: returnUrl() + '/SaveReceiveDrugs',
      type: 'POST',
      dataType: 'json',
      data: {
        receivedFrom: receivedFrom, receivedTo: receivedTo, orderNo: orderNo, remark: remark,
        supplier: supplier, receiveDate: receiveDate, array: array, cby: cbyUuid(),
        LocationId: LocationId, InstituteUuid: InstituteUuid
      },
      success: function (data) {

        iziToast.success({
          title: 'GRN NO: ' + data.GrnNo,
          message: 'Data Saved Successfully!',
          position: 'topRight',
          timeout: 10000,
        });

        $('#drpReceivedFrom').val("");        
        $("#drpReceivedTo").val("").trigger('change.select2');
        $('#drpOrderNo').val("");
        $('#txtRemark').val("");
        $('#txtSupplier').val("");
        $('#txtReceiveDate').val("");
        $('#tblDrugReceive').html("");
      }
    });
  } else {

    var GrnNo = $('#drpGrnNo').val();

    $.ajax({
      url: returnUrl() + '/UpdateReceiveDrugs',
      type: 'POST',
      dataType: 'json',
      data: {
        receivedFrom: receivedFrom, receivedTo: receivedTo, orderNo: orderNo, remark: remark,
        supplier: supplier, receiveDate: receiveDate, array: array, cby: cbyUuid(),
        InstituteUuid: InstituteUuid, id: GrnNo
      },
      success: function (data) {

        iziToast.success({
          title: 'OK',
          message: 'Data Updated Successfully!',
          position: 'topRight',
          timeout: 10000,
        });

        $('#drpReceivedFrom').val("");                
        $("#drpReceivedTo").val("").trigger('change.select2');
        $('#drpOrderNo').val("");
        $('#txtRemark').val("");
        $('#txtSupplier').val("");
        $('#txtReceiveDate').val("");
        $('#tblDrugReceive').html("");
      }
    });
  }

});

$('#btnCancel').on('click', function () {
  location.reload();
});

$('#btnLookUp').on('click', function () {

  $('.hideRow').show();
  $('#btnSave').text('Update');
  lookup = 1;

  $.ajax({
    url: returnUrl() + '/LoadGRNNos',
    type: 'POST',
    dataType: 'json',
    data: { InstituteUuid: InstituteUuid },
    success: function (data) {

      var options = "";
      options += "<option disabled selected value=''>--Select--</option>";
      $(data).each(function (key, val) {
        options += "<option value='" + val.id + "'>" + (val.grn_no) + "</option>";
      });

      $('#drpGrnNo').html("");
      $('#drpGrnNo').html(options);

      $('#drpGrnNo').select2({
        dropdownAutoWidth: true,
        width: '100%'
      });
    }
  });

  $("html, body").animate({ scrollTop: 0 }, "slow");
});

$('#drpGrnNo').on('change', function () {

  $('#drpReceivedFrom').val("");          
  $("#drpReceivedTo").val("").trigger('change.select2');
  $('#drpOrderNo').val("");
  $('#txtRemark').val("");
  $('#txtSupplier').val("");
  $('#txtReceiveDate').val("");
  $('#tblDrugReceive').html("");

  var value = $(this).val();

  $.ajax({
    url: returnUrl() + '/LoadDataWithGrnNo',
    type: 'POST',
    dataType: 'json',
    data: { GrnNo: value },
    success: function (datax) {

      var data = datax.receivedrugs[0];

      $('#drpReceivedFrom').val(data.received_from);              
      $("#drpReceivedTo").val(data.received_to).trigger('change.select2');
      $('#drpOrderNo').val(data.order_no);
      $('#txtRemark').val(data.remarks);
      $('#txtSupplier').val(data.supliers);
      $('#txtReceiveDate').val(data.receive_date);

      $(datax.receivedrugsdetails).each(function (key, val) {

        var drugUuid = val.drug_uuid;
        var drugName = val.drug_name;
        var expiryDate = val.expire_date;
        var batchNo = val.batch_no;
        var qty = val.quantity;
        var unitPrice = val.unit_price;
        var remarks = val.remarks;

        $('#tblDrugReceive').append(`<tr>
            <td attr-uuid="${drugUuid}">${drugName}</td>
            <td>${expiryDate}</td>
            <td>${batchNo}</td>
            <td>${qty}</td>
            <td>${unitPrice}</td>
            <td>${remarks}</td>
            <td><span class="fa fa-close deleteRowRDs" style="color: red; font-size: 20px;"></span></td>
          </tr>`);
      });

    }
  });
});

$(document).on('click', '.deleteRowRDs', function () {
  $(this).parents('tr').remove();
});

$('#drpReceivedFrom').on('change', function () {
  var value = $(this).val();
  if (value == "Other Source") {
    $('#txtSupplier').attr('disabled', false);
  } else {
    $('#txtSupplier').attr('disabled', true);
  }
});