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
    console.log('wardadmission OpenMRS Open Web App Started.');
    //console.log('jQuery version: ' + jquery.fn.jquery);
    $('#tableAddmitToWard').DataTable();
  });
}());

$('#txtPHNno').focus() ;
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
                      loadSectionName(InstituteUuid);
                     
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

//Load institute(location) to the dropdown
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
      $("#transferredFrom").html("");
      $("#transferredFrom").html(options);
    })
    .catch((error) => console.log("error", error));
}

function loadSectionName(InstituteUuid){ 

  fetch("http://localhost:8086/section/getSectionName/" + InstituteUuid +"/"+ 1,{
    method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
  })
  .then((response) => response.json())
  .then((result) => {
    var data = "";
    data += "<option disabled selected>--Select--</option>";
    
    $(result).each(function (k, v) {
     
      data +=
      "<option value='" + v.sectionid + "'>" + v.section_name + "</option>";
              
    });
    $("#drpWard").html("");
    $("#drpWard").html(data);
  })
  .catch((error) => {
    console.log(error);
  });
 
}


$('#txtPHNno').on('keypress', function (e){
  
  if(e.which == 13){
    let phnNo = $('#txtPHNno').val();
    alert(phnNo);  
    fetch("http://localhost/LaravelApiFile/getPersonUUidFromPHN",{
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 'phn': phnNo})
    })
    .then((response) => response.json())
    .then((result) => {
      //console.log(result.uuid);
      $(result).each(function (k, v) {
        console.log(v.uuid);
        let personUuid = v.uuid;
        console.log(personUuid);
        loadFormData(personUuid);
      })
     
      
    })
  

    // alert( $('#txtPHNno').val());   

    // fetch("http://localhost/LaravelApiFile/LoadPHNno",{
    //   method: "POST",
    //   headers: {
    //     'Accept': 'application/json',
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({ 'person_attribute_type_id': 25})
    // })
    // .then((response) => response.json())
    // .then((result) => {
      
    //   $(result).each(function (k, v) {
        
    //     $('#txtPHNno').val(v.value);
    //     alert( $('#txtPHNno').val());     
    //   });
      
    // })
    // .catch((error) => {
    //   console.log(error);
    // });
  }
  
});


function loadFormData(personUuid){

  var requestHeaders = new Headers();
  requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
  requestHeaders.append("Cookie", "JSESSIONID=24D0761924138ED7E55C2CB6806B0633");

  var requestOptions = {
    method: 'GET',
    headers: requestHeaders,
    redirect: 'follow'
  };

  fetch("/openmrs/ws/rest/v1/patient/" + personUuid, requestOptions)
    .then(response => response.json())
    .then(result => {
      console.log(result);
      $("#txtfullName").val($.trim(result.person.display));
      $("#txtGender").val($.trim(result.person.gender));
      $("#txtdateOfBirth").val($.trim(result.person.birthdate).split("T")[0]);
      $("#txtAge").val($.trim(result.person.age));

      $(result.person.attributes).each(function (k, v) {
        if (v.display != null) {
          if ($.trim(v.display.split("=")[0]) == "ProfileImage") {
            $('#file_upload').attr('src', 'http://localhost/LaravelApiFile/storage/documents/' + $.trim(v.display.split("=")[1]));
          }
        }
      })
    })

  
}

loadConsultant();
function loadConsultant(){
  fetch("http://localhost/LaravelApiFile/getPersonNameFromConsulttant",{
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({"role" : "Consultant"})
  })
  .then((response) => response.json())
  .then((result) => {
    var data = "";
    data += "<option disabled selected>--Select--</option>";
    
    $(result).each(function (k, v) {
     
      data +=
      "<option value='" + v.person_id + "'>" + v.given_name + "</option>";
              
    });
    $("#drpConsultant").html("");
    $("#drpConsultant").html(data);
  })
  .catch((error) => {
    console.log(error);
  });
}

