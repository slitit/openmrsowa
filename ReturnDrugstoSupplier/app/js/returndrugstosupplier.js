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
    console.log('returndrugstosupplier OpenMRS Open Web App Started.');
    console.log('jQuery version: ' + jquery.fn.jquery);
	
	initComponent();
	$('#ReferencePanel').hide();
	decimal();
	$('#grnNo').show();
	$('#grnNoText').hide();
  });
  
}()); 

//"+IPaddress+"
var IPaddress="localhost";
//var IPaddress="123.231.114.160";

function decimal(){
	$("input.decimal").bind("change keyup input", function() {
    var position = this.selectionStart - 1;
    //remove all but number and .
    var fixed = this.value.replace(/[^0-9\.]/g, "");
    if (fixed.charAt(0) === ".")
      //can't start with .
      fixed = fixed.slice(1);

    var pos = fixed.indexOf(".") + 1;
    if (pos >= 0)
      //avoid more than one .
      fixed = fixed.substr(0, pos) + fixed.slice(pos).replace(".", "");

    if (this.value !== fixed) {
      this.value = fixed;
      this.selectionStart = position;
      this.selectionEnd = position;
    }
  });
}

//iziToast.error({
  //  title: 'Error',
  //  message: 'Illegal operation',
//});

$('#btnLookup').on('click',function(){
    $('#ReferencePanel').show();
	$('#btnSave').hide();
	$('#tableDrugAdju_Body').html("");
	clearText();
	loadReturnNumberAll();
	$('#grnNo').hide();
	$('#grnNoText').show();
	$('#grnNo').show();
	$('#grnNoText').hide();
});

$('#Cancel').on('click',function(){
	$('#ReferencePanel').hide();
	$('#btnSave').show();
	$('#tableDrugAdju_Body').html("");
	clearText();
	$('#grnNo').show();
	$('#grnNoText').hide();
});

function loadReturnNumberAll(){
	
	fetch("http://"+IPaddress+":8086/stockAdjustment/supplierReturnNumberLoadInstituteWise/" + InstituteUuidGloble,{
      method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
    })
    .then((response) => response.json())
    .then((result) => {
	    	var html="";
			html+="<option value=''>--select--</option>";
			var isAssingFrist="";
			$(result).each(function (key, val) {
                	html+="<option value="+val.masterId+" mytag="+val.receiveOrderID.grnNo+">"+val.returnOrderNo+"</option>";
					if(isAssingFrist==""){
						isAssingFrist=val.masterId;
						
					}
			});
			$('#referenceNo').html(html);
    })
}

$('#referenceNo').on("change",function(){ 
    var grnNo=$('#referenceNo :selected').attr('mytag');  
	$('#grnNo').hide();
	$('#grnNoText').show();
	$('#grnNoText').val(grnNo);
	var referenceNo=$('#referenceNo').val();
	    fetch("http://"+IPaddress+":8086/receive/getDataFromGRnno?grn_no=" + grnNo,{
          method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
        })
        .then((response) => response.json())
        .then((result) => {
          $(result).each(function (k, v) {
			  
			  $("#supplier").val(v.supplier);
              $("#receiveDate").val(v.receiveDate.split(" ")[0]);
			  $('#receiveFrom').val(v.receivedFrom);
			  //receiveDate
			  //remark
			 
          })
        })
		
		var masterID=$('#referenceNo :selected').val();  
	//-------------Load Table Data----------------------------------	
        fetch("http://"+IPaddress+":8086/stockAdjustment/supplierReturnChildDataLoad/"+masterID,{
          method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
        })
        .then((response) => response.json())
        .then((result) => { 
		 
		  $('#tableDrugAdju_Body').html("");
			  var row=0;
             $(result).each(function (k, value) {
			  if(row==0){
				   $('#returnDate').val(value.masterId.returnDate.split(' ')[0]);
				   $('#Remarks').val(value.masterId.remark);
			  }
			  row++;
			 
			  $("#tableDrugAdju_Body").append(
			       "<tr style='text-align: center; padding-top: 2px; padding-bottom: 4px;'><td style='display:none;'>"+value.childId+"</td><td>" +
                    value.drugid.drugid+"-"+value.drugid.brand_name+"-"+value.drugid.generic_name+
                        "</td><td>" +
					 value.recivedQty  +
                        "</td><td>" +
					 value.batchNo +
                        "</td><td>" +
                    value.expiryDate.split(" ")[0] +
                        "</td><td>" +
                    value.recivedQty +
                        "</td><td>"+value.returnQty+"</td><td>" +
                    value.remarks +
					"</td><td></td></tr>"
                 );
          })
        })
 });


function clearText(){
	$('#grnNo :selected').val("");
	$('#receiveDate').val("");
	$('#receiveFrom').val("");
	$('#supplier').val("");
	$('#returnDate').val("");
	$('#Remarks').val("");
	
}

