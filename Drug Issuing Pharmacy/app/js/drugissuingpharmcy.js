/* * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
import $ from 'jquery';
import iziToast from 'izitoast';
import "izitoast/dist/css/iziToast.min.css";
import select2 from 'select2';
import "select2/dist/css/select2.min.css";

(function () {
    'use strict';
    document.addEventListener("DOMContentLoaded", function (event) {
        console.log('Drug Issuing Pharmacy OpenMRS Open Web App Started.');
    });
}());


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

function userUuid() {

    var value = "";

    $.ajax({
        url: '/openmrs/ws/rest/v1/session',
        type: 'GET',
        dataType: 'json',
        async: false,
        data: {},
        success: function (data) {

            value = (data.user.uuid);
        }
    });

    return value;
}

function instituteUuid() {
    var value = "";

    $.ajax({
        url: '/openmrs/ws/rest/v1/session',
        type: 'GET',
        dataType: 'json',
        async: false,
        data: {},
        success: function (data) {

            var personuuid = data.user.person.uuid;

            $.ajax({
                url: '/openmrs/ws/rest/v1/person/' + personuuid,
                type: 'GET',
                dataType: 'json',
                async: false,
                data: {},
                success: function (data) {

                    var InstituteUuid = "";
                    $(data.attributes).each(function (k, v) {
                        if (v.display != null) {

                            if ($.trim(v.display.split("=")[0]) == "Institute Id") {
                                InstituteUuid = $.trim(v.display.split("=")[1]);
                            }
                        }
                    });

                    value = InstituteUuid;
                }
            });
        }
    });

    return value;
}

function availableUnitForUser(useruuid, insuuid) {

    var unit = "";
    var counter = "";

    $.ajax({
        url: returnUrl() + "/AvailableUnitForUser",
        type: 'POST',
        dataType: 'json',
        async: false,
        data: { useruuid: useruuid, insuuid: insuuid },
        success: function (data) {

            unit = (data[0].queue);
            counter = (data[0].counter);
        }
    });

    return [unit, counter];
}

var sectionId = "";
var InstituteUuid = "";
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
                    loadPendingList();

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

function ReturnConceptByUuid(uuid) {
    var result = "";
    $.ajax({
        url: '/openmrs/ws/rest/v1/concept/' + uuid,
        type: 'GET',
        dataType: 'json',
        async: false,
        data: {},
        headers: {
            'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
            'Content-Type': 'application/json'
        },
        success: function success(data) {

            result = (data);
        }
    });

    return result;
}

//==============================================================================================


$('#txtPhnNo').on('change', function () {
    var phn = $(this).val();

    $('#selPhn').val(phn);

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = yyyy + '/' + mm + '/' + dd;


    LoadOrderedDrugs(phn, today);
    LoadPreviousPrescribingListFunc(phn);
});

$('#btnCallNext').on('click', function () {
    var useruuid = userUuid();
    var insuuid = instituteUuid();
    var unitid = availableUnitForUser(useruuid, insuuid);

    $.ajax({
        url: returnUrl() + '/LoadTokenPharmacy',
        type: 'POST',
        dataType: 'json',
        data: {
            unit: unitid[0],
            counter: unitid[1],
            insuuid: insuuid
        },
        success: function (result) {

            $('#currentToken').text(result.token_number);

            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0');
            var yyyy = today.getFullYear();

            today = yyyy + '-' + mm + '-' + dd;

            $.ajax({
                url: returnUrl() + '/GetPHNFromTokenNo',
                type: 'POST',
                dataType: 'json',
                data: {
                    unit: unitid[0],
                    insuuid: insuuid,
                    token_number: result.token_number
                },
                success: function (result) {

                    $('#txtPhnNo').val(result.phn);
                    $('#selPhn').val(result.phn);

                    LoadOrderedDrugs(result.phn, today);
                    LoadPreviousPrescribingListFunc(result.phn);
                }
            });
        }
    });
});

$('#btnCallSpecificToken').on('click', function () {

    var tokenNo = $('#txtSpecToken').val();
    if (tokenNo == "") {
        iziToast.error({
            title: 'Error',
            message: 'Token Can\'t be null!',
            position: 'topRight'
        });
    }

    var useruuid = userUuid();
    var insuuid = instituteUuid();
    var unitid = availableUnitForUser(useruuid, insuuid);

    $.ajax({
        url: returnUrl() + '/CallSpecificToken',
        type: 'POST',
        dataType: 'json',
        data: {
            unit: unitid[0],
            insuuid: insuuid,
            tokenNo: tokenNo
        },
        success: function (result) {

            $('#currentToken').text(result.token_number);
            $('#txtPhnNo').val(result.phn);
            $('#selPhn').val(result.phn);


            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0');
            var yyyy = today.getFullYear();

            today = yyyy + '-' + mm + '-' + dd;

            loadDrugDrpAndData(result.phn, today)
            LoadPreviousPrescribingListFunc(result.phn);
        }
    });
});

function loadPendingList() {

    $.ajax({
        url: returnUrl() + '/LoadPendingListForPharmacy',
        type: 'POST',
        dataType: 'json',
        data: {
            InstituteUuid: InstituteUuid
        },
        success: function (data) {
            var tr = "";
            $(data).each(function (key, val) {
                tr += "<tr attr-id='" + val.id + "' attr-encounter='" + val.encounteruuid + "'>";
                tr += "<td attrval='" + val.phn + "'>" + val.phn + "</td>";
                tr += "<td>" + val.given_name + "</td>";
                tr += "<td>" + val.family_name + "</td>";
                tr += "<td>" + val.examinationdate + "</td>";
                tr += '<td style="text-align: center; padding: 6px;">\
                       <button class="btn btn-warning btnselectRow" type="button" \
                       style="padding: 2px 16px;border: 2px solid;border-radius: 15px;background: #ffc107;">\
                       Select</button></td>';
                tr += '<td style="text-align: center; padding: 6px;">\
                       <span class="fa fa-close deleterw" style="font-size: 22px; color: #cd3131;"></span></td>';
                tr += "</tr>";
            });

            $('#listTbody').html("");
            $('#listTbody').html(tr);
        }
    });
}


$(document).on('click', '.deleterw', function () {

    var id = $(this).parents('tr').attr('attr-id');

    $.ajax({
        url: returnUrl() + '/DeleteRwDrugIssuing',
        type: 'POST',
        dataType: 'json',
        data: { id: id },
        success: function (data) {

            iziToast.success({
                title: 'OK',
                message: 'Removed Successfully!',
                position: 'topRight'
            });

            loadPendingList();
        }
    });
});

$(document).on('click', '.btnselectRow', function () {

    $('#listTbody tr').removeClass('SelectedRowMain');
    $(this).parents('tr').addClass('SelectedRowMain');

    var currTrPhn = $(this).parents('tr').find('td:nth-child(1)').attr('attrval');
    var visitdate = $(this).parents('tr').find('td:nth-child(4)').text();
    var encounterUuid = $(this).parents('tr').attr('attr-encounter');

    LoadOrderedDrugs(currTrPhn, visitdate, encounterUuid);
    LoadPreviousPrescribingListFunc(currTrPhn);

    $('#selPhn').val(currTrPhn);
    $('#txtPhnNo').val(currTrPhn);
});

var doctorUUid = "";
function LoadOrderedDrugs(currTrPhn, visitdate, encounterUuid) {
    $.ajax({
        url: returnUrl() + '/LoadDrugDetailsForSelectedPhn',
        type: 'POST',
        dataType: 'json',
        data: { phn: currTrPhn, visitdate: visitdate, encounterUuid: encounterUuid },
        success: function (data) {

            var orderedDrug = "";
            orderedDrug += "<option disabled selected value=''>--Select--</option>";
            $(data).each(function (k, v) {
                var drugData = (ReturnConceptByUuid(v.drug));
                var name = drugData.display.split("@@")[1] + ' - ' + drugData.display.split("@@")[2];

                orderedDrug += `<option value='${v.drug}' attr-frequency='${v.frequency}' attr-dose='${v.dose}' attr-dosecomment='${v.dosecomment}' attr-period='${v.period}' attr-strength='${v.strength}' attr-qty='${v.totalqty}'>(${name}) - ${v.strength} </option>`;
            });

            $("#orderedDrug").html("");
            $("#orderedDrug").html(orderedDrug);

            doctorUUid = data[0].cby;

            $('#orderedDrug').select2({
                dropdownAutoWidth: true,
                width: '100%',
                templateResult: function (option, container) {
                    if ($(option.element).attr("attr-qty") == "0.00") {
                        $(container).css({ "background": "rgb(255 158 158)" }).attr('title', 'Stock Qty is 0');
                    }
                    return option.text;
                }
            });
        }
    });
}

$('#orderedDrug').on('change', function () {
    var drugUuid = $(this).val();
    var strength = $('#orderedDrug option:selected').attr('attr-strength');
    var frequency = $('#orderedDrug option:selected').attr('attr-frequency');

    LoadAvailableDrugsFunc(drugUuid);
    LoadDosesIssued(drugUuid);
    LoadBatchNos(drugUuid);

    var orderedDose = $('#orderedDrug option:selected').attr('attr-dose');
    var doseComment = $('#orderedDrug option:selected').attr('attr-dosecomment');
    if (doseComment == null) {
        doseComment = "";
    }
    var period = $('#orderedDrug option:selected').attr('attr-period');

    $('#txtOrderedDose').val(orderedDose);
    $('#txtDoseComment').val(doseComment);
    $('#txtPeriod').val(period);
    $('#drpIssuedDrugName').val(`${drugUuid}-${strength}`).trigger('change.select2');
    $('#drpIssuedDose').val(orderedDose).trigger('change.select2');
    $('#drpFrequency').val(frequency);
    $('#drpBatchNo').val($('#drpBatchNo option:eq(1)').val()).trigger('change');
});

function LoadAvailableDrugsFunc(drugUuid) {

    $.ajax({
        url: returnUrl() + '/LoadAvailableDrugsPhrmacy',
        type: "POST",
        dataType: "json",
        async: false,
        data: { InstituteUuid: instituteUuid(), drugUuid: drugUuid },
        success: function (data) {

            var options = "";
            options += "<option selected value=''>--Select--</option>";
            $(data).each(function (key, val) {
                $(val.fullStr.split('@@')[9].split('###')).each(function (k, v) {
                    var strength = v.split('^^^')[0];
                    options += `<option value='${val.conceptuuid}-${strength}' attr-druguuid='${val.conceptuuid}' attr-strength='${strength}' attr-qty='${val.totalqty}'>(${val.genericname}-${val.brandname}) - ${strength}</option>`;
                });
            });

            $('#drpIssuedDrugName').html("");
            $('#drpIssuedDrugName').html(options);

            $('#drpIssuedDrugName').select2({
                dropdownAutoWidth: true,
                width: '100%',
                templateResult: function (option, container) {
                    if ($(option.element).attr("attr-qty") == "0.00") {
                        $(container).css({ "background": "rgb(255 158 158)" }).attr('title', 'Stock Qty is 0');
                    }
                    return option.text;
                }
            });
        }
    });

}

$('#drpIssuedDrugName').on('change', function () {

    var conceptUuid = $('#drpIssuedDrugName option:selected').attr('attr-druguuid');
    LoadDosesIssued(conceptUuid);
});

function LoadDosesIssued(conceptUuid) {
    $.ajax({
        url: '/openmrs/ws/rest/v1/concept/' + conceptUuid,
        type: "GET",
        dataType: "json",
        async: false,
        data: {},
        success: function (data) {

            var options = "";
            options += "<option selected value=''>--Select--</option>";
            $(data.display.split("@@")[9].split("###")).each(function (key, val) {
                options += "<option value='" + val.split("^^^")[1] + "'>" + val.split("^^^")[1] + "</option>";
            });

            $('#drpIssuedDose').html("");
            $('#drpIssuedDose').html(options);

            $('#drpIssuedDose').select2({
                dropdownAutoWidth: true,
                width: '100%',
            });
        }
    });
}

LoadFrequenciesFunc();
function LoadFrequenciesFunc() {

    var uuidOfConcept = "";

    $.ajax({
        url: '/openmrs/ws/rest/v1/concept?name=Drugs Frequency',
        type: 'GET',
        dataType: 'json',
        async: false,
        data: {},
        headers: {
            'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
            'Content-Type': 'application/json'
        },
        success: function success(data) {

            uuidOfConcept = data.results[0].uuid;
        }
    });

    $.ajax({
        url: '/openmrs/ws/rest/v1/concept/' + uuidOfConcept,
        type: 'GET',
        dataType: 'json',
        async: false,
        data: {},
        headers: {
            'Authorization': 'Basic YWRtaW46QWRtaW4xMjM=',
            'Content-Type': 'application/json'
        },
        success: function success(data) {

            var options = "";
            options += "<option disabled value='' selected>--Select--</option>";
            $(data.setMembers).each(function (key, val) {

                options += "<option value='" + val.uuid + "' attr-factor='" + val.display.split("@@")[2] + "'>" + val.display.split("@@")[1] + "</option>";
            });

            $('#drpFrequency').html("");
            $('#drpFrequency').html(options);
        }
    });

}

function LoadBatchNos(drugUuid) {

    $.ajax({
        url: returnUrl() + '/LoadBatchNoList',
        type: "POST",
        dataType: "json",
        async: false,
        data: { InstituteUuid: instituteUuid(), DrugID: drugUuid },
        success: function (data) {

            var options = "";
            options += "<option selected value=''>--Select--</option>";
            $(data).each(function (key, val) {
                options += "<option value='" + val.batch_no + "'>" + val.batch_no + "</option>";
            });

            $('#drpBatchNo').html("");
            $('#drpBatchNo').html(options);

            $('#drpBatchNo').select2({
                dropdownAutoWidth: true,
                width: '100%',
            });

            $('#drpBatchNo').val($('#drpProvince option:eq(1)').val()).trigger('change.select2');
        }
    });
}

$('#btnAddDrug').on('click', function () {
    var orderedDrugText = $('#orderedDrug option:selected').text();
    var orderedDrug = $('#orderedDrug').val();
    var txtOrderedDose = $('#txtOrderedDose').val();
    var drpIssuedDrugName = $('#drpIssuedDrugName option:selected').attr('attr-druguuid');
    var drpIssuedDrugNameText = $('#drpIssuedDrugName option:selected').text();
    if (drpIssuedDrugName == '--Select--' || drpIssuedDrugName == "") {
        drpIssuedDrugName = "";
        drpIssuedDrugNameText = "";
    }
    var drpIssuedDose = $('#drpIssuedDose').val();
    if (drpIssuedDose == '--Select--') {
        drpIssuedDose = "";
    }
    var drpBatchNo = $('#drpBatchNo').val();
    var drpBatchNoText = $('#drpBatchNo option:selected').text();
    if (drpBatchNoText == '--Select--' || drpBatchNo == "") {
        drpBatchNo = "";
        drpBatchNoText = "";
    }
    var txtDoseComment = $('#txtDoseComment').val();
    var txtPeriod = $('#txtPeriod').val();
    var txtQty = $('#txtQty').val();
    var chkOutdoor = "";
    if ($("#chkOutdoor").is(':checked')) {
        chkOutdoor = "Outdoor";
    }
    var strength = $('#drpIssuedDrugName option:selected').attr('attr-strength');

    if (chkOutdoor != "Outdoor") {
        if (drpBatchNo == "" || orderedDrug == "" || drpIssuedDrugNameText == "" || txtQty == "") {

            iziToast.error({
                title: 'Error!',
                message: 'Ordered Drug, Issued Drug, Batch No and Qty required!',
                position: 'topRight'
            });

            return;
        } else {
            $('#tblBodyOrderedDrugs').append('<tr attr-strength="' + strength + '"><td attr-val="' + orderedDrug + '">' + orderedDrugText + '</td>\
            <td>'+ txtOrderedDose + '</td><td attr-val="' + drpIssuedDrugName + '">' + drpIssuedDrugNameText + '</td>\
            <td >' + drpIssuedDose + '</td><td attr-val="' + drpBatchNo + '">' + drpBatchNoText + '</td>\
            <td>'+ txtDoseComment + '</td><td>' + txtPeriod + '</td><td>' + txtQty + '</td><td>' + chkOutdoor + '</td>\
            <td style="text-align: center; padding: 6px;"><span class="fa fa-close deleteTr" \
            style="color: red; font-size: 18px;"></span></td></tr>');


            $('#orderedDrug').val("").trigger('change.select2');
            $('#txtOrderedDose').val("");
            $('#drpIssuedDrugName').val("").trigger('change.select2');
            $('#drpIssuedDose').val("").trigger('change.select2');
            $('#drpFrequency').val("");
            $('#drpBatchNo').val("").trigger('change.select2');
            $('#txtDoseComment').val("");
            $('#txtPeriod').val("");
            $('#txtQty').val("");
            $("#chkOutdoor").attr('checked', false)
        }
    } else {
        if (orderedDrug == "" || drpIssuedDrugNameText == "" || txtQty == "") {

            iziToast.error({
                title: 'Error!',
                message: 'Ordered Drug, Issued Drug and Qty required!',
                position: 'topRight'
            });

            return;
        } else {
            $('#tblBodyOrderedDrugs').append('<tr attr-strength="' + strength + '"><td attr-val="' + orderedDrug + '">' + orderedDrugText + '</td>\
            <td>'+ txtOrderedDose + '</td><td attr-val="' + drpIssuedDrugName + '">' + drpIssuedDrugNameText + '</td>\
            <td >' + drpIssuedDose + '</td><td attr-val="' + drpBatchNo + '">' + drpBatchNoText + '</td>\
            <td>'+ txtDoseComment + '</td><td>' + txtPeriod + '</td><td>' + txtQty + '</td><td>' + chkOutdoor + '</td>\
            <td style="text-align: center; padding: 6px;"><span class="fa fa-close deleteTr" \
            style="color: red; font-size: 18px;"></span></td></tr>');


            $('#orderedDrug').val("").trigger('change.select2');
            $('#txtOrderedDose').val("");
            $('#drpIssuedDrugName').val("").trigger('change.select2');
            $('#drpIssuedDose').val("").trigger('change.select2');
            $('#drpFrequency').val("");
            $('#drpBatchNo').val("").trigger('change.select2');
            $('#txtDoseComment').val("");
            $('#txtPeriod').val("");
            $('#txtQty').val("");
            $("#chkOutdoor").attr('checked', false)
        }
    }

});

$(document).on('click', '.deleteTr', function () {
    $(this).parents('tr').remove();
});

$('#btnSave').on('click', function () {

    var selected = new Array();
    var statprint = 0;
    $('#tblBodyOrderedDrugs tr').each(function () {
        var orderedDrug = $(this).find('td:nth-child(1)').attr('attr-val');
        var txtOrderedDose = $(this).find('td:nth-child(2)').text();
        var drpIssuedDrugName = $(this).find('td:nth-child(3)').attr('attr-val');
        var drpIssuedDose = $(this).find('td:nth-child(4)').text();
        var drpBatchNo = $(this).find('td:nth-child(5)').attr('attr-val');
        var txtDoseComment = $(this).find('td:nth-child(6)').text();
        var txtPeriod = $(this).find('td:nth-child(7)').text();
        var txtQty = $(this).find('td:nth-child(8)').text();
        var chkOutdoor = $(this).find('td:nth-child(9)').text();
        if (chkOutdoor == "Outdoor") {
            statprint = 1;
        }
        var strength = $(this).attr('attr-strength');
        selected.push([orderedDrug, txtOrderedDose, drpIssuedDrugName, drpBatchNo, txtDoseComment, txtPeriod, txtQty, chkOutdoor, drpIssuedDose, strength]);
    });

    var phnNo = $('#selPhn').val();
    var cby = userUuid();

    $.ajax({
        url: returnUrl() + '/SaveOrderedDrugs',
        type: 'POST',
        dataType: 'json',
        data: {
            phnNo: phnNo,
            selected: selected,
            cby: cby
        },
        success: function (data) {   

            if (statprint == 1) {
                setDataPrint(phnNo);
            }


            iziToast.success({
                title: 'OK',
                message: 'Saved Successfully!',
                position: 'topRight',
                timeout: 1000,
                onClosed: function () { location.reload(); },
            });
        }
    });
});

function setDataPrint(phnNo) {

    $.ajax({
        url: returnUrl() + '/GetPersonUuidFromUserUuid',
        type: 'post',
        dataType: 'json',
        async: false,
        data: {
            doctorUserUUid: doctorUUid,
        },
        success: function (data) {
            var doctorPersonUuid = data[0].uuid;

            $.ajax({
                url: "/openmrs/ws/rest/v1/person/" + doctorPersonUuid,
                type: 'GET',
                dataType: 'json',
                async: false,
                success: function (result) {
                    var title = "";
                    $(result.attributes).each(function (k, v) {
                        if (v.display != null) {
                            if ($.trim(v.display.split("=")[0]) == "Title") {
                                title = $('#drpTitle').val($.trim(v.display.split("=")[1]));
                            }
                        }
                    });

                    $("#userNameCon").text(title + " " + $.trim(result.display.split(" ")[0]) + " " + $.trim(result.display.split(" ")[1]));
                }
            });

        }
    });

    $.ajax({
        url: "/openmrs/ws/rest/v1/session/",
        type: 'GET',
        dataType: 'json',
        async: false,
        success: function (data) {

            var personuuid = data.user.person.uuid;

            $.ajax({
                url: "/openmrs/ws/rest/v1/person/" + personuuid,
                type: 'GET',
                dataType: 'json',
                async: false,
                success: function (result) {
                    var InstituteUuid = "";
                    var title = "";
                    $(result.attributes).each(function (k, v) {
                        if (v.display != null) {
                            if ($.trim(v.display.split("=")[0]) == "Institute Id") {
                                InstituteUuid = $.trim(v.display.split("=")[1]);
                            }
                            if ($.trim(v.display.split("=")[0]) == "Title") {
                                title = $('#drpTitle').val($.trim(v.display.split("=")[1]));
                            }
                        }
                    });

                    var location = InstituteUuid;

                    $.ajax({
                        url: "/openmrs/ws/rest/v1/location/" + location,
                        type: 'GET',
                        dataType: 'json',
                        async: false,
                        success: function (result) {

                            var InstituteName = result.display;
                            var instituteId = ($.trim(result.attributes.find(x => x.display).display.split(":")[1]));

                            $('#placeHolderInstituteName').text(InstituteName);
                        }
                    });
                }
            });

        }
    });

    $.ajax({
        url: returnUrl() + '/LoadPatientUUidFromPhn',
        type: 'POST',
        dataType: 'json',
        data: {
            phnNo: phnNo,
        },
        async: false,
        success: function (data) {

            var personUuid = data[0].uuid;

            $.ajax({
                url: "/openmrs/ws/rest/v1/patient/" + personUuid,
                type: 'GET',
                dataType: 'json',
                async: false,
                success: function (data) {

                    var title = "";
                    $(data.person.attributes).each(function (k, v) {
                        if (v.display != null) {

                            if ($.trim(v.display.split("=")[0]) == "Title") {
                                title = $.trim(v.display.split("=")[1]);
                            }
                        }
                    });

                    $("#placeHolderPatientName").text(title + " " + $.trim(data.person.display.split(" ")[0]) + " " + $.trim(data.person.display.split(" ")[1]));
                    $("#placeHolderPHN").text(phnNo);
                    getAge(data.person.birthdate);
                }
            });
        }
    });

    function getAge(dateString) {
        var today = new Date();
        var DOB = new Date(dateString);
        var totalMonths = (today.getFullYear() - DOB.getFullYear()) * 12 + today.getMonth() - DOB.getMonth();
        totalMonths += today.getDay() < DOB.getDay() ? -1 : 0;
        var years = today.getFullYear() - DOB.getFullYear();
        if (DOB.getMonth() > today.getMonth())
            years = years - 1;
        else if (DOB.getMonth() === today.getMonth())
            if (DOB.getDate() > today.getDate())
                years = years - 1;

        var days;
        var months;

        if (DOB.getDate() > today.getDate()) {
            months = (totalMonths % 12);
            if (months == 0)
                months = 11;
            var x = today.getMonth();
            switch (x) {
                case 1:
                case 3:
                case 5:
                case 7:
                case 8:
                case 10:
                case 12: {
                    var a = DOB.getDate() - today.getDate();
                    days = 31 - a;
                    break;
                }
                default: {
                    var a = DOB.getDate() - today.getDate();
                    days = 30 - a;
                    break;
                }
            }

        }
        else {
            days = today.getDate() - DOB.getDate();
            if (DOB.getMonth() === today.getMonth())
                months = (totalMonths % 12);
            else
                months = (totalMonths % 12) + 1;
        }

        months = ("0" + months).slice(-2);
        days = ("0" + days).slice(-2);

        $('#placeHolderAge').text(years + "Y" + months + "M" + days + "D");
    }

    var tr = "";
    $('#tblBodyOrderedDrugs tr').each(function () {

        var outdoor = $(this).find('td:nth-child(9)').text();
        if (outdoor == "Outdoor") {
            var drugname = $(this).find('td:nth-child(3)').text();
            var dose = $(this).find('td:nth-child(4)').text();
            var period = $(this).find('td:nth-child(6)').text();

            tr += "<tr><td>" + drugname + " " + dose + " " + period + "</td></tr>";
        }
    });
    $('#tBodyMedic').html("");
    $('#tBodyMedic').html(tr);

    printElement();
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

$('#btnSaveCallNext').on('click', function () {
    $('#btnSave').click();
    $('#btnCallNext').click();
});

function LoadPreviousPrescribingListFunc(phnNo) {

    $.ajax({
        url: returnUrl() + '/LoadPreviousPrescribingList',
        type: 'POST',
        dataType: 'json',
        async: false,
        data: { phnNo: phnNo },
        success: function (data) {

            var tr = "";
            $(data).each(function (key, val) {

                var orderedDrug = ReturnConceptByUuid(val.ordereddrug);
                var issuedDrug = ReturnConceptByUuid(val.issueddrug);
                var issueddose = (val.issueddose == null) ? '' : val.issueddose;
                var dosecomment = (val.dosecomment == null) ? '' : val.dosecomment;
                var batchno = (val.batchno == null) ? '' : val.batchno;


                tr += "<tr attr-strength='" + val.strength + "'>";
                tr += "<td attr-val='" + val.ordereddrug + "'>" + orderedDrug.name.display.split("@@")[1] + "</td>";
                tr += "<td>" + val.ordereddose + "</td>";
                tr += "<td attr-val='" + val.issueddrug + "'>" + issuedDrug.name.display.split("@@")[1] + "</td>";
                tr += "<td>" + issueddose + "</td>";
                tr += "<td>" + batchno + "</td>";
                tr += "<td>" + dosecomment + "</td>";
                tr += "<td>" + val.period + "</td>";
                tr += "<td>" + parseFloat(val.qty) + "</td>";
                tr += '<td style="text-align: center; padding: 6px;">\
                        <button class="btn btn-warning btnAddPrevPres" type="button" style="padding: 2px 16px;border: 2px solid;border-radius: 15px;background: #007bff;">Add</button></td>';
                tr += "</tr>";
            });

            $('#prevPresTbody').html("");
            $('#prevPresTbody').html(tr);
        }
    });
}

$(document).on('click', '.btnAddPrevPres', function () {

    var strength = $(this).parents('tr').attr('attr-strength');
    var orderedDrugText = $(this).parents('tr').find('td:nth-child(1)').text();
    var orderedDrug = $(this).parents('tr').find('td:nth-child(1)').attr('attr-val');
    var txtOrderedDose = $(this).parents('tr').find('td:nth-child(2)').text();
    var drpIssuedDrugName = $(this).parents('tr').find('td:nth-child(3)').attr('attr-val');
    var drpIssuedDrugNameText = $(this).parents('tr').find('td:nth-child(3)').text();
    var drpIssuedDose = $(this).parents('tr').find('td:nth-child(4)').text();
    var drpBatchNo = $(this).parents('tr').find('td:nth-child(5)').text();
    var txtDoseComment = $(this).parents('tr').find('td:nth-child(6)').text();
    var txtPeriod = $(this).parents('tr').find('td:nth-child(7)').text();
    var txtQty = $(this).parents('tr').find('td:nth-child(8)').text();
    var chkOutdoor = "Outdoor";

    $('#tblBodyOrderedDrugs').append('<tr attr-strength="' + strength + '">\
        <td attr-val="' + orderedDrug + '">' + orderedDrugText + '</td>\
        <td>'+ txtOrderedDose + '</td><td attr-val="' + drpIssuedDrugName + '">' + drpIssuedDrugNameText + '</td>\
        <td >' + drpIssuedDose + '</td><td>' + drpBatchNo + '</td>\
        <td>'+ txtDoseComment + '</td><td>' + txtPeriod + '</td><td>' + txtQty + '</td><td>' + chkOutdoor + '</td>\
        <td style="text-align: center; padding: 6px;"><span class="fa fa-close deleteTr" \
        style="color: red; font-size: 18px;"></span></td></tr>');
});

$('#btnRepeatAll').on('click', function () {

    $('#prevPresTbody tr').each(function () {
        var strength = $(this).attr('attr-strength');
        var orderedDrugText = $(this).find('td:nth-child(1)').text();
        var orderedDrug = $(this).find('td:nth-child(1)').attr('attr-val');
        var txtOrderedDose = $(this).find('td:nth-child(2)').text();
        var drpIssuedDrugName = $(this).find('td:nth-child(3)').attr('attr-val');
        var drpIssuedDrugNameText = $(this).find('td:nth-child(3)').text();
        var drpIssuedDose = $(this).find('td:nth-child(4)').text();
        var drpBatchNo = $(this).find('td:nth-child(5)').text();
        var txtDoseComment = $(this).find('td:nth-child(6)').text();
        var txtPeriod = $(this).find('td:nth-child(7)').text();
        var txtQty = $(this).find('td:nth-child(8)').text();
        var chkOutdoor = "Outdoor";

        $('#tblBodyOrderedDrugs').append('<tr attr-strength="' + strength + '">\
            <td attr-val="' + orderedDrug + '">' + orderedDrugText + '</td>\
            <td>'+ txtOrderedDose + '</td><td attr-val="' + drpIssuedDrugName + '">' + drpIssuedDrugNameText + '</td>\
            <td >' + drpIssuedDose + '</td><td>' + drpBatchNo + '</td>\
            <td>'+ txtDoseComment + '</td><td>' + txtPeriod + '</td><td>' + txtQty + '</td><td>' + chkOutdoor + '</td>\
            <td style="text-align: center; padding: 6px;"><span class="fa fa-close deleteTr" \
            style="color: red; font-size: 18px;"></span></td></tr>');

    });
});

$('#btnClear').on('click', function () {
    location.reload();
});

$('.calQty').on('change', function () {
    var strength = $('#orderedDrug option:selected').text();
    strength = parseInt(strength.substring(strength.lastIndexOf("-") + 1, strength.length).trim());
    var dose = parseInt($('#drpIssuedDose').val());
    var frequency = $('#drpFrequency option:selected').attr('attr-factor');
    var period = $('#txtPeriod').val();

    var Qty = (strength / dose) * frequency * period;
    $('#txtQty').val(parseInt(Qty));
});


