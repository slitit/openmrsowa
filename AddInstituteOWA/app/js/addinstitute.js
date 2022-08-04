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
    console.log('Add Institute OpenMRS Open Web App Started.');
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


$("#addBtn").on("click", function () {
  var poi = $("#Poi").val();
  var str = "";
  if (poi == "") {
    iziToast.error({
      position: "bottomRight",
      title: "",
      message: "POI cannot be empty!",
    });
  } else {
    $("#example").append('<tr><td>' + poi + '</td><td><i class="icon-remove btnDelete" style="color:red;"></i></td></tr>')
    $("#Poi").val("");
  }

  $('#example tbody tr').each(function () {
    str += `${$(this).find('td:nth-child(1)').text()},`;
  });

  str = str.replace(/,\s*$/, "");
  $("#PoiHidden").val(str);
});

$("#example").on("click", ".btnDelete", function () {
  $(this).parents("tr").remove();
});

$('.hideShow').show();
$('.showHide').hide();


$('#btnClear').on('click', function (e) {
  location.reload();
});

loadProvinces();
function loadProvinces() {

  fetch(returnUrl() + '/loadProvince', {
    method: 'POST',
  })
    .then(response => response.json())
    .then(result => {

      var options = "";
      options += "<option disabled selected>--Select--</option>";
      $(result).each(function (key, val) {
        options += "<option value='" + val.location_id + "'>" + val.name + "</option>";
      });

      $('#drpPdhs').html("");
      $('#drpPdhs').html(options);

    })
    .catch(error => console.log('error', error));
}

$('#drpPdhs').on('change', function (e) {

  var provinceId = $(this).val();
  loadDistricts(provinceId);
});

function loadDistricts(provinceId) {

  $.ajax({
    url: returnUrl() + '/loadDistrict',
    type: "POST",
    dataType: "json",
    async: false,
    data: { provinceId: provinceId },
    success: function (result) {

      var options = "";
      options += "<option disabled selected>--Select--</option>";
      $(result).each(function (key, val) {
        options += "<option value='" + val.location_id + "'>" + val.name + "</option>";
      });

      $('#drpRdhs').html("");
      $('#drpRdhs').html(options);
    }
  });
}

$('.uuidfind').each(function () {
  var $this = $(this);
  var attrname = $this.attr('attr-uuid-find');

  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
  myHeaders.append("Cookie", "JSESSIONID=1A5193DBE052C38DC303BAD947A05A83");

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  fetch('/openmrs/ws/rest/v1/locationattributetype?q=' + attrname, requestOptions)
    .then(response => response.json())
    .then(result => {

      $this.attr('uuid-value', result.results[0].uuid);
    })
    .catch(error => {
      console.log(error);
    });
});

$('input').on('keyup', function () {
  $(this).addClass('changed')
});

$('input').on('change', function () {
  $(this).addClass('changed')
});

$('select:not(.locationDrp)').on('change', function () {
  $(this).addClass('changed')
});


function loadAllAttributes() {

  var instituteUuid = $('#drpLocation').val();

  var requestHeaders = new Headers();
  requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
  requestHeaders.append("Cookie", "JSESSIONID=644F0C130F7EA78D917F896CE811FBAF");

  var requestOptions = {
    method: 'GET',
    headers: requestHeaders,
    redirect: 'follow'
  };

  fetch("/openmrs/ws/rest/v1/location/" + instituteUuid + "/attribute", requestOptions)
    .then(response => response.json())
    .then(result => {

      $(result.results).each(function (k, v) {

        var attrnamedb = (v.attributeType.display);
        var attruuid = v.uuid;

        $('.uuidfind').each(function () {
          var $this = $(this);
          var attrname = $this.attr('attr-uuid-find');

          if (attrnamedb == attrname) {
            $this.attr('uuid-update-value', attruuid);
          }
        });
      });

    })
    .catch(error => console.log('error', error));
}