$('#btnSubmit').on('click', function(){

  let phnNo = $("#txtPHNno").val();
  let admissionType = $("#drpAdmissionType :selected").text();
  let instituteName = $("#transferredFrom :selected").text();
  let instituteId = $("#transferredFrom").val();
  let bhtReceived = $("#drpReceivedTo").val();
  let documentReceived = $("#drpDocReceivedTo").val();
  let admissionDate = $("#txtAdmissionDate").val();
  let admissionTime = $("#txtAdmissionTime").val();
  let wardName = $("#drpWard :selected").text();
  let wardId = $("#drpWard").val();
  let consultant = $("#drpConsultant :selected").text();

  let year = new Date().getFullYear();
  $("#txtBHtno").val(year);
  let bhtNo = $("#txtBHtno").val();
  let guardianAddress = $("#txtGuardianAddress").val();
  let guardianName = $("#txtGuardianName").val();
  let guardianNo  = $("#txtGuardianCtNo").val();
  let guardianNIC = $("#txtGuardianNICno").val();
  let guardianRelationship = $("#txtGuardianRelationship").val();
  let judicialAction  = $("#drpJudicialAction").val();
  let informedPolice = $("#drpInformed").val();

  if($("#drpAdmissionType").val()==null){
    iziToast.error({position: "bottomRight", title: '', message: 'transmission type cannot be empty!'});
  }else if(admissionDate == ""){
    iziToast.error({position: "bottomRight", title: '', message: 'Admission date cannot be empty!'});
  }else if(admissionTime == ""){
    iziToast.error({position: "bottomRight", title: '', message: 'Admission time cannot be empty!'});
  }else if(wardName == "--Select--"){
    iziToast.error({position: "bottomRight", title: '', message: 'Ward name cannot be empty!'});
  }else if(guardianName == ""){
    iziToast.error({position: "bottomRight", title: '', message: 'Guardian name cannot be empty!'});
  }else if(guardianNo == ""){
    iziToast.error({position: "bottomRight", title: '', message: 'Guardian contact no cannot be empty!'});
  }else{
    fetch("http://localhost:8086/wardAdmission/insertWardAdmissionDta", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phnno: phnNo,
            admission_type: admissionType,
            institute_name: instituteName,
            instituteuuid: instituteId,
            bhtreceived: bhtReceived,
            documentsreceived: documentReceived,
            admission_date: admissionDate,
            admission_time: admissionTime,
            ward: wardName,
            wardid: wardId,
            consultant: consultant,
            bhtno: bhtNo,
            guardian_address: guardianAddress,
            guardian_name: guardianName,
            contact_no: guardianNo,
            nicno: guardianNIC,
            guardian_relationship: guardianRelationship,
            judicial_action: judicialAction,
            informed_to_police: informedPolice
          }),
        })
        .then(response => response.text())
        .then(data => {
          swal({
            title: "BHT No is: "+data,
            text: "Saved Successfully!",
            icon: "success",
          
          });
        })
        .catch((error) => {
          console.log(error);
        });
    resetFields();
  }
  
})

function resetFields(){
  $("#txtPHNno").val(null);
  $("#txtfullName").val(null);
  $("#txtGender").val(null);
  $("#txtdateOfBirth").val(null);
  $("#txtAge").val(null);
  $("#file_upload").val(null);
  $("#drpAdmissionType").val(null);
  $("#transferredFrom").val(null);
  $("#drpReceivedTo").val(null);
  $("#drpDocReceivedTo").val(null);
  $("#txtAdmissionDate").val(null);
  $("#txtAdmissionTime").val(null);
  $("#drpWard").val(null);
  $("#drpConsultant").val(null);
  $("#txtBHtno").val(null);
  $("#txtGuardianName").val(null);
  $("#txtGuardianCtNo").val(null);
  $("#txtGuardianNICno").val(null);
  $("#txtGuardianRelationship").val(null);
  $("#drpJudicialAction").val(null);
  $("#drpInformed").val(null);
  $("#txtGuardianAddress").val(null);
}

$("#saveTransferFrom").on('click', function(){
    let transferFromText = $("#txtNewTransferFrom").val();
    
    if(transferFromText == ""){
      iziToast.error({position: "topRight", title: '', message: 'Transfer from cannot be empty!'});
    }else{
      var bool = true;
      $("#transferredFrom option").each(function () {
        var option = $(this);
				var isNew = option.val();
				if (transferFromText == isNew) {
          bool = false;
         
        }
      });
      if (!bool) {
        iziToast.warning({position: "topRight", title: '', message: 'Already exist transfer from!'});
      }else{
        $('#transferredFrom').append($("<option>" + transferFromText + "</option>"));
      }
      
    }
})
