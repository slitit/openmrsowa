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
    console.log('stockadjustment OpenMRS Open Web App Started.');
    console.log('jQuery version: ' + jquery.fn.jquery);
	
	  $('.select2').select2();
	  initComponent();
	 $('#tableDrugAdju').DataTable();
	 $('#ReferencePanel').hide();
  });
}());
//"+IPaddress+"
var IPaddress="localhost";
//var IPaddress="123.231.114.160";

var InstituteUuidGloble="";
var UserUuidGloble="";
var InstituteNameGloble="";
var GlobalLocationID="";

$('#btnLookup').on('click',function(){
	$('#ReferencePanel').show();
	loadeReferenceNumberce();
}); 

$('#referenceNo').on('change',function(){
	var masterID=$('#referenceNo').val();
	fetch("http://"+IPaddress+":8086/stockAdjustment/ViewChildData/"+masterID, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			},
		})
		.then(response => response.json())
		.then(result => {
			$('#tableDrugAdju').DataTable().destroy();
		
			var html="";
			
			$(result).each(function (key, val) { 
			html+="<tr>";
			html+="<td style='display:none;'>"+val.drugid.id+"</td>";
			html+="<td>"+val.drugid.drugid+"-"+val.drugid.brand_name+"-"+val.drugid.generic_name+"</td>";
			html+="<td>"+val.batchNo+"</td>";
			html+="<td>"+val.expiry.split(" ")[0]+"</td>";
			html+="<td>"+val.qty+"</td>";
			html+="<td>"+val.remark+"</td>";
			html+="<td></td>";
			html+="</tr>";
			});
		console.log("HTML"+html);
		$('#tableDrugAdju_Body').html(html);
		$('#tableDrugAdju').DataTable();
	})
	
	fetch("http://"+IPaddress+":8086/stockAdjustment/ViewMasterData/"+masterID, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			},
		})
		.then(response => response.json())
		.then(result => {
		    	$('#txtDate').val(result.adjustmentDate.split(" ")[0]);
				$('#remark').val(result.remark);
				$('#sectionStore').val(result.sectionStoreID.sectionid).change();;
	    })
})


function loadeReferenceNumberce(){
	
	  fetch("http://"+IPaddress+":8086/stockAdjustment/loadeReferenceNumberce/"+InstituteUuidGloble, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			},
		})
		.then(response => response.json())
		.then(result => {
			var html="";
			html+="<option value=''>--select--</option>";
			var isAssingFrist="";
			$(result).each(function (key, val) {
                	html+="<option value="+val.masterId+">"+val.referenceNo+"</option>";
					if(isAssingFrist==""){
						isAssingFrist=val.masterId;
						
					}
			});
			$('#referenceNo').html(html);
			
			
		})
}

function initComponent(){
	console.log('initComponent');

	loadDrugDetails();
	
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
	   getInstituteName(userId,userName,instituteId);  
	   setInstituteWiseStoreDetails(instituteId);	
	   setLocationID(instituteId);
	   }else{
	   getInstituteName(userId,userName,instituteId);
	   setInstituteWiseStoreDetails(instituteId);
	   setLocationID(instituteId);
	   }
	  
  })
  .catch(error => console.log('error', error));
} 

function  setLocationID(instituteId){
	
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
          fetch("/openmrs/ws/rest/v1/location/" + instituteId, requestOptions)
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

function setInstituteWiseStoreDetails(instituteId){
	    InstituteUuidGloble=instituteId;
		
		fetch("http://"+IPaddress+":8086/section/getSection_ListFromCategory?category=Store&institute="+InstituteUuidGloble, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			},
		})
		.then(response => response.json())
		.then(result => {
			var html="";
			html+="<option value=''>--select--</option>";
			var isAssingFrist="";
			$(result).each(function (key, val) {
                	html+="<option value="+val.sectionid+">"+val.section_name+"</option>";
					if(isAssingFrist==""){
						isAssingFrist=val.sectionid;
						
					}
			});
			$('#sectionStore').html(html);
			$('#sectionStore').val(isAssingFrist).change();
			
		})
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