$('#addLocationForm').on('submit', function (e) {
  e.preventDefault();

  $('#btnSubmit').text('Please Wait!').attr('disabled', true);

  var myDate = new Date();
  var output = (myDate.getFullYear() + '-' + ('0' + (myDate.getMonth() + 1)).slice(-2) + '-' + ('0' + myDate.getDate()).slice(-2) + ' ' + myDate.getHours() + ':' + ('0' + (myDate.getMinutes())).slice(-2) + ':' + myDate.getSeconds());

  $('#txtDatetime').val(output);

  if (lookup == 0) {

    if ($('#drpMainType').val() == "Hospital") {
      if ($('#txtLocationId').val() == "" || $('#txtLocationName').val() == "") {
        iziToast.error({
          title: 'Error',
          message: 'Location Id & Lacation Name Cannot be Empty!',
          position: 'topRight',
        });

        $('#btnSubmit').text('Save').attr('disabled', false);

        return;
      }
    }

    var txtLocationName = $('#txtLocationName').val();

    var requestHeaders = new Headers();
    requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
    requestHeaders.append("Content-Type", "application/json");
    requestHeaders.append("Cookie", "JSESSIONID=644F0C130F7EA78D917F896CE811FBAF");

    var arrOfAttr = [];

    $('.uuidfind').each(function () {
      var value = $(this).val();
      var attr_uuid = $(this).attr('uuid-value');

      if (value != '' && value != null) {
        arrOfAttr.push(
          { "attributeType": attr_uuid, "value": value }
        )
      }
    });

    var raw = JSON.stringify({
      "name": txtLocationName,
      "address14": $('#drpMainType').val(),
      "address15": $('#drpSelectType').val(),
      "tags": [
        "b8bbf83e-645f-451f-8efe-a0db56f09676"
      ],
      "attributes": arrOfAttr
    });

    var requestOptions = {
      method: 'POST',
      headers: requestHeaders,
      body: raw,
      redirect: 'follow'
    };

    fetch("/openmrs/ws/rest/v1/location", requestOptions)
      .then(response => response.json())
      .then(result => {

        $('#btnSubmit').text('Save').attr('disabled', false);

        iziToast.success({
          title: 'OK',
          message: 'Location created Successfully!',
          position: 'topRight'
        });

        $('#btnClear').click();
      })
      .catch(error => console.log('error', error));
  } else {

    var instituteUuid = $('#drpLocation').val();

    $('.changed').each(function () {
      var $this = $(this);
      var attrvalueuuid = $this.attr('uuid-update-value');
      var attrname = $this.attr('attr-uuid-find');
      var attruuid = $this.attr('uuid-value');
      var value = $this.val();

      if (attrvalueuuid != undefined && value != "" && value != null) {

        var requestHeaders = new Headers();
        requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
        requestHeaders.append("Content-Type", "application/json");
        requestHeaders.append("Cookie", "JSESSIONID=644F0C130F7EA78D917F896CE811FBAF");

        var raw = JSON.stringify({ "value": value });

        var requestOptions = {
          method: 'POST',
          headers: requestHeaders,
          body: raw,
          redirect: 'follow'
        };

        fetch("/openmrs/ws/rest/v1/location/" + instituteUuid + "/attribute/" + attrvalueuuid, requestOptions)
          .then(response => response.json())
          .then(result => {
            console.log(result)
          })
          .catch(error => console.log('error', error));
      } else {

        var requestHeaders = new Headers();
        requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
        requestHeaders.append("Content-Type", "application/json");
        requestHeaders.append("Cookie", "JSESSIONID=644F0C130F7EA78D917F896CE811FBAF");

        var raw = JSON.stringify({ "attributeType": attruuid, "value": value });

        var requestOptions = {
          method: 'POST',
          headers: requestHeaders,
          body: raw,
          redirect: 'follow'
        };

        fetch("/openmrs/ws/rest/v1/location/" + instituteUuid + "/attribute", requestOptions)
          .then(response => response.json())
          .then(result => {
          })
          .catch(error => console.log('error', error));
      }

      $('#btnSubmit').text('Update').attr('disabled', false);

    });

    iziToast.success({
      title: 'OK',
      message: 'Location Updated Successfully!',
      position: 'topRight'
    });
  }

});


function loadLocations(mainType) {
  fetch(returnUrl() + '/LoadMainTypeSelectedDataLookUp', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 'mainType': mainType })
  }).then(response => response.json()).then(result => {

    var options = "";
    options += "<option disabled selected>--Select--</option>";
    $(result).each(function (key, val) {
      options += "<option value='" + val.uuid + "'>" + $.trim(val.name) + "</option>";
    });

    $('#drpLocation').html("");
    $('#drpLocation').html(options);

    if (mainType == "Hospital") {
      $('#parent').html("");
      $('#parent').html(options);
    }

  }).catch(error => console.log('error', error));
}

