/* * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

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

                    loadSections(InstituteUuid);

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

//=======================================================================================

checkInstituteAdminLogin();
function checkInstituteAdminLogin() {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
    myHeaders.append("Cookie", "JSESSIONID=2D158E83ACFB788998C7DB495F07C1B9");

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    fetch("/openmrs/ws/rest/v1/session", requestOptions).then(function (response) {
        return response.json();
    }).then(function (result) {

        if (result.user.roles.filter(function (e) {
            return e.display === 'System Developer';
        }).length > 0) {
            $('.InstituteCont').show();
            $('.InstituteContHide').hide();
        } else {
            $('.InstituteCont').hide();
            $('.InstituteContHide').show();
        }

        var personuuid = result.user.person.uuid;

        var requestHeaders = new Headers();
        requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
        requestHeaders.append("Cookie", "JSESSIONID=ED9DBD5CFD355A973EFFECD642D8331D");

        var requestOptions = {
            method: 'GET',
            headers: requestHeaders,
            redirect: 'follow'
        };

        fetch("/openmrs/ws/rest/v1/person/" + personuuid, requestOptions).then(function (response) {
            return response.json();
        }).then(function (result) {

            var InstituteUuid = "";
            $(result.attributes).each(function (k, v) {
                if (v.display != null) {

                    if ($.trim(v.display.split("=")[0]) == "Institute Id") {
                        InstituteUuid = $.trim(v.display.split("=")[1]);
                    }
                }
            });

            var requestHeaders = new Headers();
            requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
            requestHeaders.append("Cookie", "JSESSIONID=24D0761924138ED7E55C2CB6806B0633");

            var requestOptions = {
                method: 'GET',
                headers: requestHeaders,
                redirect: 'follow'
            };

            fetch("/openmrs/ws/rest/v1/location/" + InstituteUuid, requestOptions).then(function (response) {
                return response.json();
            }).then(function (result) {

                var instituteName = result.display;
                $('#txtInstitute').val(instituteName).attr('insuuid', InstituteUuid);
            }).catch(function (error) {
                return console.log('error', error);
            });
        }).catch(function (error) {
            return console.log('error', error);
        });
    }).catch(function (error) {
        return console.log('error', error);
    });
}


loadRoles();
function loadRoles() {

    var requestHeaders = new Headers();
    requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
    requestHeaders.append("Cookie", "JSESSIONID=1A5193DBE052C38DC303BAD947A05A83");

    var requestOptions = {
        method: 'GET',
        headers: requestHeaders,
        redirect: 'follow'
    };

    fetch("/openmrs/ws/rest/v1/role?v=default", requestOptions).then(function (response) {
        return response.json();
    }).then(function (result) {

        var html = "";
        var c = 0;
        $(result.results).each(function (k, v) {

            if (v.display != "Privilege Level: Full" && v.display != "Anonymous") {

                if (c % 2 == 0) {
                    html += "<tr>";
                    html += "<td valign=\"top\">";
                    html += "<input id='" + k + "role' title='" + v.description + "' value='" + v.uuid + "' type=\"checkbox\" name=\"capabilities\" class=''>";
                    html += "<label for='" + k + "role' title='" + v.description + "' style=\"position: relative; top: -8px;\"> " + v.display + "</label>";
                    html += "</td>";
                }
                if (c % 2 == 1) {
                    html += "<td valign=\"top\">";
                    html += "<input id='" + k + "role' title='" + v.description + "' value='" + v.uuid + "' type=\"checkbox\" name=\"capabilities\" class=''>";
                    html += "<label for='" + k + "role' title='" + v.description + "' style=\"position: relative; top: -8px;\"> " + v.display + "</label>";
                    html += "</td>";
                    html += "</tr>";
                }

                c++;
            }
        });

        $('#capabilityTbody').html("");
        $('#capabilityTbody').html(html);
    }).catch(function (error) {
        return console.log('error', error);
    });
}


loadInstitutes();
function loadInstitutes() {

    $.ajax({
        url: returnUrl() + "/LoadMainTypeSelectedDataLookUp",
        type: 'POST',
        dataType: 'json',
        async: false,
        data: { mainType: 'Hospital' },
        success: function (data) {

            var options = "";
            options += "<option disabled selected>--Select--</option>";
            $(data).each(function (key, val) {
                options += "<option value='" + val.uuid + "'>" + (val.name) + "</option>";
            });

            $('#drpInstitute').html("");
            $('#drpInstitute').html(options);
        }
    });
}


function loadSections(insUuid) {

    $.ajax({
        url: returnUrl() + '/LoadSectionsForInstitute',
        type: 'POST',
        dataType: 'json',
        data: { InstituteUuid: insUuid },
        success: function (data) {

            var options = "";
            options += "<option selected>--Select--</option>";
            $(data).each(function (key, val) {
                options += "<option value='" + val.uuid + "'>" + val.name + "</option>";
            });

            $('#drpWorkStation').html("");
            $('#drpWorkStation').html(options);
        }
    });
}

$('#txtPassword').on('change', function () {
    var passLength = $(this).val().length;

    if (passLength < 4) {
        iziToast.error({
            title: 'Error',
            message: 'Password lenth must be greater than 4!',
            position: 'topRight'
        });

        $('#txtPassword').val("");
    }
});

$('#txtConfirmPassword').on('change', function () {
    var passConfirm = $(this).val();
    var pass = $('#txtPassword').val();

    if (pass != passConfirm) {
        iziToast.error({
            title: 'Error',
            message: 'Password & Confirm Password Not Matching!',
            position: 'topRight'
        });

        $('#txtConfirmPassword').val("");
    }
});


$('#btnSave').on('click', function () {

    $('#btnSave').attr('disabled', true).text('Please wait!');

    var txtFirstName = $('#txtFirstName').val();
    var txtLastName = $('#txtLastName').val();
    var drpGender = $('#drpGender').val();

    var txtUserName = $('#txtUserName').val();

    var drpInstitute = $('#drpInstitute').val();
    if (drpInstitute == null) {
        drpInstitute = $('#txtInstitute').attr('insuuid');
    }

    var txtPassword = $('#txtPassword').val();
    var txtConfirmPassword = $('#txtConfirmPassword').val();

    var arrRoles = [];
    $('input[name="capabilities"]:checked').each(function () {
        arrRoles.push($(this).val());
    });

    var arrOfAttr = [];
    $('.uuidfind').each(function () {
        var value = $(this).val();
        var attr_uuid = $(this).attr('uuid-value');

        if (value != '' && value != null) {
            arrOfAttr.push(
                { "attributeType": attr_uuid, "value": value }
            )
        }
    });

    arrOfAttr.push(
        { "attributeType": 'a7ecefb5-8faa-43d0-a400-6ced39f6a114', "value": drpInstitute }
    )

    if ($('#chkMakeAdmin').is(':checked')) {
        arrOfAttr.push(
            { "attributeType": '3780dac2-5c48-41a0-ba4f-5ca64cf1bd81', "value": true }
        )
    } else {
        arrOfAttr.push(
            { "attributeType": '3780dac2-5c48-41a0-ba4f-5ca64cf1bd81', "value": false }
        )
    }

    if (lookup == 0) {

        if (txtPassword != "" && txtUserName != "" && txtFirstName != "" && txtLastName != "") {

            if (txtPassword == txtConfirmPassword) {

                var myHeaders = new Headers();
                myHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
                myHeaders.append("Content-Type", "application/json");
                myHeaders.append("Cookie", "JSESSIONID=DF385B2E6E39E0BB49BB7E079BF31C44");

                var raw = JSON.stringify({
                    "username": txtUserName,
                    "password": txtConfirmPassword,
                    "person": {
                        "names": [{
                            "givenName": txtFirstName,
                            "familyName": txtLastName
                        }],
                        "gender": drpGender,
                        "attributes": arrOfAttr
                    },
                    "roles": arrRoles,
                    "systemId": txtUserName
                });

                var requestOptions = {
                    method: 'POST',
                    headers: myHeaders,
                    body: raw,
                    redirect: 'follow'
                };

                fetch("/openmrs/ws/rest/v1/user", requestOptions).then(function (response) {
                    return response.json();
                }).then(function (result) {

                    $('#btnSave').attr('disabled', false).text('Save');

                    iziToast.success({
                        title: 'OK',
                        message: 'Saved Successfully!',
                        position: 'topRight'
                    });


                    setTimeout(() => {
                        $('#btnNew').click();
                    }, 1000);

                    $('#txtInstitute').val("");
                }).catch(function (error) {
                    return console.log('error', error);
                });
            } else {
                iziToast.error({
                    title: 'Error',
                    message: 'Password & Confirm Password not matching!',
                    position: 'topRight'
                });
            }
        } else {
            iziToast.error({
                title: 'Error',
                message: 'Password, Username, First Name and Last Name fields cannot be empty!',
                position: 'topRight'
            });
        }
    } else {

        //================================= User Update =====================================

        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Cookie", "JSESSIONID=DF385B2E6E39E0BB49BB7E079BF31C44");

        var raw = JSON.stringify({
            "roles": arrRoles
        });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch("/openmrs/ws/rest/v1/user/" + $('#useruuid').val(), requestOptions).then(function (response) {
            return response.json();
        }).then(function (result) {

            $('#btnSave').attr('disabled', false).text('Update');

            iziToast.success({
                title: 'OK',
                message: 'Updated Successfully!',
                position: 'topRight'
            });

        }).catch(function (error) {
            return console.log('error', error);
        });

        var personUuid = $('#drpUsername').val();

        //================================= Person Update =====================================

        var requestHeaders = new Headers();
        requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
        requestHeaders.append("Content-Type", "application/json");
        requestHeaders.append("Cookie", "JSESSIONID=ED9DBD5CFD355A973EFFECD642D8331D");

        var raw = JSON.stringify({
            "gender": drpGender,
        });

        var requestOptions = {
            method: 'POST',
            headers: requestHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch("/openmrs/ws/rest/v1/person/" + personUuid, requestOptions)
            .then(response => response.json())
            .then(result => { })
            .catch(error => console.log('error', error));

        //================================= Person Name Update =====================================

        var nameuuid = "";
        $.ajax({
            url: "/openmrs/ws/rest/v1/person/" + personUuid + "/name",
            type: 'GET',
            dataType: 'json',
            async: false,
            body: {},
            success: function (data) {
                nameuuid = (data.results[0].uuid);
            }
        });

        var requestHeaders = new Headers();
        requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
        requestHeaders.append("Content-Type", "application/json");
        requestHeaders.append("Cookie", "JSESSIONID=ED9DBD5CFD355A973EFFECD642D8331D");

        var raw = JSON.stringify({ "givenName": txtFirstName, "familyName": txtLastName });

        var requestOptions = {
            method: 'POST',
            headers: requestHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch("/openmrs/ws/rest/v1/person/" + personUuid + "/name/" + nameuuid, requestOptions)
            .then(response => response.json())
            .then(result => { })
            .catch(error => console.log('error', error));


        //================================= Person Attribute Update =====================================

        $('.uuidfind.changed').each(function () {
            var $this = $(this);
            var attrvalueuuid = $this.attr('uuid-update-value');
            var attrname = $this.attr('attr-uuid-find');
            var attruuid = $this.attr('uuid-value');
            var value = $this.val();

            if (attrvalueuuid == undefined && value != "" && value != null) {

                var requestHeaders = new Headers();
                requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
                requestHeaders.append("Content-Type", "application/json");
                requestHeaders.append("Cookie", "JSESSIONID=ED9DBD5CFD355A973EFFECD642D8331D");

                var raw = JSON.stringify({
                    "attributeType": attruuid,
                    "value": value
                });
                var requestOptions = {
                    method: 'POST',
                    headers: requestHeaders,
                    body: raw,
                    redirect: 'follow'
                };

                fetch("/openmrs/ws/rest/v1/person/" + personUuid + "/attribute", requestOptions)
                    .then(response => response.json())
                    .then(result => {
                    })
                    .catch(error => console.log('error', error));
            } else {

                if (value != "" && value != null) {

                    var requestHeaders = new Headers();
                    requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
                    requestHeaders.append("Content-Type", "application/json");
                    requestHeaders.append("Cookie", "JSESSIONID=ED9DBD5CFD355A973EFFECD642D8331D");

                    var raw = JSON.stringify({
                        "attributeType": attruuid,
                        "value": value
                    });

                    var requestOptions = {
                        method: 'POST',
                        headers: requestHeaders,
                        body: raw,
                        redirect: 'follow'
                    };

                    fetch("/openmrs/ws/rest/v1/person/" + personUuid + "/attribute/" + attrvalueuuid + "", requestOptions)
                        .then(response => response.json())
                        .then(result => {
                        })
                        .catch(error => console.log('error', error));
                }
            }
        });

        var requestHeaders = new Headers();
        requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
        requestHeaders.append("Content-Type", "application/json");
        requestHeaders.append("Cookie", "JSESSIONID=ED9DBD5CFD355A973EFFECD642D8331D");

        var valued = "";
        if ($('#chkMakeAdmin').is(':checked')) {
            valued = true;
        } else {
            valued = false;
        }

        var raw = JSON.stringify({
            "attributeType": '3780dac2-5c48-41a0-ba4f-5ca64cf1bd81',
            "value": valued
        });
        var requestOptions = {
            method: 'POST',
            headers: requestHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch("/openmrs/ws/rest/v1/person/" + personUuid + "/attribute", requestOptions)
            .then(response => response.json())
            .then(result => {
            })
            .catch(error => console.log('error', error));

        setTimeout(() => {
            $('#btnNew').click();
        }, 1000);

    }
});


$('#drpInstitute').on('change', function () {
    var uuid = $(this).val();
    $('#txtInstitute').val(uuid).addClass('changed');

    loadSections(uuid);
});


$('#saveDesignation').on('click', function () {

    var designation = $('#txtNewDesignation').val();

    if (designation == "") {
        iziToast.error({
            title: 'Error',
            message: 'Designation cannot be empty!',
            position: 'topRight'
        });

        return;
    }

    fetch(returnUrl() + '/SaveNewDesignation', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'designation': designation })
    })
        .then(response => response.json())
        .then(result => {

            if (result == true) {
                iziToast.success({
                    title: 'OK',
                    message: 'Saved Successfully!',
                    position: 'topRight'
                });

                loadDesignations();

            } else if (result == false) {
                iziToast.error({
                    title: 'Error',
                    message: 'Designation already Exists!',
                    position: 'topRight'
                });
            }

            $('#txtNewDesignation').val("");
        })
        .catch(error => console.log('error', error));
});


loadDesignations()
function loadDesignations() {
    fetch(returnUrl() + '/LoadDesignations', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    })
        .then(response => response.json())
        .then(result => {

            var options = "";
            options += "<option disabled selected>--Select--</option>";
            $(result).each(function (key, val) {

                options += "<option value='" + val.id + "'>" + $.trim(val.designation) + "</option>";
            });

            $('#drpDesignation').html("");
            $('#drpDesignation').html(options);

        })
        .catch(error => console.log('error', error));
}


$('.hideShow').show();
$('.showHide').hide();
var lookup = 0;
$('#btnLookUp').on('click', function () {

    lookup = 1;
    $('.hideShow').hide();
    $('.showHide').show();
    $('#btnSave').text('Update');
    $('#txtPassword').attr('disabled', true);
    $('#txtConfirmPassword').attr('disabled', true);
    $('.InstituteContHide').hide();
    loadUsers();
});


function loadUsers() {

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

            var superuser = 0;
            if (result.user.roles.filter(e => e.display === 'System Developer').length > 0) {
                superuser = 1;
            }

            fetch(returnUrl() + '/LoadUsers', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    InstituteUuid: $('#txtinstituteuuid').val(),
                    superuser: superuser
                })
            })
                .then(response => response.json())
                .then(result => {

                    var options = "";
                    options += "<option disabled selected>--Select--</option>";

                    $(result).each(function (key, val) {
                        options += "<option value='" + val.uuid + "' attr-useruuid='" + val.useruuid + "'>" + val.username + "</option>";
                    });

                    $('#drpUsername').html("");
                    $('#drpUsername').html(options);

                })
                .catch(error => console.log('error', error));
        })
        .catch(error => console.log('error', error));
}


$('#drpUsername').on('change', function () {

    var personUuid = $(this).val();

    $('.clr').val("");
    $("input[type='checkbox']").attr('checked', false);

    $('#drpWorkStation').val("");
    var useruuid = $('#drpUsername option:selected').attr('attr-useruuid');
    $('#useruuid').val(useruuid);

    var requestHeaders = new Headers();
    requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
    requestHeaders.append("Cookie", "JSESSIONID=24D0761924138ED7E55C2CB6806B0633");

    var requestOptions = {
        method: 'GET',
        headers: requestHeaders,
        redirect: 'follow'
    };

    fetch("/openmrs/ws/rest/v1/person/" + personUuid, requestOptions)
        .then(response => response.json())
        .then(result => {

            $('#txtFirstName').val($.trim(result.display.split(" ")[0]));
            $('#txtLastName').val($.trim(result.display.split(" ")[1]));
            $('#drpGender').val($.trim(result.gender));

            $(result.attributes).each(function (k, v) {

                if (v.display != null) {

                    $(".form-control[attr-uuid-find]").each(function () {
                        var $this = $(this);
                        var attrname = $this.attr('attr-uuid-find');
                        if ($.trim(v.display.split("=")[0]) == attrname) {
                            $this.val($.trim(v.display.split("=")[1]));
                        }
                    });
                }
            });

        })
        .catch(error => console.log('error', error));

    //========================== Load Assigned Roles For User  =========================================

    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
    myHeaders.append("Cookie", "JSESSIONID=DF385B2E6E39E0BB49BB7E079BF31C44");

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    fetch("/openmrs/ws/rest/v1/user/" + $('#useruuid').val(), requestOptions)
        .then(response => response.json())
        .then(result => {
            $(result.roles).each(function (k, v) {
                var roleUUid = v.uuid;
                $('#capabilityTbody tr td input[value="' + roleUUid + '"]').attr('checked', true);
            });
        })
        .catch(error => console.log('error', error));

    loadAllAttributes(personUuid);
});


function loadAllAttributes(personUuid) {
    var requestHeaders = new Headers();
    requestHeaders.append("Authorization", "Basic YWRtaW46QWRtaW4xMjM=");
    requestHeaders.append("Cookie", "JSESSIONID=ED9DBD5CFD355A973EFFECD642D8331D");

    var requestOptions = {
        method: "GET",
        headers: requestHeaders,
        redirect: "follow",
    };

    fetch("/openmrs/ws/rest/v1/person/" + personUuid + "/attribute/", requestOptions)
        .then((response) => response.json())
        .then((result) => {
            $(result.results).each(function (k, v) {
                var attrnamedb = v.attributeType.display;
                var attruuid = v.uuid;
                console.log(v)

                $(".uuidfind").each(function () {
                    var $this = $(this);
                    var attrname = $this.attr("attr-uuid-find");

                    if (attrnamedb == attrname) {
                        $this.attr("uuid-update-value", attruuid);
                    }
                });

                if (v.attributeType.display == "Institute Id") {
                    $('#drpInstitute').val(v.value);
                }

                if (v.attributeType.display == "InsAdmin") {
                    if (v.value == "true") {
                        $('#chkMakeAdmin').attr('checked', v.value);
                    } else {
                        $('#chkMakeAdmin').attr('checked', v.value);
                    }
                }
            });
        })
        .catch((error) => console.log("error", error));
}


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

$("input").on("keyup", function () {
    $(this).addClass("changed");
});

$("input").on("change", function () {
    $(this).addClass("changed");
});

$("select").on("change", function () {
    $(this).addClass("changed");
});

$('#btnNew').on('click', function () {
    location.reload();
});

$('#btnChangePassword').on('click', function () {
    window.open('/adminui/myaccount/changePassword.page', '_self');
});

