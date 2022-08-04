/* * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
import $ from 'jquery';

(function () {
  'use strict';
  document.addEventListener("DOMContentLoaded", function(event) {
    console.log('drugsdosages OpenMRS Open Web App Started.');
    //console.log('jQuery version: ' + jquery.fn.jquery);
  });
}());

checkInstituteAdminLogin();
function checkInstituteAdminLogin() {
  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
  myHeaders.append("Cookie", "JSESSIONID=2D158E83ACFB788998C7DB495F07C1B9");

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  fetch("/openmrs/ws/rest/v1/session", requestOptions)
    .then(function (response) {
      return response.json();
    })
    .then(function (result) {
      
      var personuuid = result.user.person.uuid;
      

      var requestHeaders = new Headers();
      requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
      requestHeaders.append(
        "Cookie",
        "JSESSIONID=ED9DBD5CFD355A973EFFECD642D8331D"
      );

      var requestOptions = {
        method: "GET",
        headers: requestHeaders,
        redirect: "follow",
      };
      //person rest API
      fetch("/openmrs/ws/rest/v1/person/" + personuuid, requestOptions)
        .then(function (response) {
          return response.json();
        })
        .then(function (result) {
          
          var InstituteUuid = "";
          $(result.attributes).each(function (k, v) {
            
            if (v.display != null) {
              if ($.trim(v.display.split("=")[0]) == "Institute Id") {
                InstituteUuid = $.trim(v.display.split("=")[1]); //get the user's institute id
              }
            }
          });
       
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
          //location rest API
          fetch("/openmrs/ws/rest/v1/location/" + InstituteUuid, requestOptions)
            .then(function (response) {
              return response.json();
            })
            .then(function (result) {
              $(result.attributes).each(function (k, v) {
                if (v.display != null) {
                  var locationId = "";
        
                  if ($.trim(v.display.split(":")[0]) == "Location Id") {
                    locationId = $.trim(v.display.split(":")[1]);
                    console.log("locationId: " + locationId);

                    var instituteName = result.display;
                   
                   
                    $("#txtInstitute") //set the institute name to institute text field
                      .val(instituteName)
                      .attr("insuuid", InstituteUuid) //set institute id as attribute
                      .attr("locationid", locationId);
                      
                      
                  }
                }
              });

              
            })
            .catch(function (error) {
              return console.log("error", error);
            });
        })
        .catch(function (error) {
          return console.log("error", error);
        });
    })
    .catch(function (error) {
      return console.log("error", error);
    });
}

loadDrugDosagesToTable();

function loadDrugDosagesToTable(){

  fetch("http://localhost:8086/drugDoses/selectAllDrugDose",{
    method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
  })
  .then((response) => response.json())
  .then((result) => {
      $("#DrugsDosagesdataBody").empty();
      $.each(result, function (key, value) {
        $("#DrugsDosagesdataBody").append(
          "<tr style='text-align: center; padding-top: 2px; padding-bottom: 4px;'><td>" +
          value.doseid +
          "</td><td>" +
          value.dose +
          "</td><td>" +
          value.dosetype +
          "</td><td>" +
          value.factor +
          "</td><td>" +
          value.status +
          "</td></tr>"
        )
      })
  })
    
}

