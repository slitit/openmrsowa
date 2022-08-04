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
    console.log('receivedrugsfromstoretransfer OpenMRS Open Web App Started.');
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
                      loadTransferOrderNo(InstituteUuid);
                      loadReceivedOrderNo(InstituteUuid);
                      
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

//Load transferOderNo to dropdown
function loadTransferOrderNo(InstituteUuid){
 
  fetch("http://123.231.114.160:8086/receiveDrugsFromStoreTransfer/findDataList?instituteid=" + InstituteUuid,{
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
      "<option value='" + v.transfer_id + "'>" + v.orderNo + "</option>";
              
    });
    $("#transferOrderNo").html("");
    $("#transferOrderNo").html(data);
  })
  .catch((error) => {
    console.log(error);
  });
}


//When click the save button if it is save, then save the data unless update the data
$('#btnSubmit').on('click', function(){
  
  if($('#update_criteria_id').val().length == 0){
    let locationId = $("#txtInstitute").attr("locationid");
   
   
    let year = new Date().getFullYear();
   
    let reveiveOrderNo = locationId + year;
   
    $("#receiveOrderNo").val(reveiveOrderNo);
    let receiveOrderNum =  $("#receiveOrderNo").val();
   
    let orderNoId = $("#transferOrderNo").val();
    let receiveDate = $("#receiveDate").val();
    let institute = $("#txtInstitute").attr("insuuid");
    let transferFromID = $("#transferFromID").val();
    let transferToId = $("#transferToID").val();

    
    if($("#transferOrderNo :selected").text() == "--Select--"){
      swal("Please select transfer order no!");
    }
    else if(receiveDate == ""){
      swal("Please enter receive date!");
    }else if(	$('#DrugsTransferdataBody tr').length != 0){
      
      var data = [];
      $('#DrugsTransferdataBody tr').each(function (i, el) {
       
        var Array = [];
        var $tds = $(this).find('td'),
        drugNameId = $tds.eq(0).text(),
        drugName = $tds.eq(1).text(),
        qty = $tds.eq(2).text(),
        batchNo = $tds.eq(3).text(),
        expiryDate = $tds.eq(4).text(),
       
        receivedQty = $tds.find("#receiveQty").val(),
       
        remark = $tds.eq(6).text(),
        checkReceivedQty = $tds.find("#checkreceiveQty").is(":checked");
        
        Array.push(drugNameId);
        Array.push(drugName);
        Array.push(qty);
        Array.push(batchNo);
        Array.push(expiryDate);
        Array.push(receivedQty);
        Array.push(remark);
        Array.push(checkReceivedQty);
       
        data.push(Array);
      });
      
      data.filter(function (el){
        console.log(el[5]);
        if(el[5] == ""){
          swal("Please enter received quantity!");
        }else{
          fetch("http://123.231.114.160:8086/receiveDrugsFromStoreTransfer/insertreceiveDrugsFromStoreTransferData", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            receive_date: receiveDate,
            receive_order_no: receiveOrderNum,
            transfer_oder_no_id: orderNoId,
            instituteid: institute,
            transfromid: transferFromID,
            transfertoid: transferToId,
            data
          }),
        })
        .then(response => response.text())
        .then(data => {
          swal({
            title: "Receive Order No is: "+data,
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
      
    }else{
      swal(
        "Cannot Save Received Order No!",
        "",
        "error"
      );
    }
  }else{
    let receiveOderNo = $('#drpReceivedOrderNo').val();
    if(receiveOderNo != null){

      let receivedate = $("#receiveDate").val();
      fetch(
        "http://123.231.114.160:8086/receiveDrugsFromStoreTransfer/updateReceivedDate/ "+ receivedate +"/"+ receiveOderNo,

        {
          method: "PUT",
          mode: "cors",
          cache: "no-cache",
          headers: {
          "Content-Type": "application/json",
          },
        }
                    
        )	
        .then((response) => {
          swal(
                  "Successfully Updated!",
                  "",
                  "success"
                );		
        })

        .catch((error) => {
          console.log(error);
        });
       
        updateCheckRecevedQty();
    }else{
      swal(
        "Please select receive oder no!",
        "",
        "error"
      );
    }
  }
})

//Update the checkbox in the table
function updateCheckRecevedQty(){

  var row_list = [];

  $('#DrugsTransferdataBody tr').each(function () {
    var Arrrow_data = [];
    var tr = $(this);

    var receive_drug_from_store_tranfer_id = tr.find('td:nth-child(1)').html();
    
    Arrrow_data.push(receive_drug_from_store_tranfer_id);
    Arrrow_data.push($("#checkreceiveQty"+receive_drug_from_store_tranfer_id).is(":checked"));
    row_list.push(Arrrow_data);
  });
  
    fetch(
      "http://123.231.114.160:8086/receiveDrugsFromStoreTransfer/updateCheckReceiveDrug/",
  
      {
        method: "PUT",
        mode: "cors",
        cache: "no-cache",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
         row_list : row_list
        })
      })	
      .then((response) => {
        swal(
                "Successfully Updated!",
                "",
                "success"
              );		
      }).catch((error) => {
        console.log(error);
      });
      resetFields();
  

    
   
}

//look up button click
$('#btnLookup').on('click', function(){
  
  $(".receiveOrderNo").show();
  $(".transferOrderNoText").show();
  $(".transferOrderNoDrp").hide();
  $("#btnSubmit").html("Update");
  $("#update_criteria_id").val("UP");
})

//Load received order no
function loadReceivedOrderNo(InstituteUuid){

  
  fetch("http://123.231.114.160:8086/receiveDrugsFromStoreTransfer/findAllFromInstitute?instituteid=" + InstituteUuid,{
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
      "<option value='" + v.transferID + "'>" + v.receiveOrderNo + "</option>";
              
    });
    $("#drpReceivedOrderNo").html("");
    $("#drpReceivedOrderNo").html(data);
  })
}