var InstituteUuidGloble="";
var UserUuidGloble="";
var UserUuidGloble="";
var InstituteNameGloble="";
var GlobalLocationID="";

function initComponent(){
	console.log('initComponent');

	var id="";
	var userName="";
	var myHeaders = new Headers();
	myHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
	myHeaders.append("Cookie", "JSESSIONID=2D158E83ACFB788998C7DB495F07C1B9");

	var requestOptions = {
		method: 'GET',
		headers: myHeaders,
		redirect: 'follow'
	};

	fetch("/openmrs/ws/rest/v1/session", requestOptions)
  .then(response => response.json())
  .then(result => {
	  id=result.user.person.uuid;
	  userName=result.user.display;
	  UserUuidGloble=result.user.person.uuid;
	//  window.open("http://localhost:3000?id="+id+""); 
		
	  console.log("Before Id"+id);
	  getPersondetais(id,userName);
  })
  .catch(error => console.log('error', error));
  
  
 
}


function getPersondetais(userId,userName){
	
UserUuidGloble=userId;
var requestHeaders = new Headers();
requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
requestHeaders.append("Cookie", "JSESSIONID=ED9DBD5CFD355A973EFFECD642D8331D");
var instituteId="";
var requestOptions = {
  method: 'GET',
  headers: requestHeaders,
  redirect: 'follow'
};

fetch("/openmrs/ws/rest/v1/person/"+userId+"", requestOptions)
  .then(response => response.json())
  .then(result => {
	  console.log(result.attributes);
	   
	   instituteId=result.attributes[1].display.split("=")[1].trim();
	   if(instituteId=="true"){
	   instituteId=result.attributes[0].display.split("=")[1].trim();
	   InstituteUuidGloble=instituteId;
	   getInstituteName(userId,userName,instituteId);  
	  	
	   setLocationID(instituteId);
	   loadGRNno();
	   
	   }else{
		   InstituteUuidGloble=instituteId;
	   getInstituteName(userId,userName,instituteId);
	  
	   setLocationID(instituteId);
	   loadGRNno();
	   
	   }
	  
  })
  .catch(error => console.log('error', error));
} 


function getInstituteName(userId,userName,instituteId){
		
	
		var InstituteName="";
		var requestHeaders = new Headers();
		requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
		requestHeaders.append("Cookie", "JSESSIONID=24D0761924138ED7E55C2CB6806B0633");

		var requestOptions = {
		method: 'GET',
		headers: requestHeaders,
		redirect: 'follow'
		};

		fetch("/openmrs/ws/rest/v1/location/"+instituteId+"", requestOptions)
		.then(response => response.json())
		.then(result => {
		 	InstituteName=result.display;
			
			$('#instituteName').val(InstituteName);
			InstituteNameGloble="";
			InstituteNameGloble=InstituteName;
			
			
		})
		.catch(error => console.log('error', error));


	 
}




function  setLocationID(){
	
	var requestHeaders = new Headers();
		requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
		requestHeaders.append("Cookie", "JSESSIONID=ED9DBD5CFD355A973EFFECD642D8331D");
	
	var requestHeaders = new Headers();
		requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
		requestHeaders.append("Cookie", "JSESSIONID=ED9DBD5CFD355A973EFFECD642D8331D");
	          var requestOptions = {
            method: "GET",
            headers: requestHeaders,
            redirect: "follow",
          };
          //location rest API
          fetch("/openmrs/ws/rest/v1/location/" + InstituteUuidGloble, requestOptions)
            .then(function (response) {
              return response.json();
            })
            .then(result => {
			 $(result.attributes).each(function (k, v) {
                if (v.display != null) {
                  var locationId = "";
        
                  if ($.trim(v.display.split(":")[0]) == "Location Id") {
                    locationId = $.trim(v.display.split(":")[1]);
                    console.log("locationId: " + locationId);

                    GlobalLocationID=locationId;
					
                  }
                }
              });
			
			})
           
	
}


function loadGRNno(){
    fetch("http://"+IPaddress+":8086/receive/getReceiveOrderFromInstitute?instituteid=" + InstituteUuidGloble,{
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
        "<option value='" + v.id + "'>" + v.grnNo + "</option>";
                
      });
        $("#grnNo").html("");
        $("#grnNo").html(data);
    })
}

