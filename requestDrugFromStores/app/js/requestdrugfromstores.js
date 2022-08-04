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
    console.log("requestdrugfromstores OpenMRS Open Web App Started.");
    console.log("jQuery version: " + jquery.fn.jquery);
  });
  dropDownDrugName();
  dropDownSection();
  initComponent();
})();

//reset Fields------------------------------------------------------------------------
function resetFeilds() {
  ////,,,,,
  //$("#InsName").val(null);
  $("#drpRequestFrom").val(null).trigger("change");
  $("#txtRequestOrderNO").val(null);
  $("#exaDate").val(null);
  $("#txtRemark").val(null);
  $("#drpRequestType").val(null).trigger("change");
  $("#txBhtNO").val(null);

  $("#drpDrugName").val(null).trigger("change");
  $("#txtQuantity").val(null);
  $("#remarksDrug").val(null);
}

var IPaddress = "localhost";

var InstituteUuidGloble = "";
var UserUuidGloble = "";
var UserUuidGloble = "";
var InstituteNameGloble = "";
var GlobalLocationID = "";

function initComponent() {
  console.log("initComponent");

  var id = "";
  var userName = "";
  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
  myHeaders.append("Cookie", "JSESSIONID=2D158E83ACFB788998C7DB495F07C1B9");

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  fetch("/openmrs/ws/rest/v1/session", requestOptions)
    .then((response) => response.json())
    .then((result) => {
      id = result.user.person.uuid;
      userName = result.user.display;
      UserUuidGloble = result.user.person.uuid;
      //  window.open("http://localhost:3000?id="+id+"");

      console.log("Before Id" + id);
      getPersondetais(id, userName);
    })
    .catch((error) => console.log("error", error));
}

function getPersondetais(userId, userName) {
  UserUuidGloble = userId;
  var requestHeaders = new Headers();
  requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
  requestHeaders.append(
    "Cookie",
    "JSESSIONID=ED9DBD5CFD355A973EFFECD642D8331D"
  );
  var instituteId = "";
  var requestOptions = {
    method: "GET",
    headers: requestHeaders,
    redirect: "follow",
  };

  fetch("/openmrs/ws/rest/v1/person/" + userId + "", requestOptions)
    .then((response) => response.json())
    .then((result) => {
      console.log(result.attributes);

      instituteId = result.attributes[1].display.split("=")[1].trim();
      if (instituteId == "true") {
        instituteId = result.attributes[0].display.split("=")[1].trim();
        InstituteUuidGloble = instituteId;
        getInstituteName(userId, userName, instituteId);

        setLocationID(instituteId);
      } else {
        InstituteUuidGloble = instituteId;
        getInstituteName(userId, userName, instituteId);

        setLocationID(instituteId);
      }
    })
    .catch((error) => console.log("error", error));
}

function getInstituteName(userId, userName, instituteId) {
  var InstituteName = "";
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

  fetch("/openmrs/ws/rest/v1/location/" + instituteId + "", requestOptions)
    .then((response) => response.json())
    .then((result) => {
      InstituteName = result.display;

      $("#InsName").val(InstituteName);
      InstituteNameGloble = "";
      InstituteNameGloble = InstituteName;
      loadeReferenceNumberce();
    })
    .catch((error) => console.log("error", error));
}

function setLocationID(instituteId) {
  var requestHeaders = new Headers();
  requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
  requestHeaders.append(
    "Cookie",
    "JSESSIONID=ED9DBD5CFD355A973EFFECD642D8331D"
  );

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
  //location rest API
  fetch("/openmrs/ws/rest/v1/location/" + instituteId, requestOptions)
    .then(function (response) {
      return response.json();
    })
    .then((result) => {
      $(result.attributes).each(function (k, v) {
        if (v.display != null) {
          var locationId = "";

          if ($.trim(v.display.split(":")[0]) == "Location Id") {
            locationId = $.trim(v.display.split(":")[1]);
            console.log("locationId: " + locationId);

            GlobalLocationID = locationId;
          }
        }
      });
    });
}

/// add data to the table------------------------------------------------------------------------
$("#btnAdd").on("click", function () {
  var drugname = $("#drpDrugName option:selected").text();
  var quantity = $("#txtQuantity").val();
  var remarks = $("#remarksDrug").val();
  var t = $("#example").DataTable();

  if ($("#drpDrugName").find(":selected").prop("disabled")) {
    iziToast.error({
      position: "bottomRight",
      title: "",
      message: "Drugname type cannot be empty!",
    });
  } else if (quantity == "") {
    iziToast.error({
      position: "bottomRight",
      title: "",
      message: "Quantity cannot be empty!",
    });
  } else if (remarks == "") {
    iziToast.error({
      position: "bottomRight",
      title: "",
      message: "Remarks cannot be empty!",
    });
  } else {
    t.row
      .add([
        drugname,
        quantity,
        remarks,
        '<button type="button" class="btn btn-default" id="btnDelete"><i class="fa fa-close" style="color:red;"></i></button>',
      ])
      .draw(false);
    $("#drpDrugName").val(null).trigger("change");
    $("#txtQuantity").val(null);
    $("#remarksDrug").val(null);
  }
});

