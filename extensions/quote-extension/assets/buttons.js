const BACKEND_PORT = "http://localhost:5000"
let productResult
let data = [];
let userInfo = []
let getData = []
var modal = document.getElementById('myModal');
var span = document.getElementsByClassName("close")[0];
let ModalForm = document.getElementById('main-Modal-form')
let EmailSuccess = document.getElementById('sucess-form-msg')
let FetchData = []
let F2 = [];
let variant_size = []
let variant_title = ""
let variant_img = ""
let getvariants = JSON.parse(localStorage.getItem("variants")) === null ? "" : JSON.parse(localStorage.getItem("variants"))
let shopdetail = JSON.parse(localStorage.getItem("shop")) === null ? "" : JSON.parse(localStorage.getItem("shop"))
let arrr = {}
let adminMetaresult = []
let metfieldToken = []
let customerMetaresult = []
let fieldForms;
let ab = ""
let urlNew
let customFields = []
let setData
let metafiledLabel
let gridSettings
let subscription
let clickData = { isView: 0, isClick: 1 };
let viewData = { isView: 1, isClick: 0 };

console.log("fffffffff", productAllData)


conversionFunc(BACKEND_PORT, productAllData, shopdetail, viewData)

async function GetQuotes(FinalData) {
    FetchData = JSON.parse(FinalData.getAttribute("target-all"));
    urlNew = new URL(location.href).searchParams.get("variant");
    adminMetaresult = JSON.parse(FinalData.getAttribute("metafiledNew"));
    metfieldToken = JSON.parse(FinalData.getAttribute("metafiledToken"));
    customerMetaresult = JSON.parse(FinalData.getAttribute("metafiledNew1"));
    metafiledLabel = JSON.parse(FinalData.getAttribute("metafiledLabel"));
    gridSettings = JSON.parse(FinalData.getAttribute("gridSettings"));
    fieldForms = FinalData.getAttribute("metafieldForm");
    subscription = FinalData.getAttribute("subscription");
    let variantArr = [FetchData]
    variantArr.map((val) => {
        val.variants.map((data) => {
            if (data.id === parseInt(urlNew)) {
                if (data.featured_image === null) {
                    variant_img = "https:" + val.images[0]
                }
                else {
                    variant_img = data.featured_image.src
                }
                variant_size = data.options
            }
            else if (urlNew == null) {
                ab = val.variants[0].id
                val.variants.length = 1
                if (val.variants.length === 1) {
                    if (data.featured_image === null) {
                        variant_img = "https:" + val.images[0]
                    }
                    else {
                        variant_img = data.featured_image.src
                    }
                    variant_size = data.options
                }
            }
        })
    })
    data = {
        id: FetchData.id,
        image: variant_img,
        title: FetchData.title,
    }
    Modal()
}

document.addEventListener('keyup', function (e) {
    if (e.key === "Escape") {
        modal.style.display = "none";
    }
});


