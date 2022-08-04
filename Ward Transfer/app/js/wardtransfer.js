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
    console.log('wardtransfer OpenMRS Open Web App Started.');
    console.log('jQuery version: ' + jquery.fn.jquery);
  });
}());

$('#txtPHNno').focus() ;
checkInstituteAdminLogin();

var globalInstituteID="";
var globalUserUuid="";

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
      globalUserUuid=personuuid;

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
          globalInstituteID="";
          $(result.attributes).each(function (k, v) {
            
            if (v.display != null) {
              if ($.trim(v.display.split("=")[0]) == "Institute Id") {
                InstituteUuid = $.trim(v.display.split("=")[1]); //get the user's institute id
                globalInstituteID= $.trim(v.display.split("=")[1]);
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
//=====Start=================================

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
//=====End=================================


$('#txtPHNno').on('keypress', function (e){
  
  if(e.which == 13){
    let phnNo = $('#txtPHNno').val();
    
    fetch("http://localhost/LaravelApiFile/getWardAdddminssionDetails",{
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
		$('#drpAdmissionType').val(v.admission_type);
		$('#txtBHTNo').val(v.bhtno);
		$('#txtAdmissionDate').val(v.admission_date.split(" ")[0]);
		$('#txtAdmissionTime').val(v.admission_time.split(" ")[0]);
		$('#drpWard2').val(v.ward);
		$('#drpConsultant2').val(v.consultant);
		
		$('#txtGuardianName').val(v.guardian_name);
		
		$('#txtGuardianAddress').val(v.guardian_address);
		$('#txtGuardianCtNo').val(v.contact_no);
		$('#txtGuardianNICno').val(v.guardian_name);
		
		$('#txtGuardianRelationship').val(v.guardian_relationship);
		
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



$('#btnSubmit').on('click', function(){

    let phnNo = $("#txtPHNno").val();
    var txtTransferDate= $("#txtPHNno").val();
    var txtTransferTime=$('#txtTransferTime').val();
    var drpWardValue=2;
    var drpWardText=$('#drpWard  :selected').text();
    var drpConsultant=$('#drpConsultant :selected').text();
    var reason=$('#reason').val();
    var bhtTransferred=$('#bhtTransferred :selected').text();
    var documentsHandedOver=$('#documentsHandedOver :selected').text();
    var cby=globalUserUuid;
    var person_id=17;

  

  if(phnNo==null){
    iziToast.error({position: "bottomRight", title: '', message: 'Phn no cannot be empty!'});
  }else if(txtTransferDate == ""){
    iziToast.error({position: "bottomRight", title: '', message: 'Transfer date cannot be empty!'});
  }else if(txtTransferTime == ""){
    iziToast.error({position: "bottomRight", title: '', message: 'Transfer time cannot be empty!'});
  }else if(drpWardText == "--Select--"){
    iziToast.error({position: "bottomRight", title: '', message: 'Ward name cannot be empty!'});
  }else if(drpConsultant == ""){
    iziToast.error({position: "bottomRight", title: '', message: 'Consultant name cannot be empty!'});
  }else if(reason == ""){
    iziToast.error({position: "bottomRight", title: '', message: 'Reason contact no cannot be empty!'});
  }else if(bhtTransferred == ""){
    iziToast.error({position: "bottomRight", title: '', message: 'BHT Transferred cannot be empty!'});
  }else if(documentsHandedOver == ""){
    iziToast.error({position: "bottomRight", title: '', message: 'Documents Handed Overcannot be empty!'});
  }
  else
  {
    fetch("http://localhost/LaravelApiFile/saveWardTransfer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
             phnNo: phnNo,
             txtTransferDate: txtTransferDate,
             txtTransferTime: txtTransferTime,
             drpWardValue: drpWardValue,
             drpWardText: drpWardText,
             drpConsultant: drpConsultant,
             reason: reason,
             bhtTransferred: bhtTransferred,
             documentsHandedOver: documentsHandedOver,
             cby:cby,
             institute_iduuid:globalInstituteID,
             person_id:person_id,
           
          }),
        })
        .then(response => response.text())
        .then(data => {
          swal({
            title: "Saved Successfully!",
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


$('#btnCancel').on('click',function(){
  resetFields();
})

function resetFields(){
  $("#txtPHNno").val("");
  $("#txtGender").val("");
  $("#txtdateOfBirth").val("");
  $("#txtfullName").val("");
  $("#txtAge").val("");
  $("#drpAdmissionType").val("");
  $("#txtBHTNo").val("");
  $("#txtAdmissionDate").val("");
  $("#txtAdmissionTime").val("");
  $("#drpWard2").val("");
  $("#drpConsultant2").val("");
  $("#txtGuardianName").val("");
  $("#txtGuardianAddress").val("");
  $("#txtGuardianCtNo").val("");
  $("#txtGuardianRelationship").val("");
  $("#txtTransferDate").val("");
  $("#txtTransferTime").val("");
  $("#drpWard :selected").val("");
  $("#drpConsultant :selected").val("");
  $("#reason").val("");
  $("#bhtTransferred").val("");
  $("#documentsHandedOver").val("");
 
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