var lookup = 0;
$('#btnLookup').on('click', function () {

  lookup = 1;
  $('.hideShow').hide();
  $('.showHide').show();
  $('#btnSubmit').text('Update');

  var mainType = $('#drpMainType').val();

  if (mainType == "") {
    iziToast.error({
      title: 'Error',
      timeout: 1300,
      message: 'Please Select Main Type First!',
      position: 'topRight',
      onClosed: function () {
        location.reload();
      }
    });

    return;
  }

  if (mainType != "Hospital") {
    $('.hideLocationId').hide();
  }

  loadLocations(mainType);
});


$('#drpLocation').on('change', function () {

  var uuidInstitute = $(this).val();

  $('#txtLocationId').val("");
  $('#drpInstituteType').val("");
  $('#drpPdhs').val("");
  $('#drpRdhs').val("");
  $('#txtDirectorHod').val("");
  $('#txtContactNo').val("");
  $('#txtEmail').val("");
  $('#txtWebsite').val("");
  $('#drpSelectType').val("");

  loadAllAttributes();

  var requestHeaders = new Headers();
  requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
  requestHeaders.append("Cookie", "JSESSIONID=24D0761924138ED7E55C2CB6806B0633");

  var requestOptions = {
    method: 'GET',
    headers: requestHeaders,
    redirect: 'follow'
  };

  fetch("/openmrs/ws/rest/v1/location/" + uuidInstitute, requestOptions)
    .then(response => response.json())
    .then(result => {

      $('#drpSelectType').val(result.address15);
      $('#txtDatetime').val(result.description);

      var valuePdhs = "";
      $(result.attributes).each(function (k, v) {
        if (v.display != null) {

          if ($.trim(v.display.split(":")[0]) == "Location Id") {
            $('#txtLocationId').val($.trim(v.display.split(":")[1]));
          }
          if ($.trim(v.display.split(":")[0]) == "Institute Type") {
            $('#drpInstituteType').val($.trim(v.display.split(":")[1]));
          }
          if ($.trim(v.display.split(":")[0]) == "PDHS") {
            valuePdhs = $.trim(v.display.split(":")[1]);
            $('#drpPdhs').val($.trim(v.display.split(":")[1])).change();
          }
          if ($.trim(v.display.split(":")[0]) == "RDHS") {
            var rdhsValue = $.trim(v.display.split(":")[1]);
            loadDistricts(valuePdhs);
            $('#drpRdhs').val(rdhsValue);
          }
          if ($.trim(v.display.split(":")[0]) == "Director_Hod") {
            $('#txtDirectorHod').val($.trim(v.display.split(":")[1]));
          }
          if ($.trim(v.display.split(":")[0]) == "ContactNo") {
            $('#txtContactNo').val($.trim(v.display.split(":")[1]));
          }
          if ($.trim(v.display.split(":")[0]) == "HoldsContactNo") {
            $('#txtContactNoHod').val($.trim(v.display.split(":")[1]));
          }
          if ($.trim(v.display.split(":")[0]) == "Email") {
            $('#txtEmail').val($.trim(v.display.split(":")[1]));
          }
          if ($.trim(v.display.split(":")[0]) == "Address") {
            $('#txtAddress').val($.trim(v.display.split(":")[1]));
          }
          if ($.trim(v.display.split(":")[0]) == "Status") {
            $('#Status').val($.trim(v.display.split(":")[1]));
          }
          if ($.trim(v.display.split(":")[0]) == "Website") {
            $('#txtWebsite').val($.trim(v.display.split(":")[1]));
          }
          if ($.trim(v.display.split(":")[0]) == "Parent Institution") {
            $('#parent').val($.trim(v.display.split(":")[1]));
          }
          if ($.trim(v.display.split(":")[0]) == "Ownership") {
            $('#ownership').val($.trim(v.display.split(":")[1]));
          }
          if ($.trim(v.display.split(":")[0]) == "CoordsX") {
            $('#txtXcor').val($.trim(v.display.split(":")[1]));
          }
          if ($.trim(v.display.split(":")[0]) == "CoordsY") {
            $('#txtYcor').val($.trim(v.display.split(":")[1]));
          }
          if ($.trim(v.display.split(":")[0]) == "LastUpdatedOn") {
            $('#txtDatetime').val(`${$.trim(v.display.split(":")[1])}:${$.trim(v.display.split(":")[2])}:${$.trim(v.display.split(":")[3])}`);
          }
          if ($.trim(v.display.split(":")[0]) == "POI") {
            $($.trim(v.display.split(":")[1]).split(",")).each(function (k, v) {
              $("#example").append('<tr><td>' + v + '</td><td><i class="icon-remove btnDelete" style="color:red;"></i></td></tr>')
            });
          }
        }
      });
    })
    .catch(error => console.log('error', error));
});