async function Modal() {
    var getVariantSize
    modal.style.display = "block";
    EmailSuccess.style.display = 'none';
    // create_account()
    ModalForm.style.display = 'block';
    span.onclick = function () {
        modal.style.display = "none";
    }

    for (let i = 0; i < FetchData.options.length; i++) {
        getVariantSize = FetchData.options[i]
        variant_title = FetchData.title
    }

    let wishlistBody = `<div class="row">
                        <div class="img"><img src=${variant_img}/></div>`
    wishlistBody += `<div class="col">
           
            <h1>${FetchData.title}</h1>`

    FetchData.options.map((data, index) => {
        variant_size.map((val, i) => {
            if (i === index) {
                if (data != "title" && val != "Default Title") {
                    wishlistBody += `<p >${data} :
                                     <span>${val}</span> </p>`;
                }
            }
        })
    })

    for (let i = 0; i < FetchData.options.length; i++) {
        arrr[FetchData.options[i]] = variant_size[i];
    }
    localStorage.setItem("variants", JSON.stringify(arrr))
    wishlistBody += '</div></div>';
    document.querySelector('.show-title').innerHTML = wishlistBody
    conversionFunc(BACKEND_PORT, FetchData, shopdetail, clickData)
    let customData;
    let formTag;
    let bodyy

    try {
        const response = await fetch(`${BACKEND_PORT}/form/customFormFields?shopName=${shopdetail[0].shop_name}`);
        const result = await response.json();
        customData = result.result[0].customForm

        customData = customData.replaceAll('<button ', '<button onclick="submitHandler()" ')

        const parser = new DOMParser();
        const html = parser.parseFromString(customData, 'text/html');
        bodyy = html.body.innerHTML

        // ---------------------- Left Left Single Grid  ---------------------- 

        if (metafiledLabel.label === "left_label" && gridSettings.grid === "Single_Grid") {
            const parser = new DOMParser();
            const html = parser.parseFromString(customData, 'text/html');

            // Single Grid
            const left_labelSingle_form = html.querySelectorAll('.rendered-form');
            left_labelSingle_form.forEach(i => {
                i.style.width = "40%";
                i.style.margin = 'auto';
            })

            const Form_group = html.querySelectorAll('.form-group ');
            Form_group.forEach(e => {
                e.style.display = "flex";
                e.style.justifyContent = "space-between";
                e.style.marginTop = "10px";
            });
            const radioCheckBox_Group = html.querySelectorAll('.rendered-form .radio-group, .rendered-form .checkbox-group');
            radioCheckBox_Group.forEach(input => {
                input.style.display = "flex";
                input.style.justifyContent = "center";
                input.style.alignItems = "center";
            });

            const input_Textarea_width = html.querySelectorAll('.rendered-form input, .rendered-form textarea');
            input_Textarea_width.forEach(input => {
                input.style.width = "70%";
            });
            const radioCheckBox_Group_input = html.querySelectorAll('.rendered-form .radio-group .formbuilder-radio input, .rendered-form .checkbox-group .formbuilder-checkbox input');
            radioCheckBox_Group_input.forEach(input => {
                input.style.width = "15%";
            });

            const Button_field = html.querySelectorAll('.formbuilder-button.form-group.field-button');
            Button_field.forEach(input => {
                input.style.display = "flex";
                input.style.justifyContent = "space-evenly";
                input.style.marginTop = "20px";
                input.style.marginLeft = "20%";
            });

            bodyy = html.body.innerHTML;
        }

        // ---------------------- Left Left Two Grid ----------------------  

        if (metafiledLabel.label === "left_label" && gridSettings.grid === "Two_Grid") {
            const parser = new DOMParser();
            const html = parser.parseFromString(customData, 'text/html');

            // Two Grid
            const left_labelTwo_form = html.querySelectorAll('.rendered-form');
            left_labelTwo_form.forEach(i => {
                i.style.position = "relative";
                i.style.display = 'grid';
                i.style.gridTemplateColumns = 'auto auto';
                i.style.margin = "auto";
                i.style.width = "86%";
                i.style.columnGap = "50px";
            })

            const All_labels = html.querySelectorAll('.formbuilder-text-label,.formbuilder-textarea-label');
            All_labels.forEach(label => {
                label.style.display = 'block';
                label.style.marginBottom = '2px';
                label.style.textAlign = "center"
            });

            const Form_group = html.querySelectorAll('.form-group');
            Form_group.forEach(e => {
                e.style.display = "flex";
                e.style.justifyContent = "space-between";
                e.style.alignItems = "center";
            });

            const radioCheckBox_Group = html.querySelectorAll('.rendered-form .radio-group, .rendered-form .checkbox-group');
            radioCheckBox_Group.forEach(input => {
                input.style.display = "flex";
                input.style.justifyContent = "center";
                input.style.alignItems = "center";
            });

            const input_Textarea_width = html.querySelectorAll('.rendered-form input, .rendered-form textarea');
            input_Textarea_width.forEach(input => {
                input.style.width = "70%";
            });

            const radioCheckBox_Group_input = html.querySelectorAll('.rendered-form .radio-group .formbuilder-radio input, .rendered-form .checkbox-group .formbuilder-checkbox input');
            radioCheckBox_Group_input.forEach(input => {
                input.style.width = "15%";
            });

            const Button_field = html.querySelectorAll('.formbuilder-button.form-group.field-button');
            Button_field.forEach(input => {
                input.style.marginTop = "5%";
                input.style.marginLeft = "15%";
                input.style.position = "absolute";
                input.style.bottom = '-50%';
                input.style.left = '4%'
            });
            bodyy = html.body.innerHTML
        }

        // ---------------------- Placeholder Single Grid ----------------------  

        if (metafiledLabel.label === "Placholder" && gridSettings.grid === "Single_Grid") {
            const parser = new DOMParser();
            const html = parser.parseFromString(customData, 'text/html');

            const PlacholderSingle_grid_input = html.querySelectorAll('.rendered-form input, .rendered-form textarea');
            PlacholderSingle_grid_input.forEach(input => {
                const labelForAttribute = input.parentElement.querySelector('label').textContent.trim();
                const formattedId = labelForAttribute.toLowerCase().replace(/\s+/g, '');
                input.name = formattedId;
                input.id = formattedId;
                input.placeholder = formattedId;
                input.style.width = "50%";
            });

            const All_labels = html.querySelectorAll('.formbuilder-text-label,.formbuilder-textarea-label, .formbuilder-date-label, .formbuilder-file-label, .formbuilder-number-label');
            All_labels.forEach(label => {
                label.style.display = 'none';
            });

            const checkAndRadioLabel = html.querySelectorAll('.rendered-form .radio-group, .rendered-form .checkbox-group');
            checkAndRadioLabel.forEach(label => {
                label.style.display = 'block';
            });

            const render_Form = html.querySelectorAll('.rendered-form');
            render_Form.forEach(i => {
                i.style.width = "40%";
                i.style.margin = 'auto';
            })

            const Form_group = html.querySelectorAll('.form-group ');
            Form_group.forEach(e => {
                e.style.display = "flex";
                e.style.justifyContent = "space-between";
                e.style.marginTop = "10px";
            });
            const radioCheckBox_Group = html.querySelectorAll('.rendered-form .radio-group, .rendered-form .checkbox-group');
            radioCheckBox_Group.forEach(input => {
                input.style.display = "flex";
                input.style.justifyContent = "center";
                input.style.alignItems = "center";
            });

            const input_Textarea_width = html.querySelectorAll('.rendered-form input, .rendered-form textarea');
            input_Textarea_width.forEach(input => {
                input.style.width = "70%";
            });
            const radioCheckBox_Group_input = html.querySelectorAll('.rendered-form .radio-group .formbuilder-radio input, .rendered-form .checkbox-group .formbuilder-checkbox input');
            radioCheckBox_Group_input.forEach(input => {
                input.style.width = "15%";
            });

            const Button_field = html.querySelectorAll('.formbuilder-button.form-group.field-button');
            Button_field.forEach(input => {
                input.style.display = "flex";
                input.style.justifyContent = "space-evenly";
                input.style.marginTop = "20px";
                input.style.marginLeft = "20%";
            });
            bodyy = html.body.innerHTML;
        }

        // ---------------------- Placholder Two Grid ----------------------  

        if (metafiledLabel.label === "Placholder" && gridSettings.grid === "Two_Grid") {
            const parser = new DOMParser();
            const html = parser.parseFromString(customData, 'text/html');

            const PlacholderTwo_grid_input = html.querySelectorAll('.rendered-form input, .rendered-form textarea');
            PlacholderTwo_grid_input.forEach(input => {
                const labelForAttribute = input.parentElement.querySelector('label').textContent.trim();
                const formattedId = labelForAttribute.toLowerCase().replace(/\s+/g, '');
                input.name = formattedId;
                input.id = formattedId;
                input.placeholder = formattedId;
            });

            // Two_Grid
            const Form_group = html.querySelectorAll('.rendered-form');
            Form_group.forEach(i => {
                i.style.position = "relative";
                i.style.display = 'grid';
                i.style.gridTemplateColumns = 'auto auto';
                i.style.gridColumnGap = "50px";
                i.style.margin = "0px 50px"
            })

            const All_labels = html.querySelectorAll('.formbuilder-text-label,.formbuilder-textarea-label, .formbuilder-date-label, .formbuilder-file-label, .formbuilder-number-label');
            All_labels.forEach(label => {
                label.style.display = 'none';
            });
            const text_textarea_Grid = html.querySelectorAll('.formbuilder-text, .formbuilder-textarea');
            text_textarea_Grid.forEach(e => {
                e.style.display = "flex";
                e.style.width = "100%";
                e.style.height = "30px";
                e.style.marginTop = "30px";
            });

            const radioCheckBox_Group = html.querySelectorAll('.rendered-form .radio-group, .rendered-form .checkbox-group');
            radioCheckBox_Group.forEach(input => {
                input.style.display = "flex";
                input.style.justifyContent = "space-between";
                input.style.alignItems = "center";
            });

            const input_Textarea_width = html.querySelectorAll('.rendered-form input, .rendered-form textarea');
            input_Textarea_width.forEach(input => {
                input.style.width = "100%";
            });

            const radioCheckBox_Group_input = html.querySelectorAll('.rendered-form .radio-group .formbuilder-radio input, .rendered-form .checkbox-group .formbuilder-checkbox input');
            radioCheckBox_Group_input.forEach(input => {
                input.style.width = "15%";
            });

            const Button_field = html.querySelectorAll('.formbuilder-button.form-group.field-button');
            Button_field.forEach(input => {
                input.style.marginTop = "5%";
                input.style.position = "absolute";
                input.style.bottom = '-50px'
            });

            bodyy = html.body.innerHTML
        }

        // ---------------------- Upper Label Single Grid ----------------------  
        if (metafiledLabel.label === "Upper_Label" && gridSettings.grid === "Single_Grid") {
            const parser = new DOMParser();
            const html = parser.parseFromString(customData, 'text/html');
            const UpperLabelSingle_form = html.querySelectorAll('.rendered-form');
            UpperLabelSingle_form.forEach(i => {
                i.style.width = "40%";
                i.style.margin = 'auto';
            })

            const Form_grpup = html.querySelectorAll('.form-group ');
            Form_grpup.forEach(e => {
                e.style.display = "flex";
                e.style.flexDirection = "column";
                e.style.justifyContent = "space-between";
                e.style.marginTop = "10px";
                e.style.width = "100%";
            });

            // Upper_Label
            const inputElements_label = html.querySelectorAll('.rendered-form input');
            inputElements_label.forEach(input => {
                const labelForAttribute = input.parentElement.querySelector('label').textContent.trim();
                const formattedId = labelForAttribute.toLowerCase().replace(/\s+/g, '');
                input.name = formattedId;
                input.id = formattedId;
            });


            const All_labels = html.querySelectorAll('.formbuilder-text-label, .formbuilder-textarea-label, .formbuilder-date-label, .formbuilder-checkbox-group-label, .formbuilder-number-label');
            All_labels.forEach(label => {
                label.style.display = 'block';
                label.style.marginBottom = '2px';
            });


            const input_Textarea = html.querySelectorAll('.rendered-form input,.rendered-form textarea');
            input_Textarea.forEach(input => {
                input.style.width = "70%";
                input.style.height = "30px"
            });

            const radioCheckBox_Groupheck = html.querySelectorAll('.rendered-form .radio-group .formbuilder-radio input, .rendered-form .checkbox-group .formbuilder-checkbox input');
            radioCheckBox_Groupheck.forEach(input => {
                input.style.width = "15%";
                input.style.height = "12px"
            });

            const radioGroup = html.querySelectorAll('.rendered-form .radio-group');
            radioGroup.forEach(i => {
                i.style.display = ' flex';
                i.style.justifyContent = 'flex-start';
            })


            const Button_field = html.querySelectorAll('.formbuilder-button.form-group.field-button');
            Button_field.forEach(input => {
                input.style.display = "flex";
                input.style.justifyContent = "space-evenly";
                input.style.marginBottom = "2px";
            });

            bodyy = html.body.innerHTML
        }

        // ---------------------- Upper Label Two Grid ----------------------  

        if (metafiledLabel.label === "Upper_Label" && gridSettings.grid === "Two_Grid") {
            const parser = new DOMParser();
            const html = parser.parseFromString(customData, 'text/html');
            // Two Grid
            const upperLabel_Rendered_Form = html.querySelectorAll('.rendered-form');
            upperLabel_Rendered_Form.forEach(i => {
                i.style.position = "relative";
                i.style.display = 'grid';
                i.style.gridTemplateColumns = 'auto auto';
                i.style.margin = "auto";
                i.style.width = "86%";
                i.style.columnGap = "50px";
            })

            const Formbuilder_Labels = html.querySelectorAll('.formbuilder-text-label,.formbuilder-textarea-label');
            Formbuilder_Labels.forEach(label => {
                label.style.display = 'block';
                label.style.marginBottom = '2px';
            });


            const Form_group = html.querySelectorAll('.form-group');
            Form_group.forEach(e => {
                e.style.display = "flex";
                e.style.flexDirection = 'column';
                e.style.marginBottom = "20px"
            });

            const radioCheckBox_Group = html.querySelectorAll('.rendered-form .radio-group, .rendered-form .checkbox-group');
            radioCheckBox_Group.forEach(input => {
                input.style.display = "flex";
                input.style.alignItems = "center";
            });

            const input_Textarea_width = html.querySelectorAll('.rendered-form input, .rendered-form textarea');
            input_Textarea_width.forEach(input => {
                input.style.width = "70%";
            });

            const radioCheckBox_Group_input = html.querySelectorAll('.rendered-form .radio-group .formbuilder-radio input, .rendered-form .checkbox-group .formbuilder-checkbox input');
            radioCheckBox_Group_input.forEach(input => {
                input.style.width = "15%";
            });

            const Button_field = html.querySelectorAll('.formbuilder-button.form-group.field-button');
            Button_field.forEach(input => {
                input.style.marginTop = "5%";
                input.style.marginLeft = "15%";
                input.style.position = "absolute";
                input.style.bottom = '-50%';
                input.style.left = '4%'
            });

            bodyy = html.body.innerHTML
        }

    } catch (error) {
        console.error("Error:", error);
    }

    document.getElementById("formm").innerHTML = bodyy
    const btnn = document.querySelectorAll('.rendered-form button')
    const btnId = btnn[0].getAttribute('id')

    document.getElementById(btnId).addEventListener("click", submitHandler);
    const allinput = document.querySelectorAll('.rendered-form input');

    allinput.forEach(input => {
        input.addEventListener("keydown", onFocusHandler);
    });


    async function submitHandler(e) {
        const variantId = urlNew === null ? ab : parseInt(urlNew)
        var todayDate = new Date().toLocaleString();
        let children = [];
        let idVar = [];
        e.preventDefault()
        let formChild = document.querySelector(".rendered-form").children
        let childArray = Array.from(formChild)
        const labelValues2 = [];

        childArray.map((w) => {
        })

        let idValue;
        let ValueArr;
        let combineArr;
        let getValue = [];
        const inputElements = document.querySelectorAll('.rendered-form input,.rendered-form textarea, .rendered-form select ');

        for (let i = 0; i < inputElements.length; i++) {
            const inputElement = inputElements[i];
            idValue = inputElement.getAttribute('id');
            const nameValue = inputElement.getAttribute('name');
            ValueArr = document.getElementById(idValue).value;
            idVar.push(
                {
                    key: nameValue,
                    value: ValueArr
                }
            );
            let tokens = [
                { key: "shopName", value: shopdetail[0].shop_name },
                { key: "shopDomain", value: shopdetail[0].shop_domain }
            ];

            combineArr = tokens.concat(idVar);
            let abc = subscription.replace(/"/g, "");

            if (abc === "Premium") {
                let New_Data = new FormData();
                const fileInput = document.getElementById(idValue);

                if (fileInput && fileInput.type === "file" && fileInput.files.length > 0) {
                    const file = fileInput.files[0];
                    New_Data.append('uploadFile', file);
                    const headers = {
                        'Content-Type': 'multipart/form-data',
                    };

                    axios.post(`${BACKEND_PORT}/upload`, New_Data, { headers })
                        .then(function (response) {
                            console.log('Post successfully created:', response);
                            dd = response;
                        })
                        .catch(function (error) {
                            console.error('Error:', error);
                        });
                } else {
                    console.log("File input not found or no files selected.");
                }
            }
        }

        const labelElements = document.querySelectorAll(".formbuilder-text-label, .formbuilder-textarea-label");
        labelElements.forEach((label) => {
            const inputId = label.getAttribute('for');
            const inputValue = label.textContent.trim();
            labelValues2.push(
                {
                    key: inputId,
                    value: inputValue
                }
            )
        });
        function replaceTokens(str) {
            for (let i = 0; i < combineArr.length; i++) {
                for (let k = 0; k < metfieldToken.length; k++) {
                    if (combineArr[i].key === metfieldToken[k].token) {
                        getValue.push(
                            {
                                [combineArr[i].key]: combineArr[i].value
                            }
                        )
                        str = str.replace("## " + metfieldToken[k].token + " ##", combineArr[i].value);
                        str = str.replace("## shopDomain ##", shopdetail[0].shop_domain)
                        str = str.replace("## shopName ##", shopdetail[0].shop_name)
                    }
                }
            }
            return str;
        }

        let subject = replaceTokens(adminMetaresult.subject)
        getData = {
            shop_email: adminMetaresult.adminEmail,
            shop_name: shopdetail[0].shop_name,
            subject: subject,
            admin_email: shopdetail[0].shop_email
        }
        var inputs = document.querySelectorAll('.rendered-form input');
        var All_labels = document.querySelectorAll(".formbuilder-text-label");
        let EmptyCheck = false;

        for (let i = 0; i < inputs.length; i++) {
            if (inputs[i].value === "") {
                if (!All_labels[i].innerHTML.includes("*")) {
                    All_labels[i].innerHTML = All_labels[i].innerHTML + " *";
                }
                inputs[i].style.border = "2px solid red";
                EmptyCheck = true;
            } else {
                inputs[i].style.border = "";
            }
        }

        if (EmptyCheck === true) {

        }
        else {
            for (let i = 0; i < getValue.length; i++) {
                const obj = getValue[i];
                if (obj.hasOwnProperty('fileupload')) {
                    obj.fileupload = obj.fileupload.replace('C:\\fakepath\\', '');
                }
            }

            let quantityInput = document.querySelector('input[name="quantity"]');
            var quantityValue = quantityInput.value;
            var formattedPrice = (FetchData.price / 100).toFixed(2)
            var totalAmount = formattedPrice * quantityValue;
            let detailArr_data = [{ id: FetchData.id, image: variant_img, title: FetchData.title, variants: JSON.stringify(arrr), variantId: variantId, quantity: quantityValue, price: formattedPrice, handle: FetchData.handle },
            { id: 2, image: 'https://mukesh-kumar004.myshopify.com/cdn/shop/products/bedroom-bed-with-brown-throw-pillows_925x_76c8c3a0-831b-47ac-a33a-5efdeb6cdee7.jpg?v=1685594875', title: "Black Beanbag", variants: JSON.stringify(arrr), variantId: 45499843838236, quantity: "50", price: "10", handle:"black-beanbag" }]


            try {
                const response = await fetch(`${BACKEND_PORT}/quote/createquote`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        userArr: JSON.stringify(getValue), shop: getData, detailArr_data: detailArr_data
                    }),
                })

                const result = await response.json();
                if (result.status === "success") {
                    document.getElementById("thankimg").style.width = "0"
                    document.getElementById("thankimg").style.height = "0"
                    setTimeout(() => {
                        document.getElementById("thankimg").style.width = "150px"
                        document.getElementById("thankimg").style.height = "150px"

                    }, 1500)
                    setTimeout(() => {
                        modal.style.display = "none";
                    }, 7000)

                    document.getElementById(idValue).value = ""
                    ModalForm.style.display = 'none';
                    EmailSuccess.style.display = 'block';
                    updateConversionFunc();
                }
            } catch (error) {
                console.error("Error:", error);
            }
        }
    }
}


