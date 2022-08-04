/* * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
import jquery from 'jquery';

(function () {
  'use strict';
  document.addEventListener("DOMContentLoaded", function (event) {
    console.log('generalexaminationcriteria OpenMRS Open Web App Started.');
    console.log('jQuery version: ' + jquery.fn.jquery);
  });
}());

//Page refresh
$('#btnCancel').on('click', function (e) {
  $('#generalexaminationForm')[0].reset();
});

loadInstitute(); //load this function when page loading
function loadInstitute() {
  var requestHeaders = new Headers();
  requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
  requestHeaders.append(
    "Cookie",
    "JSESSIONID=24D0761924138ED7E55C2CB6806B0633"
  );

  var requestOptions = {
    method: "GET",
    headers: requestHeaders,
    redirect: "follow",
  };

  fetch("/openmrs/ws/rest/v1/location", requestOptions)
    .then((response) => response.json())
    .then((result) => {
      var options = "";
      options += "<option disabled selected>--Select--</option>";
      $(result.results).each(function (k, v) {
        options +=
          "<option value='" + v.uuid + "'>" + v.display + "</option>";
      });
      $("#institute").html("");
      $("#institute").html(options);
    })
    .catch((error) => console.log("error", error));
}


