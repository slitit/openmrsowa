/* * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
import $ from "jquery";

const options = [];

(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", function (event) {
    console.log("assigngnforinstitute OpenMRS Open Web App Started.");
  });
})();

//Load institute(location) to the dropdown
// loadInstitute(); //load this function when page loading
// function loadInstitute() {
//   var requestHeaders = new Headers();
//   requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
//   requestHeaders.append(
//     "Cookie",
//     "JSESSIONID=24D0761924138ED7E55C2CB6806B0633"
//   );

//   var requestOptions = {
//     method: "GET",
//     headers: requestHeaders,
//     redirect: "follow",
//   };

//   fetch("/openmrs/ws/rest/v1/location", requestOptions)
//     .then((response) => response.json())
//     .then((result) => {
//       var options = "";
//       options += "<option disabled selected>--Select--</option>";
//       $(result.results).each(function (k, v) {
//         options +=
//           "<option value='" + v.uuid + "'>" + v.display + "</option>";
//       });
//       $("#drpInstitute").html("");
//       $("#drpInstitute").html(options);
//     })
//     .catch((error) => console.log("error", error));
// }

//load GNdivitions to the dropdown(select tag)
// loadGNdivitions();
// function loadGNdivitions(){

//   fetch("http://localhost:8086/divitions/selectDivitions",{
//     method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//   })
//   .then((response) => response.json())
//   .then((result) => {
//     //console.log(result);
//     var data = "";
//       data += "<option disabled selected>--Select--</option>";

//       $(result).each(function (k, v) {
//         data +=
//           "<option value='" + v.gndivisionId + "'>" + v.gndivision + "</option>";
//           //console.log(data);
//       });
//     // console.log(result);
//     // for(var i = 0; i < result.length; i++){
//     //   var id = result[i]["gndivisionId"];

//     //   var divitions_name = result[i]["gndivision"];

//     //   var op = options.push({value: id, label: divitions_name})
//     //   console.log(op);
//     // }
//     $("#drpDivition").html("");
//     $("#drpDivition").html(data);

//   })
//   .catch((error) => {
//     console.log(error);
//   });
// }

//Load the institute according the user permission
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
      if (
        result.user.roles.filter(function (e) {
          return e.display === "System Developer";
        }).length > 0
      ) {
        $(".InstituteCont").show(); //show the institute dropdown(load all institute because super admin can view all institute)
        $(".InstituteContHide").hide(); //hide the institute textbox
      } else {
        $(".InstituteCont").hide();
        $(".InstituteContHide").show();
      }
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
              var instituteName = result.display;
              console.log(InstituteUuid);
              $("#txtInstitute") //set the institute name to institute text field
                .val(instituteName)
                .attr("insuuid", InstituteUuid); //set institute id as attribute
              instituteText(); //call this method to load GNdivitions according to the user's institute
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

//load all institute to the dropdown
loadInstitutes();
function loadInstitutes() {
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

  fetch("/openmrs/ws/rest/v1/location/", requestOptions)
    .then(function (response) {
      return response.json();
    })
    .then(function (result) {
      var options = "";
      options += "<option disabled selected>--Select--</option>";
      $(result.results).each(function (key, val) {
        options +=
          "<option value='" +
          val.uuid +
          "'>" +
          $.trim(val.display) +
          "</option>";
      });

      $("#drpInstitute").html("");
      $("#drpInstitute").html(options);
    })
    .catch(function (error) {
      return console.log("error", error);
    });
}

//Load Gndivitions according to the distric
function gnDivitions(distictId) {
  console.log("dis ID: " + distictId);
  fetch("http://localhost:8086/divitions/getDivitions?District=" + distictId, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((result) => {
      var options = "";
      options += "<option disabled selected>--Select--</option>";
      $(result).each(function (key, val) {
        options +=
          "<option value='" +
          val.gndivisionId +
          "'>" +
          val.gndivision +
          "</option>";
      });

      $("#drpDivition").html("");
      $("#drpDivition").html(options);
    })
    .catch((error) => console.log("error", error));
}

//Load Gndivitions according to the institute changes(dropdown)
$("#drpInstitute").on("change", function () {
  $("#drpDivition").empty();
  var uuidInstitute = $(this).val();

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

  fetch("/openmrs/ws/rest/v1/location/" + uuidInstitute, requestOptions)
    .then((response) => response.json())
    .then((result) => {
      $(result.attributes).each(function (k, v) {
        if (v.display != null) {
          var distictId = "";

          if ($.trim(v.display.split(":")[0]) == "RDHS") {
            distictId = $.trim(v.display.split(":")[1]);
            console.log("distictId: " + distictId);
            gnDivitions(distictId); //call this method load GNdivitions according to the distric
          }
        }
      });
    })
    .catch((error) => console.log("error", error));
});

function instituteText() {
  //console.log($("#txtInstitute").attr("insuuid"));
  var uuidInstitute = $("#txtInstitute").attr("insuuid");
  //console.log(uuidInstitute);
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

  fetch("/openmrs/ws/rest/v1/location/" + uuidInstitute, requestOptions)
    .then((response) => response.json())
    .then((result) => {
      $(result.attributes).each(function (k, v) {
        if (v.display != null) {
          var distictId = "";

          if ($.trim(v.display.split(":")[0]) == "RDHS") {
            distictId = $.trim(v.display.split(":")[1]);
            console.log("distictId: " + distictId);
            gnDivitions(distictId);
          }
        }
      });
    })
    .catch((error) => console.log("error", error));
}