//delete Table row------------------------------------------------------------------------
$("#example").on("click", "#btnDelete", function () {
  var table = $("#example").DataTable();
  table.row($(this).parents("tr")).remove().draw(false);
});

//DrugName DropDown--------------------------------------------------------------------------
function dropDownDrugName() {
  fetch("http://127.0.0.1:8000/drugnameRequest", {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      // 'Origin, X-Requested-With, Content-Type, Accept':'*'
    },
  })
    .then((response) => response.json())
    .then((data) => {
      var drugnamedrop = document.getElementById("drpDrugName");

      const drugname = data.map((element) => {
        return element.drug_name;
      });

      drugname.forEach((drugname) => {
        var ele = document.createElement("option");
        ele.textContent = drugname;
        ele.value = drugname;
        drugnamedrop.appendChild(ele);
      });
    });
}

//load Section-------------------------------------------------------------------------------------
function dropDownSection() {
  fetch("http://127.0.0.1:8000/getSectionNameRequest", {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      // 'Origin, X-Requested-With, Content-Type, Accept':'*'
    },
  })
    .then((response) => response.json())
    .then((data) => {
      var sectionnamedrop = document.getElementById("drpRequestFrom");

      const sectionname = data.map((element) => {
        return element.section_name;
      });

      sectionname.forEach((sectionname) => {
        var ele = document.createElement("option");
        ele.textContent = sectionname;
        ele.value = sectionname;
        sectionnamedrop.appendChild(ele);
      });
    });
}

//save data textfield data-------------------------------------------------------------------------
$("#saveBtn").on("click", function () {
  
  requestDrug();


  //Generate Request Order Number-----------------------------------------------------------------
  now = new Date();
  randomNum = "";
  randomNum += now.getTime().toString().slice(-4);
  document.getElementById("txtRequestOrderNO").value = randomNum;
});

function requestIns() {
  var insname = $("#InsName").val();
  var dates = $("#exaDate").val();
  var section = $("#drpRequestFrom option:selected").val();
  var type = $("#drpRequestType option:selected").val();
  var remark = $("#txtRemark").val();
  var bth = $("#txBhtNO").val();
  var order_no = $("#txtRequestOrderNO").val();

  if (dates == "") {
    iziToast.error({
      title: "Error",
      message: "Please select Date",
    });
  } else if ($("#drpRequestFrom").find(":selected").prop("disabled")) {
    iziToast.error({
      title: "Error",
      message: "Please select Section",
    });
  } else if (remark == "") {
    iziToast.error({
      title: "Error",
      message: "Please add remark",
    });
  } else if (type == "") {
    iziToast.error({
      title: "Error",
      message: "Please Select Type",
    });
  } else {
    fetch("http://127.0.0.1:8000/saveRequestdetails", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        // 'Origin, X-Requested-With, Content-Type, Accept':'*'
      },
      body: JSON.stringify({
        institute: insname,
        section: section,
        type: type,
        remark: remark,
        dates: dates,
        bth: bth,
        order_no: order_no,
      }),
    })
      .then((response) => response.text())
      .then((data) => {
        {
          if (data == "200") {
            console.log("Data Saved");
          } else {
            alert(data);
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
}

function requestDrug() {
  var bool = false;
  var table = $("#example").DataTable();
  var isEmpty = table.rows().count() === 0;
  if (isEmpty) {
    iziToast.error({
      title: "Error",
      message: "Please add drug details",
    });
  } else {
    //save data text field data-------------------------------------------------------------------------
    requestIns();

    //get Data Table data and save------------------------------------------------------------------------
    var bool = false;
    $("#example > tbody > tr").each(function () {
      var drugname = $(this).find("td:eq(0)").html();
      var Qty = $(this).find("td:eq(1)").html();
      var remark = $(this).find("td:eq(2)").html();

      bool = true;

      fetch("http://127.0.0.1:8000/saveReqDrugs", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
          // 'Origin, X-Requested-With, Content-Type, Accept':'*'
        },
        body: JSON.stringify({
          drugname: drugname,
          qty: Qty,
          remark: remark,
        }),
      })
        .then((response) => response.text())
        .then((data) => {
          {
            if (data == "200") {
              console.log("Data Saved");
              //resetFeilds();
            } else {
              alert(data);
            }
          }
        })
        .catch((error) => {
          console.log(error);
        });
    });
    if (bool) {
      iziToast.success({
        title: "OK",
        message: "Successfully inserted record!",
        position: "topRight",
      });
      resetFeilds();
      $("#example").DataTable().clear().destroy();
      $("#example").DataTable();
    } else {
      iziToast.error({
        title: "Error",
        message: "Please check details Again!",
      });
    }
  }
}

//Cancel -------------------------------------------------------------------------
$("#btnCancel").on("click", function () {
  resetFeilds();
});
