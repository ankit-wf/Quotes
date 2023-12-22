import React, { useRef, useEffect, useState } from "react";
import { useAuthenticatedFetch } from '../hooks';
import { Text, Spinner } from '@shopify/polaris';
import useApi from '../hooks/useApi';
import { isConfirmedFun } from '../utilsFunction/UtilsFunction';
import * as alertSwal from "../constant/alertSwal";


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
  const fb = useRef({});
  const [show, setShow] = useState(false);
  const [test, setTest] = useState(false);
  const [metaId, setMetaId] = useState("");
  const fBuilder = useRef();
  const shopApi = useApi();
  const fetch = useAuthenticatedFetch();
  const [loading, setLoading] = useState(true);
  const [commonForm, setCommonForm] = useState();
  const swtAltMsg = { title: "Successfully Updated", text: "Your data has been updadted successfully", isSwtAlt: false };


  useEffect(async () => {
    const metafieldId = await metafieldHook.metafield()
    const currentPlan = await shopApi.getCurrentPlan();
    const commonFormData = metafieldHook.commonForm();
    setMetaId(metafieldId);
    setShow(true);
    setStatus(currentPlan.planId);
    setCommonForm(commonFormData)
    const shopN = await shopApi.shop()
    setShop(shopN.shopName)
    setTest(true)
    await getForm();
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
              status === 1
                ? FreedisableFields
                : status === 2
                  ? BasicdisableFields
                  : status === 3
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
        if (count < 1) {
          if (status === 1) {
            fBuilder.current = $(fb.current).formBuilder(formOptions, { formData });
          } else if (status === 2) {
            fBuilder.current = $(fb.current).formBuilder(formOptions, { formData });
          } else if (status === 3) {
            fBuilder.current = $(fb.current).formBuilder(formOptions, { formData });
          }
        }
      } catch (err) {
        console.warn("formData not available yet.");
        console.error("Error: ", err);
      }
    }
  }

  let FreedisableFields = [
    'autocomplete',
    'checkbox-group',
    'date',
    'file',
    'header',
    'hidden',
    'number',
    'paragraph',
    'starRating',
  ]

  let BasicdisableFields = [
    'autocomplete',
    'file',
    'header',
    'hidden',
    'starRating',
    'number',
    'starRating',
  ]

  let PremiumdisableFields = [];
  let disabledAttributes = ["required", "description"];

  let defaultOption = {
    defaultFields: commonForm === undefined ? [] : commonForm.defaultForm,
    disabledAttrs: disabledAttributes,
    disableFields:
      status === 1
        ? FreedisableFields
        : status === 2
          ? BasicdisableFields
          : status === 3
            ? PremiumdisableFields
            : [],
    controlPosition: "right",
  };

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

      const inputElements2 = doc2.querySelectorAll('.rendered-form input, .rendered-form textarea, .rendered-form select');
      inputElements2.forEach(input => {
        const labelForAttribute = input.parentElement.querySelector('label').textContent.trim();
        const formattedId = labelForAttribute.toLowerCase().replace(/[^\w\s]/g, "");
        input.name = formattedId;
        input.id = formattedId;
        input.setAttribute('onfocus', 'onFocusHandler');
      });


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

    await metafieldHook.createAppMetafield(metafieldData, swtAltMsg);
  }

  const handleClearDataFields = async () => {
    fBuilder.current.actions.clearFields();
    let editorDiv = document.getElementById("fb-editor");
    let secondDiv = editorDiv.children[1];
    secondDiv.style.display = "none";
    setLoading(true)
    createMetaFunc(commonForm.defaultTokens)
    try {
      const response = await fetch(`/api/deleteCustomForm?htmlForm=${JSON.stringify(commonForm.htmlForm)}&&xmlForm=${JSON.stringify(commonForm.defaultForm)}`)
      await response.json()
    } catch (error) {
      console.error("Error:", error);
    }

    await getForm();
    setLoading(false)
  }

  const closeDiv = () => {
    setIsEmailThere(false)
    document.querySelector('.form-wrap').style.opacity = "1";
  }


  const deleteQuoteHandler = () => {
    isConfirmedFun(alertSwal.AlertTitle,
      alertSwal.AlertTextForDeleteQuoteFrm,
      alertSwal.AlertIcon,
      alertSwal.AlertShowCancelButton,
      alertSwal.AlertConfirmButtonColor,
      alertSwal.AlertCancelButtonColor,
      alertSwal.AlertConfirmDeleteText,
      handleClearDataFields);
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
              <button id="clear-all-fields" onClick={deleteQuoteHandler} className="clear-all btn btn-danger" type="button">Clear Fields</button>
              <button id="showData" onClick={handleShowData} className={`btn btn-primary save-template`} style={{ cursor: isEmailThere ? 'not-allowed ' : 'pointer', pointerEvents: isEmailThere ? 'none' : 'auto' }} type="button" disabled={isEmailThere}>Save and Show Data</button>
              <button id="reset-all-fields" onClick={handleClearDataFields} className="clear-all btn btn-danger" type="button">Reset Form</button>
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




