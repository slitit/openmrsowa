

var doctorUUid = "";

// function loadDrugDrpAndData(currTrPhn, visitdate) {
//     $.ajax({
//         url: returnUrl() + '/LoadDrugDetailsForSelectedPhn',
//         type: 'POST',
//         dataType: 'json',
//         data: { phn: currTrPhn, visitdate: visitdate },
//         success: function (data) {

//             $("#orderedDrug").html("");
//             var orderedDrugx = "<option value=\"\">--Select--<option>";
//             $(data).each(function (k, v) {
//                 orderedDrugx += "<option value=\"" + v.id + "\" attr-dose=\"" + v.dose + " " + v.dosetype + "\">" + v.generic_name + "</option>";
//             });

//             $("#orderedDrug").html(orderedDrugx);
//             doctorUUid = data[0].cby;

//         }
//     });
// }






$('#btnSave').on('click', function () {

    var selected = new Array();
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
        selected.push([orderedDrug, txtOrderedDose, drpIssuedDrugName, drpBatchNo, txtDoseComment, txtPeriod, txtQty, chkOutdoor, drpIssuedDose]);
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

            iziToast.success({
                title: 'OK',
                message: 'Saved Successfully!',
                position: 'topRight'
            });

            setDataPrint(phnNo);
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

        var outdoor = $(this).find('td:nth-child(8)').text();
        if (outdoor == "Outdoor") {
            var drugname = $(this).find('td:nth-child(3)').text();
            var dose = $(this).find('td:nth-child(2)').text();
            var period = $(this).find('td:nth-child(6)').text();

            tr += "<tr><td>" + drugname + " " + dose + " " + period + "</td></tr>";
        }
    })
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































































