var detailsOrder = [];
var dataHeader;
var sum = 0;
var APIInsipiroOrder = "http://localhost:5121/api/";
var js = jQuery.noConflict(true);

js(document).ready(function () {
    getHeaderData();
});

function getHeaderData() {
    js.ajax({
        url: APIInsipiroOrder + 'Food/GetAllFood',
        type: 'GET',
        contentType: 'application/json',
        success: function (result) {
            dataSource = json2array(result);
            dataHeader = dataSource;
            table = js("#tblOrder").DataTable({
                data: dataSource,
                destroy: true,
                bFilter: true,
                lengthMenu: [5, 10, 25, 50],
                pageLength: 5,
                processing: false,
                columns: [
                    { data: 'nameFood', targets:0, searchable:true },
                    { data: 'description', targets: 1, searchable: false },
                    { data: 'price', targets: 2, searchable: false },
                    {
                        data: null,
                        render: function (data, type, row, meta) {
                            return '<a onclick="details(' + data.foodID +')" class="btn btn-primary">detail</a>';
                        }
                    },
                ],
                columnDefs: [
                    { "orderable": false, "targets": 'no-sort' }
                ]
            });

            js('.input').on('keyup', function () {
                let string = $(this).val();
                table.columns(0).data().filter(function (value, index) {
                    return value === string ? true : false;
                }).draw();
            });

            checkListOrder();
           
        },
        error: function (error) {
            console.log(error);
        }
    });
}

function checkListOrder() {
    if (detailsOrder.length == 0) {
        $('#listOrder').hide();
    } else {
        $('#listOrder').show();
    }
}

function json2array(json) {
    var result = [];
    var keys = Object.keys(json);
    keys.forEach(function (key) {
        result.push(json[key]);
    });
    return result;
}

function details(fid) {
    $("#txtFoodId").val(fid);
    var desc = dataHeader.filter(x => x["foodID"] == fid)[0].description;
    $("#txtDescFood").val(desc);
    $("#txtDescFood").html(desc);
    $('#detailsorder').modal('show');
}

function btnSaveModalDetail() {
    var txtFoodId = $('#txtFoodId').val();
    var txtQty = $('#txtQty').val() == '' ? "0" : $('#txtQty').val();

    var name = dataHeader.filter(x => x["foodID"] == txtFoodId)[0].nameFood;
    var desc = dataHeader.filter(x => x["foodID"] == txtFoodId)[0].description;
    var price = dataHeader.filter(x => x["foodID"] == txtFoodId)[0].price;
        
    var details = {};
    details.NameFood = name;
    details.Description = desc;
    details.Price = price;
    details.FoodID = txtFoodId;
    details.OrderID = 0;
    details.Quantity = txtQty;
    details.Amount = (price * txtQty);

    if (txtQty != "0") {
        detailsOrder.push(details);
    }   

    console.log(detailsOrder);
    $('#detailsorder').modal('hide');
    $('#txtQty').val("");
    checkListOrder();
}

function Ordered() {
    dataList = json2array(detailsOrder);
    table = js("#tblOrdered").DataTable({
        data: dataList,
        destroy: true,
        bFilter: true,
        lengthMenu: [5, 10, 25, 50],
        pageLength: 5,
        processing: false,
        columns: [
            { data: 'NameFood', targets: 0, searchable: true },
            { data: 'Description', targets: 1, searchable: false },
            { data: 'Price', targets: 2, searchable: false },
            { data: 'Quantity', targets: 3, searchable: false },
            { data: 'Amount', targets: 4, searchable: false }
        ],
        columnDefs: [
            { "orderable": false, "targets": 'no-sort' }
        ]
    });
    
    let summary = 0;
    let c = detailsOrder.map((e) => e.Amount);
    c.forEach(e => {
        summary += e
    });

    sum = summary;
    $('#txtTotalAmount').html(sum);
   $('#detailsOrdered').modal('show');
}

function btnSaveModalDetailOrdered() {
    $('#detailsOrdered').modal('hide');
    $('#txtTotalPayment').html(sum);
    $('#txtTotalPaymentEntered').val("");    
    $('#detailsPayment').modal('show');
}

function btnSavePayment() {
    Swal.fire({
        title: 'Do you want to save the changes?',
        showCancelButton: true,
        confirmButtonText: 'Save'
    }).then((result) => {
        if (result.isConfirmed) {
            let pay = $('#txtTotalPayment').html();
            let payMust = $('#txtTotalPaymentEntered').val();

            var sendDetail = [];
            sendDetail = detailsOrder;
            for (var i = 0; i < sendDetail.length; i++) {
                delete sendDetail["NameFood"];
                delete sendDetail["Description"];
                delete sendDetail["Price"];
            };

            var jsonData = {
                CustomerID: 1,
                OrderDate: new Date(),
                PaymentDate: new Date(),
                TotalPayment: payMust,
                OrderDetail: sendDetail
            };

            var formData = new FormData();
            formData.append("jsonData", JSON.stringify(jsonData));

            if (pay == payMust) {
                $.ajax({
                    type: "POST",
                    url: APIInsipiroOrder + "OrderDetail/SaveDataOrder",
                    data: formData,
                    contentType: false,
                    processData: false,
                    success: function (response) {
                        Swal.fire("Payment Success!", "Enjoy Your Food", "success");
                        $('#detailsPayment').modal('hide');
                        detailsOrder = [];
                    },
                    error: function (e) {
                        $('#divPrint').html(e.responseText);
                    }
                });
            } else {
                Swal.fire("Failed!. Your Payment was Wrong", "Please re-input payment", "warning");
            }
        }
    });
}