async function updateConversionFunc() {
    try {
        const productData = await fetch(`${BACKEND_PORT}/quotes/updateproduct`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                productId: productResult.result[0].product_stats_id,
                conversion: productResult.result[0].conversions + 1,
                shopName: shopdetail[0].shop_name,
                modalsubmit: "modalsubmit"
            })
        })
        productResult = await productData.json();
    } catch (error) {
        console.error(`Download error: ${error}`);
    }
}

window.onclick = function (event) {
    if (event.target == modal) {
        if (typeof (modal) != 'undefined' && modal != null) {
            modal.style.display = "none";
        }
    }
}

// document.querySelector('#submitButton').addEventListener('click', function (event) {
//     event.preventDefault();
// });

function inputFocus(y) {
    if (y != undefined || y != null && document.getElementById(y).value != " " && document.getElementById(y).value != null) {
        document.getElementById(y.id).innerHTML = "";
    }
}

{ fieldForms }
function onFocusHandler(event) {
    const element = event.target;
    element.style.border = "";
    const label = element.parentElement.querySelector('label');
    label.innerHTML = label.innerHTML.replace(" *", "");
}


async function conversionFunc(BACKEND_PORT, FetchData, shopdetail, convData) {
    if (FetchData !== null) {
        try {
            const productData = await fetch(`${BACKEND_PORT}/prod/productstats?productId=${FetchData.id}`
            )
            productResult = await productData.json();

        } catch (error) {
            console.error(`Download error: ${error}`);
        }
        if (productResult.count[0].count === 0) {

            try {
                const productData = await fetch(`${BACKEND_PORT}/qoutes/insertproduct`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        productId: FetchData.id,
                        productName: FetchData.title,
                        shopName: shopdetail[0].shop_name,
                        convData: convData
                    })
                })

                productResult = await productData.json();
            } catch (error) {
                console.error(`Download error: ${error}`);
            }
        }
        else {
            try {
                const productData = await fetch(`${BACKEND_PORT}/quotes/updateproduct`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        productId: productResult.result[0].product_stats_id,
                        view: productResult.result[0].views + convData.isView,
                        click: productResult.result[0].clicks + convData.isClick,
                        shopName: shopdetail[0].shop_name,
                        modalview: "modalview"
                    })
                })
                productResult = await productData.json();
            } catch (error) {
                console.error(`Download error: ${error}`);
            }
        }
    }
}

