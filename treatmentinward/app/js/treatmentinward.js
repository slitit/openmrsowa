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
  document.addEventListener("DOMContentLoaded", function(event) {
    console.log('treatmentinward OpenMRS Open Web App Started.');
    console.log('jQuery version: ' + jquery.fn.jquery);
  
  });

 
 
  dropDown1();
  dropDown2();
}());


//reset Fields---------------------------------------------------------------------------------
function resetFields() {
  $("#procedure_type").val(null).trigger("change");
  //$("#injection").prop("disabled",true);
  $("#injection").val(null).trigger("change").prop("disabled",true);
  $("#Remarks").val(null);
  $("#type").val(null).trigger("change");
}

//add data to table--------------------------------------------------------------------------------
$("#addBtn").on("click", function () {
  var procedure_type= $("#procedure_type option:selected").text();
  var injection = $("#injection option:selected").text();
  var Remarks = $("#Remarks").val();
  var type = $("#type option:selected").text();
  var t = $("#example").DataTable();

  if (procedure_type == "" ) {
    iziToast.error({
      position: "bottomRight",
      title: "",
      message: "Procedure type cannot be empty!",
    });
  } else if (procedure_type=="Injection" && injection == "") {
    iziToast.error({
      position: "bottomRight",
      title: "",
      message: "Injection cannot be empty!",
    });
  } else if (Remarks == "") {
    iziToast.error({
      position: "bottomRight",
      title: "",
      message: "Remarks cannot be empty!",
    });
  }  else if (type == "") {
    iziToast.error({
      position: "bottomRight",
      title: "",
      message: "Type cannot be empty!",
    });
  } else {
    t.row
      .add([
        procedure_type,
        injection,
        Remarks,
        type,
        '<button type="button" class="btn btn-default" id="btnDelete"><i class="fa fa-close" style="color:red;"></i></button>',
      ])
      .draw(false);
    resetFields();
   
  }
  
});


function dropDown2(){
   $("#type").select2({
          width: "150px",
          placeholder: "--Select--",
          allowClear: true,
        });
  
}
///drop down list for procedure type
function dropDown1() {
  fetch("http://127.0.0.1:8000/api/protype", {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const proceduretype = data.proceduretype.map((element) => {
        return element.proceduretype;
      });
      console.log(proceduretype.length);
      proceduretype.forEach((proceduretype) => {
        $("#procedure_type").select2({
          width: "150px",
          placeholder: "--Select--",
          allowClear: true,
        });
        $("#procedure_type").append(
          "<option value='" +
          proceduretype +
            "'>" +
            proceduretype +
            "</option>"
        );
        $("#procedure_type").trigger("change");
      });
    });
}


///dropdown list for injection 
$("#procedure_type").on("change", function () {
  var procedure_type = $("#procedure_type").val();
  if (procedure_type == "Injection") {

     $("#injection").prop("disabled",false);
    fetch("http://127.0.0.1:8000/api/injection/"+ procedure_type, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        console.log(data.generic_name);
        const generic_name = data.generic_name.map((element) => {
          return element.generic_name;
        });
        console.log(generic_name.length);
        generic_name.forEach((generic_name) => {
          $("#injection").select2({
            width: "150px",
            placeholder: "--Select--",
            allowClear: true,
          });
          $("#injection").append(
            "<option value='" +
            generic_name +
              "'>" +
            generic_name +
              "</option>"
          );
          $("#injection").trigger("change");
        });
      });
    
   
  } else {
    $("#injection").prop("disabled",true);
      
  }
});

//delete Table row------------------------------------------------------------------------
$("#example").on("click", "#btnDelete", function () {
  var table = $("#example").DataTable();
  table.row($(this).parents("tr")).remove().draw(false);
});

/*//re-Initisalize Table--------------------------------------------------------------
function initTable() {
  return $("#example1").dataTable({
    scrollY: "200px",
    paginate: false,
    retrieve: true,
  });
}


//Load Table--------------------------------------------------------------------------------------

function fetchTable() {
  $.ajax({
    type: "GET",
    url: "http://127.0.0.1:8000/api/treatmentinward",
    dataType: "json",
    success: function (response) {
      $("#example1").DataTable().clear().destroy();
      $.each(response.treatment_inward, function (key, item) {
       $("#example1 tbody").append(
         "<tr>\
           <td>" +
           item.procedure_type +
           "</td>\
           <td>" +
           item.injection +
           "</td>\
           <td>" +
           item.Remarks +
           "</td>\
           <td>" +
           item.type +
           '</td>\
           <td><button type="button" value="' +
           item.procedure_type +
           '" class="btn btn-default" id="btnbackendDelete"><i class="fa fa-close" style="color:red;"></i></button></td>\
           </tr>\''
       );
       
     });
      $("#example1").DataTable();
      initTable();
      resetFields();
     },
   });
 }


 //delete from database--------------------------------------------------------------------------
$(document).on("click", "#btnbackendDelete", function (e) {
  e.preventDefault();
  var procedure_type= $(this).find("td:eq(0)").html();
  var injection = $(this).find("td:eq(1)").html();
  var Remarks = $(this).find("td:eq(2)").html();
  var type = $(this).find("td:eq(1)").html();

  const Swal = require("sweetalert2");
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        type: "DELETE",
        url:
          "http://127.0.0.1:8000/api/delete/" +
          procedure_type +
          "/" +
          injection +
          "/" +
          Remarks +
          "/" +
          type,
        success: function (response) {
          console.log(response);
          fetchTable();
        },
      });
      Swal.fire("Deleted!", "Record has been deleted.", "success");
    }
  });
});
*/
//save button---------------------------
$("#saveBtn").on("click", function () {
  var bool = false;
  var table = $("#example").DataTable();
  var isEmpty = table.rows().count() === 0;

  if (isEmpty) {
    iziToast.error({
      title: "Error",
      message: "Please add Treatment to table before save!",
    });
  } else {
    $("#example > tbody > tr").each(function () {
      var procedure_type = $(this).find("td:eq(0)").html();
      var injection = $(this).find("td:eq(1)").html();
      var Remarks = $(this).find("td:eq(2)").html();
      var type = $(this).find("td:eq(3)").html();
   

      fetch("http://127.0.0.1:8000/api/save", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
          // 'Origin, X-Requested-With, Content-Type, Accept':'*'
        },
        body: JSON.stringify({
          procedure_type: procedure_type,
          injection: injection,
          Remarks: Remarks,
          type: type,
        }),
      })
        .then((response) => response.text())
        .then((data) => {
          {
            if (data == "200") {
              const Swal = require("sweetalert2");
              Swal.fire({
                icon: "success",
                title: "Your data has been saved",
                showConfirmButton: false,
                timer: 1500,
              });
            } else {
              alert(data);
            }
          }
        })
        .catch((error) => {
          console.log(error);
        });
      bool = true;
    });

    if (bool) {
      $("#example").DataTable().clear().destroy();
      $("#example").DataTable();
      resetFields();
    }
  }
});


//for cancel button
$("#cancelBtn").on("click", function () {
  const Swal = require("sweetalert2");
  Swal.fire({
    title: "Are you sure?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085D6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Cancel!",
  }).then((result) => {
    if (result.isConfirmed) {

      $("#example").DataTable().clear().destroy();
      $("#example").DataTable();
      resetFields();
      Swal.fire("Cancel!", "", "success");
    }
  });
});