//When changing the receive oder no, set data to the text fields
$('#drpReceivedOrderNo').on('change', function(){
  let receiveOrderNoId =  $("#drpReceivedOrderNo").val();
  fetch("http://123.231.114.160:8086/receiveDrugsFromStoreTransfer/findData/" + receiveOrderNoId,{
    method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
  })
  .then((response) => response.json())
  .then((result) => {
    $(result).each(function (k, v) {
      $("#transferOrdernum").val(v.orderNo);
      var date = v.dates.split(" ");
      $("#transferDate").val(date[0]);
      $("#transferFrom").val(v.transferfrm.section_name);
      $("#transferTo").val(v.transferto.section_name);
      $("#remark").val(v.remark);
      
    })
  })
  loadDataToTablefromReceivedOderNo(receiveOrderNoId)
  loadReceivedDateFromReceiveOrderNo(receiveOrderNoId)
})

//Load received date when changing the received order no
function loadReceivedDateFromReceiveOrderNo(receiveOrderNoId){
  fetch("http://123.231.114.160:8086/receiveDrugsFromStoreTransfer/findReceiveDate/" + receiveOrderNoId,{
    method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
  })
  .then((response) => response.json())
  .then((result) => {
    $(result).each(function (k, v) {
      let receiveDate = v.receiveDate.split(" ");
      $("#receiveDate").val(receiveDate[0]);
    })
  })
}

//Load table data when changing the receive Oder no
function loadDataToTablefromReceivedOderNo(receiveOrderNoId){
 
  fetch("http://123.231.114.160:8086/receiveDrugsFromStoreTransfer/findReceiveDrugFromStoreTransfer?transferid=" + receiveOrderNoId,{
    method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
  })
  .then((response) => response.json())
  .then((result) => {
    $("#DrugsTransferdataBody").empty();
    $.each(result, function (key, value) {
     
      $("#DrugsTransferdataBody").append(
        "<tr style='text-align: center; padding-top: 2px; padding-bottom: 4px;'><td style='display:none'>" +
        value.id +
        "</td><td>" +
        value.drugName +
        "</td><td>" +
        value.quantity +
        "</td><td>" +
        value.batchNo +
        "</td><td>" +
        value.expiryDate +
        "</td><td>" +
        value.receivedQty +
        "</td><td>" +
        value.remarks +
        "</td><td><input id='checkreceiveQty"+ value.id +"' type='checkbox' name='checkreceiveQty1' ></input></td></tr>"
        
      )
      if(value.checkReceiveDrug){
        $('#checkreceiveQty'+value.id).prop('checked',true);
        
      }else{
        $("#checkreceiveQty"+value.id).prop('checked',false);
      }
      
    })
    
  })
}

//Reset the entire textFields
function resetFields(){
  $("#transferOrderNo").val(null).trigger('change');;
  $("#transferOrdernum").val(null);
  $("#transferDate").val(null);
  $("#transferFrom").val(null);
  $("#transferTo").val(null);
  $("#remark").val(null);
  $("#receiveDate").val(null);
  $("#drpReceivedOrderNo").val(null);
  $("#DrugsTransferdataBody").empty();
  
}


 




