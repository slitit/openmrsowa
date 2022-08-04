/* * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
import $ from 'jquery';
import Swal from 'sweetalert2';

(function () {
  'use strict';
  document.addEventListener("DOMContentLoaded", function (event) {
    console.log('Token Issue OpenMRS Open Web App Started...');
  });
}());

var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

today = mm + '/' + dd + '/' + yyyy;
$('#txtDate').val(today);

$('#txtBarcode').focus();


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


function returnUrlQmsApi() {

  var value = "";

  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
  myHeaders.append("Cookie", "JSESSIONID=4F55735593751E224686B006CD388234");

  $.ajax({
    url: '/openmrs/ws/rest/v1/conceptreferenceterm?codeOrName=QmsApi',
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


loadInstituteName();
var sectionId = "";
var InstituteUuid = "";
var UserUuid = "";
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

      var personuuid = UserUuid = result.user.person.uuid;

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

          loadQueues(InstituteUuid);

          fetch("/openmrs/ws/rest/v1/location/" + InstituteUuid, requestOptions)
            .then(response => response.json())
            .then(result => {

              var instituteName = result.display;
              $("#instituteName").val(instituteName);
            })
            .catch(error => console.log('error', error));

        })
        .catch(error => console.log('error', error));
    })
    .catch(error => console.log('error', error));
}


function loadQueues(InstituteUuid) {

  fetch(returnUrlQmsApi() + "/queue/view_all/" + InstituteUuid, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(response => response.json())
    .then(result => {
      var html = "";
      var isAssingFrist = "";
      $(result).each(function (key, val) {
        html += "<option value=" + val.id + ">" + val.queueName + "</option>";
        if (isAssingFrist == "") {
          isAssingFrist = val.id;
        }
      });
      $('#drpQueue').append(html);
      $('#drpQueue').val(isAssingFrist).change();

    })
    .catch(error => console.log('error', error));

}


$("#txtBarcode").keypress(function (e) {
  if (e.which == 13) {
    e.preventDefault();

    var phnVal = $("#txtBarcode").val();
    $('#patientName').val("");

    $.ajax({
      url: returnUrl() + "/getPersonUUidFromPHN",
      type: "POST",
      dataType: "json",
      data: { phn: phnVal },
      success: function (data) {
        var personUUID = data.uuid;

        var requestHeaders = new Headers();
        requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
        requestHeaders.append("Cookie", "JSESSIONID=ED9DBD5CFD355A973EFFECD642D8331D");

        var requestOptions = {
          method: 'GET',
          headers: requestHeaders,
          redirect: 'follow'
        };

        fetch("/openmrs/ws/rest/v1/person/" + personUUID + "", requestOptions)
          .then(response => response.json())
          .then(result => {

            $('#patientName').val("");
            $('#patientName').val(result.display);

          }).catch((error) => {
            console.log(error);
          });
      }
    });
  }
});


$('#btnIssue').on('click', function () {

  var barcode = $('#txtBarcode').val();
  var queueId = $('#drpQueue').val();

  if (barcode == "") {

    iziToast.error({
      title: 'Error',
      message: 'Please barcode enter!',
    });
  } else if (queueId == "") {
    iziToast.error({
      title: 'Error',
      message: 'Please select queue!',
    });
  } else {

    var counterId = null;

    fetch(returnUrlQmsApi() + "/tokenissue/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        queue: { id: queueId },
        counter: { id: 1 },
        instituteId: InstituteUuid,
        createBy: UserUuid,
        active: 1,
        phn: barcode,
      }),
    }).then((response) => response.json())
      .then((result) => {

        if (result.status == "Successfully saved!") {

          Swal.fire('Token issued!', result.data.tokennumber, 'success');
          print(result.data);
        } else if (result.status == "Invalid token frequency") {

        } else {

        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
});


function print(data) {
  var mywindow = window.open("", "PRINT", "height=400,width=600");

  mywindow.document.write(
    '<div style="text-align:center;border-style: solid;border-spacing: 15px 50px; ">'
  );

  mywindow.document.write("<br/>");

  mywindow.document.write('<div style="font-size: 30px;">');
  mywindow.document.write('');
  mywindow.document.write("</div>");

  mywindow.document.write('<div style="font-size: 20px;">');
  mywindow.document.write("Token Number" + "</br>");
  mywindow.document.write("</div>");

  mywindow.document.write('<div style="font-size: 60px;">');
  mywindow.document.write(data.tokennumber);
  mywindow.document.write("</div>");

  mywindow.document.write('<div style="font-size: 20px;">');
  mywindow.document.write(data.date + " / " + data.time);
  mywindow.document.write("</div>");

  if (data.counter != null) {
    mywindow.document.write('<div style="font-size: 20px;">');
    mywindow.document.write(data.counter);
    mywindow.document.write("</div>");
  }

  if (data.footer != null) {
    mywindow.document.write('<div style="font-size: 20px;">');
    mywindow.document.write(data.footer);
    mywindow.document.write("</div>");
  }
  mywindow.document.write("<br/>");

  mywindow.document.write("</div>");

  mywindow.document.close();
  mywindow.focus();

  mywindow.print();
};

 // var myHeaders = new Headers();
 // myHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
 // myHeaders.append("Cookie", "JSESSIONID=2D158E83ACFB788998C7DB495F07C1B9");

 // var requestOptions = {
 //   method: 'GET',
 //   headers: myHeaders,
 //   redirect: 'follow'
 // };

  // get location data
  //fetch("/openmrs/ws/rest/v1/session", requestOptions)
   // .then(response => response.json())
  //  .then(result => {

   //   var instituteUuid = (result.sessionLocation.uuid);
   //   var userid = (result.user.uuid);

   //   fetch("http://123.231.114.160:8084/tokenissue/save", {
   //     method: "POST",
  //      headers: { "Content-Type": "application/json" },
  //      body: JSON.stringify({
  //        queue: { id: queueId },
  //        tokenType: { id: tokenTypeId },
   //       counter: { id: counterId },
  //        instituteId: instituteUuid,
   //       createBy: userid,
   //       active: 1,
   //     }),
   //   })
   //     .then((response) => response.json())
    //    .then((result) => {
    //      alert('ok')
   //     })
    //    .catch((error) => {
    //      console.log(error);
    //    });

   // })
   // .catch(error => console.log('error', error));
//});