function loadDrugDetails(){
	
	fetch("http://"+IPaddress+":8086/drugs/getDrugsList", {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			},
		})
		.then(response => response.json())
		.then(result => {
			var html="";
			html+="<option value=''>--select--</option>";
			$('#drugName').html("");
			var isAssingFrist="";
			$(result).each(function (key, val) {
                	html+="<option value="+val.id+">"+val.drugid+"-"+val.brand_name+"-"+val.generic_name+"</option>";
					if(isAssingFrist==""){
						isAssingFrist=val.id;
						
					}
			});
			$('#drugName').html(html);
			
			 
		})
	
}


$('#drugName').on('change',function(){
   DrugNameChange();	
});

$('#batchNo').on('change',function(){
   batchNoChange();	
});





function DrugNameChange(){
	 var sectionStore=$('#sectionStore :selected').val();
	 var drugName= $('#drugName :selected').val();
	
	  fetch("http://"+IPaddress+":8086/stockAdjustment/viewIndtituteAndStockAndDrugsWiseBatchNo/"+InstituteUuidGloble+"/"+sectionStore+"/"+drugName, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			},
		})
		.then(response => response.json())
		.then(result => {
			var html="";
			html+="<option value=''>--select--</option>";
			$('#batchNo').html("");
			var isAssingFrist="";
			$(result).each(function (key, val) {
                	html+="<option value="+val.batchNo+">"+val.batchNo+"</option>";
					if(isAssingFrist==""){
						isAssingFrist=val.batchNo;
						
					}
			});
			$('#batchNo').html(html);
			$('#batchNo').val(isAssingFrist).change();
			
		})
}

function batchNoChange(){
	 var sectionStore=$('#sectionStore :selected').val();
	 var drugName= $('#drugName :selected').val();
	 var batchNo= $('#batchNo :selected').val();
	
	 fetch("http://"+IPaddress+":8086/stockAdjustment/viewIndtituteAndStockAndDrugsAndBatchNoWiseExpiryDate/"+InstituteUuidGloble+"/"+sectionStore+"/"+drugName+"/"+batchNo, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			},
		})
		.then(response => response.json())
		.then(result => {
			var html="";
			html+="<option value=''>--select--</option>";
			$('#expiryDate').html("");
			var isAssingFrist="";
			$(result).each(function (key, val) {
                	html+="<option value="+val.expireDate+">"+val.expireDate.split(' ')[0]+"</option>";
					if(isAssingFrist==""){
						isAssingFrist=val.expireDate.split(' ')[0];
						
					}
			});
			$('#expiryDate').html(html);
			$('#expiryDate').val(isAssingFrist);
			checkStock();
			
		})
} 

function checkStock(){
	console.log("Check Stock");
	 var sectionStore=$('#sectionStore :selected').val();
	 var drugName= $('#drugName :selected').val();
	 var batchNo= $('#batchNo :selected').val();
	 var expiryDate= $('#expiryDate').val();
	  
	fetch("http://"+IPaddress+":8086/stockAdjustment/viewIndtituteAndStockAndDrugsAndBatchNoAndExpiryDateWiseCheckStock/"+InstituteUuidGloble+"/"+sectionStore+"/"+drugName+"/"+batchNo+"/"+expiryDate, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			},
		})
		.then(response => response.json())
		.then(result => {
			
			console.log(result);
			console.log(result[0].quantity);
			var quantity=result[0].quantity;
			$('#adjustmentQuantity').val(quantity);
			
	})
}


