/* * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
import jquery from 'jquery';
import Swal from 'sweetalert2';
import iziToast from 'izitoast';
import "izitoast/dist/css/iziToast.min.css";
import JsBarcode from 'jsbarcode';
import Tagify from '@yaireo/tagify';
import "@yaireo/tagify/dist/tagify.css";

(function () {
  'use strict';
  document.addEventListener("DOMContentLoaded", function (event) {
    console.log('Patient Registration OpenMRS Open Web App Started.');

  });
}());


var input = document.querySelector('input[name=tags]'),
  tagify = new Tagify(input, {
  });

$('#txtPatientHistory').addClass('uuidfind');

$('#txtDob').on('change', function (e) {
  var dob = $(this).val();
  getAge(dob);
});


function returnUrl() {

  var value = "";

  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
  myHeaders.append("Cookie", "JSESSIONID=4F55735593751E224686B006CD388234");

  $.ajax({
    url: '/openmrs/ws/rest/v1/conceptreferenceterm?codeOrName=LaravelApi',
    type: 'GET',
    dataType: 'json',
    async: false,
    headers: myHeaders,
    data: {},
    success: function (data) {
      var str = (data.results[0].display);

      var mySubString = str.substring(
        str.lastIndexOf("(") + 1,
        str.lastIndexOf(")")
      );

      value = (mySubString);
    }
  });

  return value;
}

var sectionId = "";
loadInstituteName();
function loadInstituteName() {

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

      var personuuid = result.user.person.uuid;

      var requestHeaders = new Headers();
      requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
      requestHeaders.append("Cookie", "JSESSIONID=ED9DBD5CFD355A973EFFECD642D8331D");

      var requestOptions = {
        method: 'GET',
        headers: requestHeaders,
        redirect: 'follow'
      };

      fetch("/openmrs/ws/rest/v1/person/" + personuuid, requestOptions)
        .then(response => response.json())
        .then(result => {

          var InstituteUuid = "";
          $(result.attributes).each(function (k, v) {
            if (v.display != null) {

              if ($.trim(v.display.split("=")[0]) == "Institute Id") {
                InstituteUuid = $.trim(v.display.split("=")[1]);
              }

              if ($.trim(v.display.split("=")[0]) == "Work Station") {
                sectionId = $.trim(v.display.split("=")[1]);
              }
            }
          });

          $('#txtinstituteuuid').val(InstituteUuid);

          var requestHeaders = new Headers();
          requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
          requestHeaders.append("Cookie", "JSESSIONID=24D0761924138ED7E55C2CB6806B0633");

          var requestOptions = {
            method: 'GET',
            headers: requestHeaders,
            redirect: 'follow'
          };

          fetch("/openmrs/ws/rest/v1/location/" + InstituteUuid, requestOptions)
            .then(response => response.json())
            .then(result => {

              var instituteName = result.display;
              $("#lblInstituteName").text(instituteName);
            })
            .catch(error => console.log('error', error));

        })
        .catch(error => console.log('error', error));
    })
    .catch(error => console.log('error', error));
}

function getAge(dateString) {
  var now = new Date();

  var yearNow = now.getFullYear();
  var monthNow = now.getMonth();
  var dateNow = now.getDate();

  var dob = new Date(dateString);

  var yearDob = dob.getFullYear();
  var monthDob = dob.getMonth();
  var dateDob = dob.getDate();
  var age = {};
  var ageString = "";
  var yearString = "";
  var monthString = "";
  var dayString = "";
  var yearAge = "";

  yearAge = yearNow - yearDob;

  if (monthNow >= monthDob)
    var monthAge = monthNow - monthDob;
  else {
    yearAge--;
    var monthAge = 12 + monthNow - monthDob;
  }

  if (dateNow >= dateDob)
    var dateAge = dateNow - dateDob;
  else {
    monthAge--;
    var dateAge = 31 + dateNow - dateDob;

    if (monthAge < 0) {
      monthAge = 11;
      yearAge--;
    }
  }

  age = {
    years: yearAge,
    months: monthAge,
    days: dateAge
  };

  $('#txtYears').val(yearAge);
  $('#txtMonths').val(monthAge);
  $('#txtDays').val(dateAge);

}

$('#file_upload').attr('src', returnUrl() + "/storage/documents/useremprty.png");

$('.tel').on('change', function () {
  var value = $(this).val();

  var regexPattern = new RegExp("^[0-9]{10}$");
  var is_matched = regexPattern.test(value);

  if (is_matched == false) {
    iziToast.error({
      title: 'Error',
      message: 'Incorrect Tel No!',
      position: 'topRight'
    });
  }
});


$('#txtNICNo').on('change', function () {
  var value = $(this).val();

  var regexPattern = new RegExp("^[0-9]{9}[V]{1}|[0-9]{12}$");
  var is_matched = regexPattern.test(value);

  if (is_matched == false) {

    iziToast.error({
      title: 'Error',
      message: 'Incorrect NIC No!',
      position: 'topRight'
    });
  }
  else {

    var NICNo = $("#txtNICNo").val();
    var dayText = 0;
    var year = "";
    var month = "";
    var day = "";
    var gender = "";

    if (NICNo.length != 10 && NICNo.length != 12) {
      $("#error").html("Invalid NIC NO");
    } else if (NICNo.length == 10 && !$.isNumeric(NICNo.substr(0, 9))) {
      $("#error").html("Invalid NIC NO");
    } else {

      // Year
      if (NICNo.length == 10) {
        year = "19" + NICNo.substr(0, 2);

        dayText = parseInt(NICNo.substr(2, 3));
      } else {
        year = NICNo.substr(0, 4);
        dayText = parseInt(NICNo.substr(4, 3));
      }

      // Gender
      if (dayText > 500) {
        gender = "Female";
        dayText = dayText - 500;
      } else {
        gender = "Male";
      }

      // Day Digit Validation
      if (dayText < 1 && dayText > 366) {
        $("#error").html("Invalid NIC NO");
      } else {

        //Month
        if (dayText > 335) {
          day = dayText - 335;
          month = 12;
        }
        else if (dayText > 305) {
          day = dayText - 305;
          month = 11;
        }
        else if (dayText > 274) {
          day = dayText - 274;
          month = 10;
        }
        else if (dayText > 244) {
          day = dayText - 244;
          month = 9;
        }
        else if (dayText > 213) {
          day = dayText - 213;
          month = 8;
        }
        else if (dayText > 182) {
          day = dayText - 182;
          month = 7;
        }
        else if (dayText > 152) {
          day = dayText - 152;
          month = 6;
        }
        else if (dayText > 121) {
          day = dayText - 121;
          month = 5;
        }
        else if (dayText > 91) {
          day = dayText - 91;
          month = 4;
        }
        else if (dayText > 60) {
          day = dayText - 60;
          month = 3;
        }
        else if (dayText < 32) {
          month = 1;
          day = dayText;
        }
        else if (dayText > 31) {
          day = dayText - 31;
          month = 2;
        }

        var today = new Date();

        var dd = parseInt(String(today.getDate()).padStart(2, '0'));
        var mm = parseInt(String(today.getMonth() + 1).padStart(2, '0'));
        var yy = today.getFullYear();

        if (dd >= day) {
          day = dd - day;
        }
        else {
          day = dd + 30 - day;
          mm -= 1;
        }

        if (mm >= month) {
          month = mm - month;
        }
        else {
          month = mm + 12 - month;
          yy -= 1;
        }

        year = yy - year;

        // Show Details
        $("#txtYears").val(year);
        $("#txtMonths").val(month);
        $("#txtDays").val(day);

        if (gender == "Male") {

          $("#drpGender").val("M");
        }
        else if (Gender == "Female") {
          $("#drpGender").val("F");
        }
        else {
          $("#drpGender").val("O");
        }
      }
    }
  }
});


$('.uuidfind').each(function () {
  var $this = $(this);
  var attrname = $this.attr('attr-uuid-find');

  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
  myHeaders.append("Cookie", "JSESSIONID=1A5193DBE052C38DC303BAD947A05A83");

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  fetch('/openmrs/ws/rest/v1/personattributetype?q=' + attrname, requestOptions)
    .then(response => response.json())
    .then(result => {

      $this.attr('uuid-value', result.results[0].uuid);
    })
    .catch(error => {
      console.log(error);
    });
});


$('#registerPatientForm').on('submit', function (e) {
  e.preventDefault();

  $('#btnSubmit').text('Please Wait!').attr('disabled', true);

  const formData = new FormData();
  const fileField = document.querySelector('input[type="file"]');

  formData.append('file', fileField.files[0]);

  if (fileField.files[0] != undefined && fileField.files[0] != null && fileField.files[0] != "") {

    fetch(returnUrl() + '/uploading-file-api', {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {

        var parts = data.file.split('/');
        var lastSegment = parts.pop() || parts.pop();

        savedate(lastSegment);
      })
      .catch(error => {
        console.error(error)
      })
  } else {

    savedate(0);
  }


  function savedate(profileimage) {
    //Generate phn no =========================================================================

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

        var personuuid = result.user.person.uuid;

        var requestHeaders = new Headers();
        requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
        requestHeaders.append("Cookie", "JSESSIONID=ED9DBD5CFD355A973EFFECD642D8331D");

        var requestOptions = {
          method: 'GET',
          headers: requestHeaders,
          redirect: 'follow'
        };

        fetch("/openmrs/ws/rest/v1/person/" + personuuid, requestOptions)
          .then(response => response.json())
          .then(result => {

            var InstituteUuid = "";
            jQuery(result.attributes).each(function (k, v) {
              if (v.display != null) {

                if (jQuery.trim(v.display.split("=")[0]) == "Institute Id") {
                  InstituteUuid = jQuery.trim(v.display.split("=")[1]);
                }
              }
            });

            var location = InstituteUuid;

            var requestHeaders = new Headers();
            requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
            requestHeaders.append("Cookie", "JSESSIONID=24D0761924138ED7E55C2CB6806B0633");

            var requestOptions = {
              method: 'GET',
              headers: requestHeaders,
              redirect: 'follow'
            };

            fetch("/openmrs/ws/rest/v1/location/" + location, requestOptions)
              .then(response => response.json())
              .then(result => {

                var InstituteName = result.display;
                var instituteId = ($.trim(result.attributes.find(x => x.display).display.split(":")[1]));

                fetch(returnUrl() + "/getmaxno", {
                  method: 'POST'
                })
                  .then(response => response.json())
                  .then(result => {
                    var nextNo = result;
                    var checkdigit = luhnCheckDigit(instituteId + "" + nextNo);

                    var generatedPhn = instituteId + "-" + nextNo + "-" + checkdigit;
                    $('#txtPhnno').val(generatedPhn);


                    var requestHeaders = new Headers();
                    requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
                    requestHeaders.append("Content-Type", "application/json");
                    requestHeaders.append("Cookie", "JSESSIONID=ED9DBD5CFD355A973EFFECD642D8331D");

                    var arrOfAttr = [];

                    var firstName = $('#txtFirstName').val();
                    var lastName = $('#txtLastName').val();
                    var gender = $('#drpGender').val();
                    var dob = $('#txtDob').val();
                    if (dob == "") {
                      dob = null;
                    }
                    var year = $('#txtYears').val();
                    var month = $('#txtMonths').val();
                    var days = $('#txtDays').val();
                    if (year == "" || year == 0) {
                      year = "";
                    }
                    if (month == "" || month == 0) {
                      month = "";
                    }
                    if (days == "" || days == 0) {
                      days = "";
                    }

                    var arr = [];
                    if ($('#txtPatientHistory').val() != "") {
                      var list = JSON.parse($('#txtPatientHistory').val());
                      $(list).each(function (k, v) {
                        arr.push(v.value);
                      });
                    }

                    var address = $('#txtAddress').val();
                    var addressLine2 = $('#txtAddressLine2').val();
                    var city = $('#txtCity').val();

                    var yearUuid = $('#txtYears').attr('uuid-value');
                    var monthUuid = $('#txtMonths').attr('uuid-value');
                    var dayUuid = $('#txtDays').attr('uuid-value');

                    var title = $('#drpTitle').val();
                    var titleUuid = $('#drpTitle').attr('uuid-value');

                    var civilStatus = $('#drpCivilStatus').val();
                    var civilStatusUuid = $('#drpCivilStatus').attr('uuid-value');

                    var ethnicity = $('#txtEthnicity').val();
                    var ethnicityUuid = $('#txtEthnicity').attr('uuid-value');

                    var race = $('#txtRace').val();
                    var raceUuid = $('#txtRace').attr('uuid-value');

                    var bloodGroup = $('#drpBloodGroup').val();
                    var bloodGroupUuid = $('#drpBloodGroup').attr('uuid-value');

                    var nicno = $('#txtNICNo').val();
                    var nicnoUuid = $('#txtNICNo').attr('uuid-value');

                    var telephoneHome = $('#txtTelephoneHome').val();
                    var telephoneHomeUuid = $('#txtTelephoneHome').attr('uuid-value');

                    var telephoneMobile = $('#txtTelephoneMobile').val();
                    var telephoneMobileUuid = $('#txtTelephoneMobile').attr('uuid-value');

                    var province = $('#drpProvince').val();
                    var provinceUuid = $('#drpProvince').attr('uuid-value');

                    var district = $('#drpDistrict').val();
                    var districtUuid = $('#drpDistrict').attr('uuid-value');

                    var dsoffice = $('#drpDSOffice').val();
                    var dsofficeUuid = $('#drpDSOffice').attr('uuid-value');

                    var gndivision = $('#drpGNDivision').val();
                    var gndivisionUuid = $('#drpGNDivision').attr('uuid-value');

                    var phn = $('#txtPhnno').val();
                    var phnUuid = $('#txtPhnno').attr('uuid-value');

                    var guardianName = $('#txtGuardianName').val();
                    var guardianNameUuid = $('#txtGuardianName').attr('uuid-value');

                    var guardianRelationship = $('#drpGardienRel').val();
                    var guardianRelationshipUuid = $('#drpGardienRel').attr('uuid-value');

                    var registerDate = $('#txtRegisterDate').val();
                    var registerDateUuid = $('#txtRegisterDate').attr('uuid-value');

                    var patientHistory = arr.toString();
                    var patientHistoryUuid = $('#txtPatientHistory').attr('uuid-value');

                    arrOfAttr.push(
                      { "attributeType": titleUuid, "value": title },
                      { "attributeType": civilStatusUuid, "value": civilStatus },
                      { "attributeType": phnUuid, "value": generatedPhn }
                    );

                    if (dob == null) {
                      if (year != "" && year != null) {
                        arrOfAttr.push(
                          { "attributeType": yearUuid, "value": year }
                        )
                      }
                      if (month != "" && month != null) {
                        arrOfAttr.push(
                          { "attributeType": monthUuid, "value": month }
                        )
                      }
                      if (days != "" && days != null) {
                        arrOfAttr.push(
                          { "attributeType": dayUuid, "value": days }
                        )
                      }
                    }
                    if (patientHistory != []) {
                      arrOfAttr.push(
                        { "attributeType": patientHistoryUuid, "value": patientHistory }
                      )
                    }
                    if (profileimage != 0) {
                      var profileImageUuid = $('#fileUp').attr('uuid-value');
                      arrOfAttr.push(
                        { "attributeType": profileImageUuid, "value": profileimage }
                      )
                    }
                    if (ethnicity != "" && ethnicity != null) {
                      arrOfAttr.push(
                        { "attributeType": ethnicityUuid, "value": ethnicity }
                      )
                    }
                    if (race != "" && race != null) {
                      arrOfAttr.push(
                        { "attributeType": raceUuid, "value": race }
                      )
                    }
                    if (bloodGroup != "" && bloodGroup != null) {
                      arrOfAttr.push(
                        { "attributeType": bloodGroupUuid, "value": bloodGroup },
                      )
                    }
                    if (nicno != "" && nicno != null) {
                      arrOfAttr.push(
                        { "attributeType": nicnoUuid, "value": nicno },
                      )
                    }
                    if (telephoneHome != "" && telephoneHome != null) {
                      arrOfAttr.push(
                        { "attributeType": telephoneHomeUuid, "value": telephoneHome },
                      )
                    }
                    if (telephoneMobile != "" && telephoneMobile != null) {
                      arrOfAttr.push(
                        { "attributeType": telephoneMobileUuid, "value": telephoneMobile },
                      )
                    }
                    if (province != "" && province != null) {
                      arrOfAttr.push(
                        { "attributeType": provinceUuid, "value": province },
                      )
                    }
                    if (district != "" && district != null) {
                      arrOfAttr.push(
                        { "attributeType": districtUuid, "value": district },
                      )
                    }
                    if (dsoffice != "" && dsoffice != null) {
                      arrOfAttr.push(
                        { "attributeType": dsofficeUuid, "value": dsoffice },
                      )
                    }
                    if (gndivision != "" && gndivision != null) {
                      arrOfAttr.push(
                        { "attributeType": gndivisionUuid, "value": gndivision },
                      )
                    }
                    if (guardianName != "" && guardianName != null) {
                      arrOfAttr.push(
                        { "attributeType": guardianNameUuid, "value": guardianName },
                      )
                    }
                    if (guardianRelationship != "" && guardianRelationship != null) {
                      arrOfAttr.push(
                        { "attributeType": guardianRelationshipUuid, "value": guardianRelationship },
                      )
                    }
                    if (registerDate != "" && registerDate != null) {
                      arrOfAttr.push(
                        { "attributeType": registerDateUuid, "value": registerDate },
                      )
                    }


                    var raw = JSON.stringify({
                      "names": [
                        {
                          "givenName": firstName,
                          "familyName": lastName
                        }
                      ],
                      "gender": gender,
                      "birthdate": dob,
                      "addresses": [
                        {
                          "address1": address,
                          "address2": addressLine2,
                          "cityVillage": city,
                          "country": "Sri Lanka",
                          "postalCode": "",
                          "stateProvince": province,
                          "countyDistrict": district,
                          "address3": dsoffice,
                          "address4": gndivision,
                        }
                      ],
                      "attributes": arrOfAttr
                    });

                    var requestOptions = {
                      method: 'POST',
                      headers: requestHeaders,
                      body: raw,
                      redirect: 'follow'
                    };

                    //Create Person====================================================================================
                    fetch('/openmrs/ws/rest/v1/person', requestOptions)
                      .then(response => response.json())
                      .then(result => {

                        iziToast.success({
                          title: 'OK',
                          message: 'Person Created Successfull!',
                          position: 'topRight'
                        });

                        var personUuid = result.uuid;

                        var requestHeaders = new Headers();
                        requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
                        requestHeaders.append("Cookie", "JSESSIONID=24D0761924138ED7E55C2CB6806B0633");

                        var requestOptionsx = {
                          method: 'GET',
                          headers: requestHeaders,
                          redirect: 'follow'
                        };

                        var requestHeadersy = new Headers();
                        requestHeadersy.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
                        requestHeadersy.append("Content-Type", "application/json");
                        requestHeadersy.append("Cookie", "JSESSIONID=24D0761924138ED7E55C2CB6806B0633");

                        var rawy = JSON.stringify({ "person": personUuid, "identifiers": [{ "identifier": phn, "identifierType": "05a29f94-c0ed-11e2-94be-8c13b969e334", "location": location, "preferred": false }] });

                        var requestOptionsy = {
                          method: 'POST',
                          headers: requestHeadersy,
                          body: rawy,
                          redirect: 'follow'
                        };

                        //Create Patient============================================================================
                        fetch("/openmrs/ws/rest/v1/patient", requestOptionsy)
                          .then(response => response.json())
                          .then(result => {

                            iziToast.success({
                              title: 'OK',
                              message: 'Patient created Successfully!',
                              position: 'topRight'
                            });

                            $('#btnSubmit').text('Save').attr('disabled', false);

                            Swal.fire({
                              title: 'Saved Successfully! PHN: ' + generatedPhn,
                              text: "You Will Be Redirect To Patient Dashboard!",
                              icon: 'success',
                              showDenyButton: true,
                              showCancelButton: false,
                              confirmButtonText: 'OK',
                              denyButtonText: 'Print PHN Card',
                            }).then((result) => {
                              if (result.isConfirmed) {

                                window.location = "/openmrs/coreapps/clinicianfacing/patient.page?patientId=" + personUuid;
                              } else if (result.isDenied) {

                                phnCardGenerateAndPrint(InstituteName, personUuid, generatedPhn);
                              }
                            });

                          }).catch(error => {
                            console.log(error);
                          });

                      })
                      .catch(error => {
                        console.log(error);
                      });


                  })
                  .catch(error => console.log('error', error));

              })
              .catch(error => console.log('error', error));

          })
          .catch(error => console.log('error', error));
      })
      .catch(error => console.log('error', error));
  }

});


function luhnCheckDigit(number) {
  var validChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVYWXZ_";
  number = number.toUpperCase().trim();
  var sum = 0;
  for (var i = 0; i < number.length; i++) {
    var ch = number.charAt(number.length - i - 1);
    if (validChars.indexOf(ch) < 0) {
      alert("Invalid character(s) found!");
      return false;
    }
    var digit = ch.charCodeAt(0) - 48;
    var weight;
    if (i % 2 == 0) {
      weight = (2 * digit) - parseInt(digit / 5) * 9;
    }
    else {
      weight = digit;
    }
    sum += weight;
  }
  sum = Math.abs(sum) + 10;
  var digit = (10 - (sum % 10)) % 10;
  return digit;
}


function phnCardGenerateAndPrint(InstituteName, personUuid, generatedPhn) {

  //PHN card print ===========================================================================

  $("#placeHolderInstituteName").text(InstituteName);

  var requestHeaders = new Headers();
  requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
  requestHeaders.append("Cookie", "JSESSIONID=24D0761924138ED7E55C2CB6806B0633");

  var requestOptions = {
    method: 'GET',
    headers: requestHeaders,
    redirect: 'follow'
  };

  // get person data
  fetch("/openmrs/ws/rest/v1/patient/" + personUuid, requestOptions)
    .then(response => response.json())
    .then(result => {

      var title = "";
      $(result.person.attributes).each(function (k, v) {
        if (v.display != null) {

          if ($.trim(v.display.split("=")[0]) == "Title") {
            title = $.trim(v.display.split("=")[1]);
          }
        }
      });

      $("#placeHolderPatientName").text(title + " " + $.trim(result.person.display.split(" ")[0]) + " " + $.trim(result.person.display.split(" ")[1]));
      $("#placeHolderPHN").text(generatedPhn);

      var requestHeaders = new Headers();
      requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
      requestHeaders.append("Cookie", "JSESSIONID=ED9DBD5CFD355A973EFFECD642D8331D");

      $.ajax({
        url: "/openmrs/ws/rest/v1/conceptreferenceterm?codeOrName=PhnFooter",
        type: "GET",
        dataType: "json",
        headers: requestHeaders,
        async: false,
        data: {},
        success: function (data) {

          $(data.results).each(function (k, v) {

            var str = v.display;
            var myArr = str.split(":");

            var mySubString = str.substring(
              str.lastIndexOf(":") + 1,
              str.lastIndexOf("(")
            );

            if ($.trim(myArr[0]) == "PhnFooterSinhala") {
              $('#phnTextSinhala').text(mySubString);
            }
            if ($.trim(myArr[0]) == "PhnFooterTamil") {
              $('#phnTextTamil').text(mySubString);
            }
            if ($.trim(myArr[0]) == "PhnFooterEnglish") {
              $('#phnTextEnglish').text(mySubString);
            }
          });
        }
      });

      let divDOM = document.getElementById("barcodeContainer");
      let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute('jsbarcode-value', generatedPhn);
      svg.setAttribute('jsbarcode-displayvalue', 'false');
      svg.setAttribute('jsbarcode-height', '50');
      svg.setAttribute('jsbarcode-width', '1');
      svg.className.baseVal = "barcode";
      divDOM.appendChild(svg);

      JsBarcode(".barcode").init();

      printElement();

      location.reload();

    })
    .catch(error => console.log('error', error));
}


function printElement() {
  var domClone = $("#printableContent").html();

  var mywindow = window.open("");
  mywindow.height;
  mywindow.document.write("<html><head>");
  mywindow.document.write("<style>.demo-wrap {position: relative;}");
  mywindow.document.write(".demo-wrap:before { content: ' '; display: block; position: absolute;");
  mywindow.document.write("left: 0; top: 0; width: 100%; height: 100%; opacity: 0.2;");
  mywindow.document.write("background-image: url('img/logo.png');");
  mywindow.document.write("background-repeat: no-repeat;");
  mywindow.document.write("background-position: center; background-size: auto 160px;}");
  mywindow.document.write("</style>");
  mywindow.document.write("</head>");
  mywindow.document.write(domClone);
  mywindow.document.write("</html>");
  mywindow.print();
  // mywindow.close();
}


loadProvinces();
function loadProvinces() {

  fetch(returnUrl() + '/loadProvince', {
    method: 'POST',
  })
    .then(response => response.json())
    .then(result => {

      var options = "";
      options += "<option disabled='true' selected='true'>--Select--</option>";
      $(result).each(function (key, val) {
        options += "<option value='" + val.location_id + "'>" + val.name + "</option>";
      });

      $('#drpProvince').html("");
      $('#drpProvince').html(options);

    })
    .catch(error => console.log('error', error));
}


$('#drpProvince').on('change', function (e) {

  var provinceId = $(this).val();
  loadDistricts(provinceId);
});


function loadDistricts(provinceId) {

  $.ajax({
    url: returnUrl() + '/loadDistrict',
    type: "POST",
    dataType: "json",
    async: false,
    data: { provinceId: provinceId },
    success: function (result) {

      var options = "";
      options += "<option disabled='true' selected='true'>--Select--</option>";
      $(result).each(function (key, val) {
        options += "<option value='" + val.location_id + "'>" + val.name + "</option>";
      });

      $('#drpDistrict').html("");
      $('#drpDistrict').html(options);
    }
  });
}


$('#drpDistrict').on('change', function (e) {

  var districtId = $(this).val();
  loadDsOffices(districtId);
});


function loadDsOffices(districtId) {

  $.ajax({
    url: returnUrl() + '/loadDsOffice',
    type: "POST",
    dataType: "json",
    async: false,
    data: { districtId: districtId },
    success: function (result) {

      var options = "";
      options += "<option disabled='true' selected='true'>--Select--</option>";
      $(result).each(function (key, val) {
        options += "<option value='" + val.location_id + "'>" + val.name + "</option>";
      });

      $('#drpDSOffice').html("");
      $('#drpDSOffice').html(options);
    }
  });
}

$('#drpDSOffice').on('change', function (e) {

  var dsofficeId = $(this).val();

  $.ajax({
    url: returnUrl() + '/LoadSelectedDSGN',
    type: "POST",
    dataType: "json",
    async: false,
    data: { dsofficeId: dsofficeId },
    success: function (result) {

      var options = "";
      options += "<option disabled selected>--Select--</option>";
      $(result).each(function (key, val) {
        options += "<option value='" + val.location_id + "'>" + val.name + "</option>";
      });

      $('#drpGNDivision').html("");
      $('#drpGNDivision').html(options);
    }
  });
});


loadGnDivisions();
function loadGnDivisions() {

  fetch(returnUrl() + '/loadGnDivision', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
  })
    .then(response => response.json())
    .then(result => {

      var options = "";
      options += "<option disabled='true' selected>--Select--</option>";
      $(result).each(function (key, val) {
        options += "<option value='" + val.location_id + "'>" + val.name + "</option>";
      });

      $('#drpGNDivision').html("");
      $('#drpGNDivision').html(options);
    })
    .catch(error => console.log('error', error));
}


$('#drpGNDivision').on('change', function (e) {

  var gnDivId = $(this).val();

  fetch(returnUrl() + '/ReverseLoadData', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 'gnDivId': gnDivId })
  })
    .then(response => response.json())
    .then(result => {

      $("#drpProvince").val(result.provinceId).trigger('change.select2');
      loadDistricts(result.provinceId);
      $("#drpDistrict").val(result.districtId).trigger('change.select2');
      loadDsOffices(result.districtId);
      $('#drpDSOffice').val(result.dsDivID).trigger('change.select2');
    })
    .catch(error => console.log('error', error));
});


$('#btnClear').on('click', function (e) {
  $('#registerPatientForm')[0].reset();
});

$('#txtSearch').on('keyup', function () {
  var value = $(this).val();

  if (value.length > 3) {

    var requestHeaders = new Headers();
    requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
    requestHeaders.append("Cookie", "JSESSIONID=24D0761924138ED7E55C2CB6806B0633");

    var requestOptions = {
      method: 'GET',
      headers: requestHeaders,
      redirect: 'follow'
    };

    fetch("/openmrs/ws/rest/v1/patient?q=" + value, requestOptions)
      .then(response => response.json())
      .then(result => {

        var html = "";
        html += '<table class="table table-bordered">';
        html += '<thead><tr><th>Name</th><th>Contact No</th></tr></thead><tbody id="tbodyUserDet" style="cursor: pointer;">';
        $(result.results).each(function (k, v) {

          var personUuid = v.uuid;

          var requestHeaders = new Headers();
          requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
          requestHeaders.append("Cookie", "JSESSIONID=ED9DBD5CFD355A973EFFECD642D8331D");

          $.ajax({
            url: "/openmrs/ws/rest/v1/person/" + personUuid,
            type: "GET",
            dataType: "json",
            headers: requestHeaders,
            async: false,
            data: {},
            success: function (data) {

              var TelephoneNumber = "";
              var personName = data.display;

              $(data.attributes).each(function (k, v) {
                if (v.display != null) {

                  if ($.trim(v.display.split("=")[0]) == "Telephone Number") {
                    TelephoneNumber = $.trim(v.display.split("=")[1]);
                  }
                }
              });

              html += '<tr><th>' + personName + '</th><th>' + TelephoneNumber + '</th></tr>';
            }
          });

        });
        html += '</tbody>';
        html += '</table>';

        $('#tableont').html("");
        $('#tableont').html(html);
      })
      .catch(error => console.log('error', error));
  }
});

$('#txtPhnno').on('change', function () {

  var phnVal = $(this).val();

  $('#file_upload').attr('src', returnUrl() + '/storage/documents/useremprty.png');
  $('.rof').val("");

  if (phnVal != "") {

    $.ajax({
      url: returnUrl() + "/getPersonUUidFromPHN",
      type: "POST",
      dataType: "json",
      data: { phn: phnVal },
      success: function (data) {

        loadFormData(data.uuid, phnVal);
      }, complete: function () {

        //=======Load History Patient======================
        $.ajax({
          url: returnUrl() + '/LoadHistoryPatient',
          type: "POST",
          dataType: "json",
          data: { phn: phnVal },
          success: function (data) {

            $(data).each(function (k, v) {

              var setArray = [];
              $(v.history.split(",")).each(function (ke, va) {
                setArray.push({
                  "value": va,
                  "readonly": true,
                  "title": "read-only tag"
                })
              });
              tagify.addTags(setArray);
            });
          }
        });

        //=======Load Complains Patient======================
        $.ajax({
          url: returnUrl() + '/LoadComplaintsPatient',
          type: "POST",
          dataType: "json",
          data: { phn: phnVal },
          success: function (data) {

            $(data).each(function (k, v) {

              var setArray = [];
              $(v.complaint.split(",")).each(function (ke, va) {
                setArray.push({
                  "value": va,
                  "readonly": true,
                  "title": "read-only tag"
                })
              });
              tagifyCom.addTags(setArray);
            });
          }
        });

        //=======Load Symptoms Patient======================
        $.ajax({
          url: returnUrl() + '/LoadSymptomsPatient',
          type: "POST",
          dataType: "json",
          data: { phn: phnVal },
          success: function (data) {

            $(data).each(function (k, v) {

              var setArray = [];
              $(v.name.split(",")).each(function (ke, va) {
                setArray.push({
                  "value": va,
                  "readonly": true,
                  "title": "read-only tag"
                })
              });
              tagifySym.addTags(setArray);
            });
          }
        });
      }
    });
  }
});

function loadFormData(uuid, phnVal) {

  var patientUuid = uuid;

  $('#patientUuid').val(patientUuid);

  var requestHeaders = new Headers();
  requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
  requestHeaders.append("Cookie", "JSESSIONID=24D0761924138ED7E55C2CB6806B0633");

  var requestOptions = {
    method: 'GET',
    headers: requestHeaders,
    redirect: 'follow'
  };

  fetch("/openmrs/ws/rest/v1/patient/" + patientUuid, requestOptions)
    .then(response => response.json())
    .then(result => {

      $('#txtLastName').val($.trim(result.person.display));
      $('#drpGender').val($.trim(result.person.gender));
      $('#txtDob').val($.trim(result.person.birthdate).split("T")[0]);

      if ($.trim(result.person.gender) == "F") {
        $('.showFemalOnlyPanel').show();
      } else {
        $('.showFemalOnlyPanel').hide();
      }

      if (result.person.birthdate != null) {
        getAge($.trim(result.person.birthdate))
      }

      $(result.person.attributes).each(function (k, v) {
        if (v.display != null) {

          if ($.trim(v.display.split("=")[0]) == "Title") {
            $('#drpTitle').val($.trim(v.display.split("=")[1]));
          }
          if ($.trim(v.display.split("=")[0]) == "Civil Status") {
            $('#drpCivilStatus').val($.trim(v.display.split("=")[1]));
          }
          if ($.trim(v.display.split("=")[0]) == "Ethnicity") {
            $('#txtEthnicity').val($.trim(v.display.split("=")[1]));
          }
          if ($.trim(v.display.split("=")[0]) == "Race") {
            $('#txtRace').val($.trim(v.display.split("=")[1]));
          }
          if ($.trim(v.display.split("=")[0]) == "Blood Group") {
            $('#drpBloodGroup').val($.trim(v.display.split("=")[1]));
          }
          if ($.trim(v.display.split("=")[0]) == "NIC No") {
            $('#txtNICNo').val($.trim(v.display.split("=")[1]));
          }
          if ($.trim(v.display.split("=")[0]) == "Telephone Home") {
            $('#txtTelephoneHome').val($.trim(v.display.split("=")[1]));
          }
          if ($.trim(v.display.split("=")[0]) == "Telephone Number") {
            $('#txtTelephoneMobile').val($.trim(v.display.split("=")[1]));
          }
          if ($.trim(v.display.split("=")[0]) == "Guardian Name") {
            $('#txtGuardianName').val($.trim(v.display.split("=")[1]));
          }
          if ($.trim(v.display.split("=")[0]) == "ProfileImage") {
            $('#file_upload').attr('src', returnUrl() + '/storage/documents/' + $.trim(v.display.split("=")[1]));
          }
          if ($('#txtDob').val() == "") {
            if ($.trim(v.display.split("=")[0]) == "Years") {
              $('#txtYears').val($.trim(v.display.split("=")[1]));
            }
            if ($.trim(v.display.split("=")[0]) == "Months") {
              $('#txtMonths').val($.trim(v.display.split("=")[1]));
            }
            if ($.trim(v.display.split("=")[0]) == "Days") {
              $('#txtDays').val($.trim(v.display.split("=")[1]));
            }
          }
          if ($.trim(v.display.split("=")[0]) == "Patient History") {
            var setArray = [];
            $($.trim(v.display.split("=")[1]).split(",")).each(function (k, v) {
              setArray.push({
                "value": v,
                "readonly": true,
                "title": "read-only tag"
              })
            });
            tagify.addTags(setArray);
          }
        }
      });

      var requestHeaders = new Headers();
      requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
      requestHeaders.append("Cookie", "JSESSIONID=ED9DBD5CFD355A973EFFECD642D8331D");

      var requestOptions = {
        method: 'GET',
        headers: requestHeaders,
        redirect: 'follow'
      };

      fetch("/openmrs/ws/rest/v1/person/" + patientUuid + "/address", requestOptions)
        .then(response => response.json())
        .then(resultzx => {

          $('#txtAddress').val($.trim(resultzx.results[0].address1) + ", " + $.trim(resultzx.results[0].address2) + ", " + $.trim(resultzx.results[0].cityVillage));

        })
        .catch(error => console.log('error', error));


    })
    .catch(error => console.log('error', error));
}

$(document).on('click', '#tbodyUserDet tr', function () {
  var personname = $(this).find('th:nth-child(1)').text();
  var personcontactno = $(this).find('th:nth-child(2)').text();

  $('#txtGuardianName').val(personname);
  $('#txtGuardianContactNo').val(personcontactno);
});




