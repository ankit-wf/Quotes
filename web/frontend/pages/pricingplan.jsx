import React, { useEffect, useState } from 'react'
import { Page, Grid, LegacyCard, Button, Icon, Text, Spinner } from '@shopify/polaris';
import { useAuthenticatedFetch } from '../hooks'
import useSubscriptionUrl from '../hooks/useSubscriptionUrl'
import useApi from '../hooks/useApi';
import { StatusActiveMajor } from '@shopify/polaris-icons';
import './css/myStyle.css'
import SmallSpinner from '../hooks/SmallSpinner';
import { useNavigate } from 'react-router-dom';
import createAppDataMetafields from '../../appDataMetaFild.js'
import defaultMetafieldSetup from "../../defaultMetaFieldSetup.js";


const PricingPlan = () => {
  const customHooks = useApi();
  const navigate = useNavigate();
  const fetch = useAuthenticatedFetch();
  const [shop, setShop] = useState();
  const [status, setStatus] = useState("");
  const [plandata, setPlandata] = useState([]);
  const [loading, setLoading] = useState(true);
  const [smallLoading, setSmallLoading] = useState(false);
  const [planValue, setPlanValue] = useState("");
  const [activeSub, setActiveSub] = useState("");
  const [metaId, setMetaId] = useState("");
  const [commonForm, setCommonForm] = useState();
  const swtAltMsg = { title: "Successfully Updated", text: "Your data has been updadted successfully", isSwtAlt: false, smallSpinner: "" };

  useEffect(async () => {
    const shopApi = await customHooks.shop();
    const currentPlan = await customHooks.getCurrentPlan();
    const metafieldId = await customHooks.metafield();
    const commonFormData = customHooks.commonForm();
    setCommonForm(commonFormData)
    setMetaId(metafieldId);
    setShop(shopApi)
    setStatus(currentPlan.currentPlan)
    setActiveSub(currentPlan.id)
    setLoading(false)

    try {
      const response = await fetch(`/api/plan`);
      const result = await response.json();
      setPlandata(result.result)
    } catch (error) {
      console.error("Error:", error);
    }
    getButtonIds(currentPlan.planId);
  }, [])


  const handleChange = async (value) => {
    setPlanValue(value.plan)
    setSmallLoading(true)
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    const customerData = {
      key: "pricing-plan-data",
      namespace: "quotes-app",
      ownerId: `${metaId}`,
      type: "single_line_text_field",
      value: JSON.stringify({ shop: shop.shopName, plan: value.plan, planId: value.id, startDate: formattedDate })
    };

    if (value.id === 1) {
      try {
        const response = await fetch(`/api/subscription/cancel?id=${activeSub}`);
        const result = await response.json();
        if (result.msg === "Subscription Cancelled") {
          await customHooks.createAppMetafield(customerData, swtAltMsg);
          setSmallLoading(false)
          navigate('/');
        }
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      const returnData = `https://${shop.domain}/admin/apps/quotes-app-2-o`

      try {
        const response = await fetch("/api/subscription/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ price: value.amount, shop: shop.shopName, plan: value.plan, returnUrl: returnData, trial: 1 }),
        });
        const result = await response.json();
        const urlName = result.data.confirmation_url
        const subscription = useSubscriptionUrl(urlName)
        const data = defaultMetafieldSetup(metaId);
        createAppDataMetafields(data[0]);
        editForm();
        await customHooks.createAppMetafield(customerData, swtAltMsg);
        subscription.ReloadPage();
        setSmallLoading(false)
      } catch (error) {
        console.error("Error:", error);
      }
    }
  }

  const editForm = async () => {
    try {
      const response = await fetch(`/api/deleteCustomForm?htmlForm=${JSON.stringify(commonForm.htmlForm)}&&xmlForm=${JSON.stringify(commonForm.defaultForm)}`)
      await response.json()
    } catch (err) {
      console.log(err)
    }
  }

  const getButtonIds = (id) => {
    const button1 = document.getElementById('1');
    const button2 = document.getElementById('2');
    const button3 = document.getElementById('3')

    if (id !== "") {
      if (id === 1) {
        button2.textContent = 'Upgrade';
        button3.textContent = 'Upgrade';
      } else if (id === 2) {
        button1.textContent = 'Downgrade';
        button3.textContent = 'Upgrade';
      } else {
        button1.textContent = 'Downgrade';
        button2.textContent = 'Downgrade';
      }
    }
  }


  return (
    <>
      {loading ?
        <div className='spinnerStyle'>
          <Spinner accessibilityLabel="Small spinner example" size="large" />
        </div>
        :
        <Page fullWidth>
          <span className="topHeading"><Text variant="heading2xl" as="h3" >Pricing Plan</Text></span>
          <Grid>
            {plandata.map((data) => (
              <Grid.Cell key={data.plan_id} columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
                <div className={status === data.plan_name ? 'highLight_div' : 'basicClass'}>
                  <LegacyCard title={data.plan_name} sectioned>
                    <div className='basicClass'>
                      {status === data.plan_name ? (
                        <div className='icon_div'>
                          <Icon
                            source={StatusActiveMajor}
                            color='base'
                          />
                        </div>
                      ) : null}
                      <div className='planFeature'>
                        <p className='pricePera'>$<span>{data.price}</span>/mo</p>
                        <p className='emailPera'>Email Quota {data.email_quota}</p>
                        <p className='emailPera'>Email notification</p>
                        {status !== data.plan_name ?
                          <div className="addPlanBtn">
                            {smallLoading && data.plan_name === planValue
                              ?
                              <SmallSpinner />
                              :
                              <Button id={data.plan_id} onClick={() => { handleChange({ amount: data.price, plan: data.plan_name, id: data.plan_id }) }}></Button>
                            }
                          </div>
                          : ""
                        }
                      </div>
                    </div>
                  </LegacyCard>
                </div>
              </Grid.Cell>
            ))}
          </Grid>
        </Page>
      }
    </>
  )
}

export default PricingPlan;