$('#btnAdd').on('click',function(){
	$('#tableDrugAdju').DataTable().destroy();
	var html="";
	var drugNameID=$('#drugName :selected').val();
	var drugName=$('#drugName :selected').text();
	var batchNo=$('#batchNo :selected').val();
	var expiryDate=$('#expiryDate').val();
	var adjustmentQuantity=$('#adjustmentQuantity').val();
	var remark=$('#Remark').val();
	
	if(drugNameID==""){
		iziToast.error({
		title: 'Error',
		message: 'Please select drugs name',
		});
	}else if(batchNo==""){
		iziToast.error({
		title: 'Error',
		message: 'Please batch no',
		});
	}else{
	
	html+="<tr>";
	html+="<td style='display:none;'>"+drugNameID+"</td>";
	html+="<td>"+drugName+"</td>";
	html+="<td>"+batchNo+"</td>";
	html+="<td>"+expiryDate+"</td>";
	html+="<td>"+adjustmentQuantity+"</td>";
	html+="<td>"+remark+"</td>";
	html+="<td><button id='btnRemoveRow' class='btn btn-danger btn-sm' onclick='removeRow(this)' type='button' style='background: #fc080c;'><span style='font-size: 1.5em; color: white;'><i class='fa fa-times'></i></span></button></td>";
	html+="</tr>";
	$('#tableDrugAdju_Body').append(html);
	$('#tableDrugAdju').DataTable();
	
	clearAddRow();
	}
});

function clearAddRow(){
	//$('#drugName').val("");
	//$('#batchNo').val("");
	$('#adjustmentQuantity').val("");
	$('#Remark').val("");
    $('#ReferencePanel').hide();
	
	
}



$('#btnCancel').on('click',function(){
	clearAddRow();
	$('#txtDate').val("");
	$('#remark').val("");
	$('#sectionStore').val("");
	$('#tableDrugAdju_Body').html("");
	 $('#ReferencePanel').hide();
//	$('#tableDrugAdju').DataTable().destroy();
	//$('#tableDrugAdju').DataTable();
})

$('#btnSave').on('click',function(){
	 var sectionStore= $('#sectionStore :selected').val();
	 var txtDate=$('#txtDate').val();
	 if(sectionStore==""){
		iziToast.error({
		title: 'Error',
		message: 'Please select section store!',
		});
	 }else if(txtDate==""){
		 iziToast.error({
		title: 'Error',
		message: 'Please chose adjustment date!',
		});
	 }else{
     if($('#tableDrugAdju').DataTable().data().count()==0){
		iziToast.error({
		title: 'Error',
		message: 'Please enter data to table!',
		});
	 }else{
	 save();
	 }
	 }
});

function save() {
      var sectionStore = $('#sectionStore :selected').val();
	  var expiryDate = $('#expiryDate').val();
	
	  var Mainremark=$('#remark').val();
	  
	  var txtDate=$('#txtDate').val();
      var tableDrugAdju_Body_Main = [];
   
	$('#tableDrugAdju_Body tr').each(function () {
        var tableDrugAdju_Body_temp = [];
        var tr = $(this);
        tableDrugAdju_Body_temp.push(tr.find('td:nth-child(1)').html());
        tableDrugAdju_Body_temp.push(tr.find('td:nth-child(2)').html());
        tableDrugAdju_Body_temp.push(tr.find('td:nth-child(3)').html());
        tableDrugAdju_Body_temp.push(tr.find('td:nth-child(4)').html());
		tableDrugAdju_Body_temp.push(tr.find('td:nth-child(5)').html());
		tableDrugAdju_Body_temp.push(tr.find('td:nth-child(6)').html());
        tableDrugAdju_Body_Main.push(tableDrugAdju_Body_temp);
      });
     
	 fetch("http://"+IPaddress+":8086/stockAdjustment/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
	      InstituteUuidGloble:InstituteUuidGloble,
		  AdjustmentDate:txtDate,
          sectionStore: sectionStore,
		  expiryDate:expiryDate,
		  Main_remark:Mainremark,
		  GlobalLocationID:GlobalLocationID,
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
