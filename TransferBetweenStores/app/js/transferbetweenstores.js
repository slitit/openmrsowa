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
    console.log("transferbetweenstores OpenMRS Open Web App Started.");
    console.log("jQuery version: " + jquery.fn.jquery);
  });

  dropDownDrugName();
  dropDownSection();
  initComponent();
})();

//Reset Feilds-------------------------------------------------------------------------------------
function resetFeilds() {
  //$("#InsName").val(null);
  $("#date").val(null);
  $("#orderFrom").val(null);
  $("#orderTo").val(null);
  $("#remark").val(null);

  $("#drugname").val(null).trigger("change");
  $("#batchNo").val(null);
  $("#dateExp").val(null);
  $("#quantity").val(null);
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

//save data textfield data-------------------------------------------------------------------------
$("#saveBtn").on("click", function () {
  transferDrug();
});

function transferDrug() {
  var bool = false;
  var table = $("#example").DataTable();
  var isEmpty = table.rows().count() === 0;
  if (isEmpty) {
    iziToast.error({
      title: "Error",
      message: "Please add drug details",
    });
  } else {
    transferIns();
    var bool = false;
    $("#example > tbody > tr").each(function () {
      var drugname = $(this).find("td:eq(0)").html();
      var batchNo = $(this).find("td:eq(1)").html();
      var expDate = $(this).find("td:eq(2)").html();
      var Qty = $(this).find("td:eq(3)").html();
      var remark = $(this).find("td:eq(4)").html();

      bool = true;
      
      fetch("http://127.0.0.1:8000/saveTableDrugs", {
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
          batchno: batchNo,
          expiredate: expDate,
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

      console.log(remark);
    });
    if (bool) {
      iziToast.success({
        title: 'OK',
        message: 'Successfully inserted record!',
        position: 'topRight'
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

function transferIns() {
  var insname = $("#InsName").val();
  var dates = $("#date").val();
  var orderFrom = $("#orderFrom option:selected").val();
  var orderTo = $("#orderTo option:selected").val();
  var remark = $("#remark").val();

  if (dates == "") {
    iziToast.error({
      title: "Error",
      message: "Please select Date",
    });
  } else if (orderFrom == "" && orderTo == "") {
    iziToast.error({
      title: "Error",
      message: "Please select Transfer From and Transfer To",
    });
  } else if (remark == "") {
    iziToast.error({
      title: "Error",
      message: "Please add remark",
    });
  } else {
    fetch("http://127.0.0.1:8000/saveTranferdetails", {
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
        transferfrm: orderFrom,
        transferto: orderTo,
        remark: remark,
        dates: dates,
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

//load Section-------------------------------------------------------------------------------------
function dropDownSection() {
  fetch("http://127.0.0.1:8000/getSectionName", {
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
      const sectionname = data.map((element) => {
        return element.section_name;
      });

      sectionname.forEach((sectionname) => {
        $("#orderFrom").select2({
          width: "250px",
          placeholder: "--Select--",
          allowClear: true,
        });
        $("#orderFrom").append(
          "<option value='" + sectionname + "'>" + sectionname + "</option>"
        );
        $("#orderFrom").trigger("change");
      });

      sectionname.forEach((sectionname) => {
        $("#orderTo").select2({
          width: "250px",
          placeholder: "--Select--",
          allowClear: true,
        });
        $("#orderTo").append(
          "<option value='" + sectionname + "'>" + sectionname + "</option>"
        );
        $("#orderTo").trigger("change");
      });
    });
}

/// add data to the table------------------------------------------------------------------------
$("#addBtn").on("click", function () {
  var drugname = $("#drugname option:selected").text();
  var batchno = $("#batchNo").val();
  var expidate = $("#dateExp").val();
  var quantity = $("#quantity").val();
  var remarks = $("#remarksDrug").val();
  var t = $("#example").DataTable();

  if (drugname == "") {
    iziToast.error({
      position: "bottomRight",
      title: "",
      message: "Drugname type cannot be empty!",
    });
  } else if (batchno == "") {
    iziToast.error({
      position: "bottomRight",
      title: "",
      message: "Batchno cannot be empty!",
    });
  } else if (expidate == "") {
    iziToast.error({
      position: "bottomRight",
      title: "",
      message: "Expidate cannot be empty!",
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
        batchno,
        expidate,
        quantity,
        remarks,
        '<button type="button" class="btn btn-default" id="btnDelete"><i class="fa fa-close" style="color:red;"></i></button>',
      ])
      .draw(false);
    $("#drugname").val(null).trigger("change");
    $("#batchNo").val(null);
    $("#dateExp").val(null);
    $("#quantity").val(null);
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
  fetch("http://127.0.0.1:8000/drugname", {
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
      const drugname = data.map((element) => {
        return element.drug_name;
      });

      drugname.forEach((drugname) => {
        $("#drugname").select2({
          width: "150px",
          placeholder: "--Select--",
          allowClear: true,
        });
        $("#drugname").append(
          "<option value='" + drugname + "'>" + drugname + "</option>"
        );
        $("#drugname").trigger("change");
      });
    });
}

///Load Expire Date and Batchno-----------------------------------------------------------------------------
$("#drugname").on("change", function () {
  // $("#example").DataTable().clear().destroy();
  var name = $("#drugname").val();
  if (name == "") {
    console.log("Select data");
  } else {
    //console.log(firstname);
    fetch("http://127.0.0.1:8000/batchDate/" + name, {
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
        console.log(data);
        {
          if (data.length == 0) {
            $("#batchNo").val("");
            $("#dateExp").val("");
          } else {
            $("#batchNo").val(data[0]["batch_no"]);
            $("#dateExp").val(data[0]["expiry_date"]);
          }
        }
      });
  }
});
