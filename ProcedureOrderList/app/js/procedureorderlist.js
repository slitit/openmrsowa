/* * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
import jquery from "jquery";

(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", function (event) {
    console.log("procedureorderlist OpenMRS Open Web App Started.");
    console.log("jQuery version: " + jquery.fn.jquery);
  });
  fetchTable();
})();


function initTable() {
  return $("#example").dataTable({
   "scrollX": true,
   // paginate: false,
    //retrieve: true,
	  "bDestroy": true
	
  });
}


function fetchTable() {
  //$("#example").DataTable().clear().destroy();
  $.ajax({
    type: "GET",
    url: "http://127.0.0.1:8000/procedureOrder",
    dataType: "json",
    success: function (data) {
      $("#example").DataTable().clear().destroy();
      $.each(data.person, function (i, item) {
        $("tbody").append(
          "<tr>\
            <td>" +
            item.ward +
            "</td>\
            <td>" +
            item.bhtno +
            "</td>\
			 <td>" +
            item.phnno +
            "</td>\
            <td>" +
            item.given_name +
            " " +
            item.middle_name +
            " " +
            item.family_name +
            "</td>\
            <td>" +
            item.gender +
            "</td>\
            <td>" +
            item.age +
            "</td>\
            <td>" +
            item.admission_date +
            "</td>\
			 <td>" +
            item.username +
            "</td>\
			 <td>" +
            item.cdate +
            "</td>\
			 <td>" +
            item.proceduretype +
            "</td>\
			 <td>" +
            item.injection +
            "</td>\
            <td>" +
            item.remark +
            '</td>\
            <td><button type="button" value="' +
            item.phnno +
            '"class="btn btn-block btn-success" style="background:#00463f;border-color:#00463f;" id="btnSelect">Select</button></td>\
            </tr>\''
        );
      });
      $("#example").DataTable();
    initTable();
    },
  });
}






$(document).on("click", "#btnSelect", function (e) {
  // var number = $(this).val();
  var ward = $(this).closest("tr").find("td:eq(0)").text();
  var bhtno = $(this).closest("tr").find("td:eq(1)").text();
  var phnno = $(this).closest("tr").find("td:eq(2)").text();
  var given_name = $(this).closest("tr").find("td:eq(3)").text();
  var gender = $(this).closest("tr").find("td:eq(4)").text();
  var age = $(this).closest("tr").find("td:eq(5)").text();
  var admission_date = $(this).closest("tr").find("td:eq(6)").text();
  var username = $(this).closest("tr").find("td:eq(7)").text();
  var cdate = $(this).closest("tr").find("td:eq(8)").text();
  var proceduretype = $(this).closest("tr").find("td:eq(9)").text();
  var injection = $(this).closest("tr").find("td:eq(10)").text();
  var remark = $(this).closest("tr").find("td:eq(11)").text();

  location.href =
    "/openmrs/owa/procedureroom/index.html?ward=" +
    ward +
    "&phnno=" +
    phnno +
    "&bhtno=" +
    bhtno +
    "&gender=" +
    gender +
    "&age=" +
    age +
    "&admitted_date=" +
    admission_date +
    "&cdate=" +
    cdate +
    "&given_name=" +
    given_name +
    "&proceduretype=" +
    proceduretype +
    "&injection=" +
    injection +
    "&remark=" +
    remark +
    "&username=" +
    username;
});