$("#grnNo").on("change", function () {

      var grnnoid = $("#grnNo").val();
      var grnNo = $("#grnNo :selected").text()
	  lodeTablData(grnnoid);
	  //Mekata 1
      fetch("http://"+IPaddress+":8086/receive/getDataFromGRnno?grn_no=" + grnNo,{
          method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
        })
        .then((response) => response.json())
        .then((result) => {
          $(result).each(function (k, v) {
			  
			  $("#supplier").val(v.supplier);
              $("#receiveDate").val(v.receiveDate.split(" ")[0]);
			  $('#receiveFrom').val(v.receivedFrom);
             
               
            
          
          })
        })
        
    })
	
	
	function lodeTablData(grnnoid){
       
	   fetch("http://"+IPaddress+":8086/receiveOrder/findReceiveDrug?receive_orderid=" +grnnoid,
                
                {
                method: "GET",
                    mode: "cors",
                    cache: "no-cache",
                    headers: {
                    "Content-Type": "application/json",
                    },
                  }
                  )
                .then((response) => response.json())
                .then((result) => {

                  $("#tableDrugAdju_Body").empty();
                  $.each(result, function (key, value) {
                  console.log("value.batchNo"+value.batchNo);
				   console.log("value::::::::::::::::::"+InstituteUuidGloble+"/"+value.drugid.id+"/"+value.batchNo+"/"+value.expiryDate.split(" ")[0]+"/"+value.receiveOrder.sectionID.sectionid);
                  
                    $("#tableDrugAdju_Body").append(
                      "<tr style='text-align: center; padding-top: 2px; padding-bottom: 4px;'><td style='display:none;'>"+value.drugid.id+"</td><td>" +
                    value.drugName +
                        "</td><td>" +
					"--PENDING--"+
                        "</td><td>" +
					 value.batchNo +
                        "</td><td>" +
                    value.expiryDate.split(" ")[0] +
                        "</td><td>" +
                    value.quantity +
                        "</td><td><input type='text' class='decimal'/></td><td>" +
                    value.remarks +
					"</td><td><div class='form-check form-check-inline'> <input class='form-check-input' type='checkbox' id='inlineCheckbox1' value='option1'></div></td></tr>"
                    );
                  });
				  decimal();
                })	
				
	}

    
	
	$('#btnSave').on('click',function(){

		if($('#grnNo :selected').val()=="--Select--"){
		iziToast.error({
			itle: 'Error',
			message: 'Please select GRN no!',
		});
		}else if($('#returnDate').val()==""){
		iziToast.error({
			itle: 'Error',
			message: 'Please Enter Return Date!',
		});
		}else{ 
		    var bool=false;
			$('#tableDrugAdju_Body tr').each(function () {
            var tr = $(this);
           	if(tr.find('td:eq(8) input').is(':checked')){
			//tr.find("td:eq(6) input[type='text']").val();
			bool=true;
			
			}
			
			
			});
			if(bool){
				returnDrugsToSuppier();
			}else{
				iziToast.error({
			itle: 'Error',
			message: 'Please chebox, checkbox is empty!',
		   });
			}
        }
	}); 
	
	function returnDrugsToSuppier(){
	  var ReciveOrderID= $('#grnNo :selected').val();
	  var grnNo= $('#grnNo :selected').text();
	  var returnDate= $('#returnDate').val();
	  var Remarks= $('#Remarks').val();
	 
      var tableDrugAdju_Body_Main = [];
   
	$('#tableDrugAdju_Body tr').each(function () {
        var tableDrugAdju_Body_temp = [];
        var tr = $(this);
        tableDrugAdju_Body_temp.push(tr.find('td:nth-child(1)').html());
        tableDrugAdju_Body_temp.push(tr.find('td:nth-child(3)').html());	
        tableDrugAdju_Body_temp.push(tr.find('td:nth-child(4)').html());
        tableDrugAdju_Body_temp.push(tr.find('td:nth-child(5)').html());
        tableDrugAdju_Body_temp.push(tr.find('td:nth-child(6)').html());		
        tableDrugAdju_Body_temp.push(tr.find("td:eq(6) input[type='text']").val());  
        tableDrugAdju_Body_temp.push(tr.find('td:nth-child(8)').html());		
		tableDrugAdju_Body_temp.push(tr.find('td:eq(8) input').is(':checked'));
        tableDrugAdju_Body_Main.push(tableDrugAdju_Body_temp);
	});
    
		
	 fetch("http://"+IPaddress+":8086/stockAdjustment/supplierReturnSave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
	      ReciveOrderID:ReciveOrderID,
		  grnNo:grnNo,
		  returnDate:returnDate,
		  Remarks:Remarks,
		  InstituteUuidGloble:InstituteUuidGloble,
		  UserUuidGloble:UserUuidGloble,
          tableDrugAdju_Body_Main: tableDrugAdju_Body_Main
       
        })
      })
        .then((response) => response.text())
        .then((result) => {
       
		  Swal.fire({
				position: 'center',
				icon: 'success',
				title: 'Saved Successfull!',
				text: result,
				showConfirmButton: false,
				timer: 1500
			})
        })
        .catch((error) => {
          console.log(error);
        });
	}