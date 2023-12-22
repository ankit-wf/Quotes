import React, { useRef, useEffect, useState } from "react";
import { useAuthenticatedFetch } from '../hooks'
import useSubscriptionUrl from '../hooks/useSubscriptionUrl'
import { Text, Spinner } from '@shopify/polaris';
import useApi from '../hooks/useApi';


const formData = [
  {
    type: "header",
    subtype: "h1",
    label: "Build you form"
  },
  {
    type: "paragraph",
    label: "You can build your form using drag and drop elements."
  }

];




const QuoteForm = () => {
  const [status, setStatus] = useState("");
  const [shop, setShop] = useState();
  const metafieldHook = useApi();
  const subscription = useSubscriptionUrl();
  const fb = useRef({});
  const [show, setShow] = useState(false);
  const [test, setTest] = useState(false);
  const [metaId, setMetaId] = useState("");
  const fBuilder = useRef();
  const shopApi = useApi();
  const fetch = useAuthenticatedFetch();
  const [loading, setLoading] = useState(true);

  useEffect(async () => {
    const metafieldId = await metafieldHook.metafield()
    let planName = ""
    setMetaId(metafieldId);
    setShow(true);

    try {
      const response = await fetch(`/api/subscription/planstatus`);
      const result = await response.json();
      planName = await subscription.subscriptionArr(result.data)
      if (planName === "") {
        setStatus("Free")
      }
      setStatus(planName)
    } catch (error) {
      console.error("Error:", error);
    }

    const shopN = await shopApi.shop()
    setShop(shopN.shopName)
    setTest(true)
    getForm();

  }, [show, test]);

  async function getForm() {
    let formOptions;

    try {

      const response = await fetch(`api/getCustomForm?shopName=${shop}`);
      const result = await response.json();
      if (result.data.length !== 0) {
        const parsedForm = JSON.parse(result.data[0].xmlForm);
        if (parsedForm) {
          formOptions = {
            defaultFields: parsedForm,
            disabledAttrs: disabledAttributes,
            disableFields:
              status === "Free"
                ? FreedisableFields
                : status === "Basic"
                  ? BasicdisableFields
                  : status === "Premium"
                    ? PremiumdisableFields
                    : [],
            controlPosition: "right",
          };
        } else {
          formOptions = defaultOption;
        }
      } else {
        formOptions = defaultOption;
      }
      setLoading(false)
    } catch (error) {
      console.error("Error:", error);
    }

    if (show) {
      let count = $(fb.current).find('.form-builder').length;
      count = count > 0 ? count - 1 : count
      try {
        console.log("count", count)
        if (count < 1) {
          console.log("free")
          if (status === "Free") {
            fBuilder.current = $(fb.current).formBuilder(formOptions, { formData });
          } else if (status === "Basic") {
            fBuilder.current = $(fb.current).formBuilder(formOptions, { formData });
          } else if (status === "Premium") {
            fBuilder.current = $(fb.current).formBuilder(formOptions, { formData });
          }
        }
      } catch (err) {
        console.warn("formData not available yet.");
        console.error("Error: ", err);
      }
    }
  }

  let defaultForm = [
    {
      className: "form-control",
      label: "Name",
      subtype: "text",
      placeholder: "",
      name: "name",
      type: "text",
    },
    {
      className: "form-control",
      label: "Email",
      subtype: "email",
      placeholder: "",
      name: "email",
      type: "text",
    },
    {
      type: "textarea",
      required: false,
      label: "Message",
      placeholder: "",
      className: "form-control",
      name: "textarea",
      access: false,
      subtype: "textarea",
    },
    {
      type: "button",
      subtype: "submit",
      label: "Submit",
      className: "btn-primary btn",
      name: "button",
      access: false,
      style: "primary",
    },
  ]

  let FreedisableFields = [
    'autocomplete',
    'checkbox-group',
    'date',
    'file',
    'header',
    'hidden',
    'number',
    'paragraph',
    'select',
    'radio-group',
    'starRating',
  ]

  let BasicdisableFields = [
    'autocomplete',
    'date',
    'file',
    'header',
    'hidden',
    'starRating',
    'number',
    'radio-group',
    'starRating',
  ]

  let PremiumdisableFields = [];
  let disabledAttributes = ["required", "description"];
  let defaultOption = {
    defaultFields: defaultForm,
    disabledAttrs: disabledAttributes,
    disableFields:
      status === "Free"
        ? FreedisableFields
        : status === "Basic"
          ? BasicdisableFields
          : status === "Premium"
            ? PremiumdisableFields
            : [],
    controlPosition: "right",
  };

  let htmlForm = `<div class="rendered-form"><div class="formbuilder-text form-group field-name"><label for="name" class="formbuilder-text-label">Name</label><input type="text" placeholder="" class="form-control" name="name" id="name"></div><div class="formbuilder-text form-group field-email"><label for="email" class="formbuilder-text-label">Email</label><input type="email" placeholder="" class="form-control" name="email" id="email"></div><div class="formbuilder-textarea form-group field-textarea"><label for="message" class="formbuilder-textarea-label">Message</label><textarea placeholder="" class="form-control" name="textarea"id="textarea"></textarea></div><div class="formbuilder-button form-group field-button"><button type="submit" class="btn-primary btn" name="button" style="primary" id="button">Submit</button></div></div> `
  let defaultTokens = [
    { token: " shopName " },
    { token: " shopDomain " },
    { token: " shopLogo " },
    { token: "name" },
    { token: "email" },
    { token: "message" },
  ];

  const [isEmailThere, setIsEmailThere] = useState(false);
  const handleShowData = async () => {
    var dataForm = fBuilder.current.actions.getData('xml')
    const parser = new DOMParser();
    var xmlDoc = parser.parseFromString(dataForm, 'application/xml');
    const isEmail = xmlDoc.querySelectorAll('field[subtype="email"]');
    if (isEmail.length !== 0) {
      setIsEmailThere(false)
      fBuilder.current.actions.showData();
      fBuilder.current.actions.getData('xml');
      fBuilder.current.actions.save();
      const jsonData = fBuilder.current.actions.getData('json');
      var formRenderOpts = {
        dataType: 'xml',
        formData: dataForm
      };

      var renderedForm = $('<div/>');
      renderedForm.formRender(formRenderOpts);
      let customerData = renderedForm.html()
      const doc = parser.parseFromString(customerData, 'text/html');

      let modifiedHTMLString = doc.querySelector('html').innerHTML;
      modifiedHTMLString = modifiedHTMLString.replaceAll('<head>', '');
      modifiedHTMLString = modifiedHTMLString.replaceAll('</head>', '');
      modifiedHTMLString = modifiedHTMLString.replaceAll('<body>', '');
      modifiedHTMLString = modifiedHTMLString.replaceAll('</body>', '');

      const parser2 = new DOMParser();
      const doc2 = parser2.parseFromString(modifiedHTMLString, 'text/html');

      const inputElements2 = doc2.querySelectorAll('.rendered-form input, .rendered-form textarea');
      inputElements2.forEach(input => {
        const labelForAttribute = input.parentElement.querySelector('label').textContent.trim();
        const formattedId = labelForAttribute.toLowerCase().replace(/[^\w\s]/g, "");
        input.name = formattedId;
        input.id = formattedId;
        input.setAttribute('onfocus', 'onFocusHandler');
      });
      console.log("kkkkkkkkk", inputElements2)



      const tokenArray = [];
      inputElements2.forEach((input) => {
        const inputId = input.id;
        tokenArray.push(
          {
            token: inputId
          }
        );
      });
      let tokens = [
        { token: " shopName " },
        { token: " shopDomain " },
        { token: " shopLogo " }
      ];

      let combineArr = tokens.concat(tokenArray)
      const LabelElements2 = doc2.querySelectorAll('.rendered-form label');
      LabelElements2.forEach(label => {
        const labelForAttribute = label.textContent.trim();
        const formattedId = labelForAttribute.toLowerCase().replace(/[^\w\s]/g, "");
        label.setAttribute('for', formattedId);
      });

      let modifyHtml = doc2.querySelector('html').innerHTML;
      modifyHtml = modifyHtml.replaceAll('<head>', '');
      modifyHtml = modifyHtml.replaceAll('</head>', '');
      modifyHtml = modifyHtml.replaceAll('<body>', '');
      modifyHtml = modifyHtml.replaceAll('</body>', '');

      await createMetaFunc(combineArr);


      try {
        const response = await fetch("/api/customFormFields", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ customForm: modifyHtml, shopName: shop, xmlForm: jsonData })
        });
        const result = await response.json()
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      document.querySelector('.form-wrap').style.opacity = "0.5";
      setIsEmailThere(true)
    }
  }

  async function createMetaFunc(data) {
    const metafieldData = {
      key: "admin-form-token",
      namespace: "quotes-app",
      ownerId: `${metaId}`,
      type: "single_line_text_field",

      value: JSON.stringify(data)
    };
    try {
      const response = await fetch("/api/app-metafield/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metafieldData),
      });
      const result = await response.json();
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const handleClearDataFields = async () => {
    fBuilder.current.actions.clearFields();
    let editorDiv = document.getElementById("fb-editor");
    let secondDiv = editorDiv.children[1];
    secondDiv.style.display = "none";
    setLoading(true)
    createMetaFunc(defaultTokens)
    try {
      const response = await fetch(`/api/deleteCustomForm?htmlForm=${JSON.stringify(htmlForm)}&&xmlForm=${JSON.stringify(defaultForm)}`)
      console.log("response", response)
      const result = await response.json()
    } catch (error) {
      console.error("Error:", error);
    }

    await getForm();
    setLoading(false)
    console.log("fbuilder", fBuilder)
  }

  const closeDiv = () => {
    setIsEmailThere(false)
    document.querySelector('.form-wrap').style.opacity = "1";
  }

  return (
    <>
      {loading ?
        <div className='spinnerStyle'>
          <Spinner accessibilityLabel="Small spinner example" size="large" />
        </div>
        :
        <>
          <span className="topHeading"><Text variant="heading2xl" as="h3" >Quote Form</Text></span>
          <div id="fb-editor" className="build-wrap" ref={fb}>
            <div className="quoteFormButton">
              <button id="clear-all-fields" onClick={handleClearDataFields} className="clear-all btn btn-danger" type="button">Clear Fields</button>
              <button id="showData" onClick={handleShowData} className={`btn btn-primary save-template`} style={{ cursor: isEmailThere ? 'not-allowed ' : 'pointer', pointerEvents: isEmailThere ? 'none' : 'auto' }} type="button" disabled={isEmailThere}>Save and Show Data</button>
            </div>

            {isEmailThere &&
              <div className="emailDiv">
                <span>Email Field is required</span>
                <button class='closeDiv' onClick={closeDiv}>Ok</button>
              </div>
            }
          </div>
        </>}
    </>
  );
}
export default QuoteForm;