$('#btnRetireLocation').on('click', function () {

  var uuidInstitute = $('#drpLocation').val();

  if (uuidInstitute != "" && uuidInstitute != null) {

    iziToast.show({
      theme: 'dark',
      icon: 'icon-person',
      title: 'Are You Sure You Want To Delete?',
      timeout: 10000,
      position: 'center', // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter
      progressBarColor: 'rgb(0, 255, 184)',
      buttons: [
        ['<button>Ok</button>', function (instance, toast) {

          var requestHeaders = new Headers();
          requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
          requestHeaders.append("Cookie", "JSESSIONID=644F0C130F7EA78D917F896CE811FBAF");

          var requestOptions = {
            method: 'DELETE',
            headers: requestHeaders,
            redirect: 'follow'
          };

          fetch("/openmrs/ws/rest/v1/location/" + uuidInstitute + "?!purge", requestOptions)
            .then(response => response.json())
            .then(result => {

              iziToast.success({
                title: 'OK',
                message: 'Location retired successfully!',
                position: 'topRight'
              });
            })
            .catch(error => console.log('error', error));

        }, true], // true to focus
        ['<button>Close</button>', function (instance, toast) {
          instance.hide({
            transitionOut: 'fadeOutUp',
            onClosing: function (instance, toast, closedBy) {
              console.info('closedBy: ' + closedBy); // The return will be: 'closedBy: buttonName'
            }
          }, toast, 'buttonName');
        }]
      ],
      onOpening: function (instance, toast) {
        console.info('callback abriu!');
      },
      onClosing: function (instance, toast, closedBy) {
        console.info('closedBy: ' + closedBy); // tells if it was closed by 'drag' or 'button'
      }
    });

  } else {

    iziToast.error({
      title: 'Error',
      message: 'Location Can\'t be Empty!',
      position: 'topRight'
    });
  }

});


// $('#txtLocationId').on('change', function () {
//   var value = $(this).val();

//   var regexPattern = new RegExp("^[0-9]{4}$");
//   var is_matched = regexPattern.test(value);

//   if (is_matched == false) {
//     iziToast.error({
//       title: 'Error',
//       message: 'Location ID can contain 4 digits!',
//       position: 'topRight'
//     });
//   }
// });


$('#drpMainType').on('change', function () {
  var value = $(this).val();

  if (value == "Hospital") {
    $('#showPanelHospital').show();
    $('.hideShowFkId').hide();
  } else {
    $('#showPanelHospital').hide();
    $('.hideShowFkId').show();
    $('.hideLocationId').hide();

    var preType = "";
    if (value == "District") {
      preType = "Province";
      $('#textHeading').text('Select Province');
    } else if (value == "DS Office") {
      preType = "District";
      $('#textHeading').text('Select District');
    } else if (value == "GN Division") {
      preType = "DS Office";
      $('#textHeading').text('Select DS Office');
    } else {
      $('.hideShowFkId').hide();
    }

    fetch(returnUrl() + '/LoadMainTypeSelectedData', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 'preType': preType })
    }).then(response => response.json()).then(result => {

      var options = "";
      options += "<option disabled selected>--Select--</option>";
      $(result).each(function (key, val) {
        options += "<option value='" + val.location_id + "'>" + $.trim(val.name) + "</option>";
      });

      $('#drpSelectType').html("");
      $('#drpSelectType').html(options);

    }).catch(
      error => console.log('error', error)
    );
  }
});














