import React, { useRef } from 'react';
import { Button, Spinner } from '@shopify/polaris';
import "./css/myStyle.css";
import { useAuthenticatedFetch } from '../hooks';
import useApi from '../hooks/useApi';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SmallSpinner from '../hooks/SmallSpinner';


const CancelSubscription = () => {
  const fetch = useAuthenticatedFetch();
  const [activeSub, setActiveSub] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true)
  const [shopName, setShopName] = useState("");
  const ShopApi = useApi();
  const navigate = useNavigate();
  const [smallLoading, setSmallLoading] = useState(false);
  const [planData, setPlanData] = useState([]);
  const [metaId, setMetaId] = useState("");
  const swtAltMsg = { title: "Successfully Updated", text: "Your data has been updadted successfully", isSwtAlt: false, smallSpinner: "" };
// const [planName, setPlanName] = useState("");
const planName = useRef("");


  useEffect(async () => {
    const activeId = await ShopApi.getCurrentPlan();
    const shopName = await ShopApi.shop();
    const metafieldId = await ShopApi.metafield();
    setShopName(shopName)
    setActiveSub(activeId)
    setStatus(activeId.currentPlan)
    setMetaId(metafieldId);
    setLoading(false)
  }, [])


  const handleCancelSubscription = async () => {
    // let planName = "";
    try {
      const response = await fetch(`/api/plan`);
      const result = await response.json();
      setPlanData(result.result)
      console.log("pppppppp", planData)
      planData.filter((item) => {
        if(item.plan_id === 1){
          // setPlanName(item.plan_name)
          planName.current = item.plan_name
        }
      })
    } catch (error) {
      console.error("Error:", error);
    }
    try {
      setSmallLoading(true)
      const response = await fetch(`/api/subscription/cancel?id=${activeSub.id}`);
      const result = await response.json();
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
console.log("first", { shop: shopName.shopName, plan: planName.current, planId: 1, startDate: formattedDate })
      const customerData = {
        key: "pricing-plan-data",
        namespace: "quotes-app",
        ownerId: `${metaId}`,
        type: "single_line_text_field",
        value: JSON.stringify({ shop: shopName.shopName, plan: planName.current, planId: 1, startDate: formattedDate })
      };
      if (result.msg === "Subscription Cancelled") {
        setSmallLoading(false)
        await ShopApi.createAppMetafield(customerData, swtAltMsg);
        navigate('/');
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const addSub = () => {
    navigate('/pricingplan')
  }


  return (
    <>
      {loading ?
        <div className='spinnerStyle'>
          <Spinner accessibilityLabel="Small spinner example" size="large" />
        </div>
        :
        status === "Free"
          ?
          <div>
            <p className='cancelPera'>You have not taken any subscription plan yet, Please choose Subscription Plan first</p>
            <Button onClick={addSub}>
              Add Subscription
            </Button>
          </div>
          :
          <div>
            <p className='cancelPera'>Your current Subscription Plan is <span>{status}</span>.</p>
            <span className={`${smallLoading && 'canelPlanSpinner'}`}>
              {smallLoading
                ?
                <SmallSpinner />
                :
                <Button onClick={handleCancelSubscription}>
                  Cancel Your Plan
                </Button>
              }
            </span>
          </div>
      }
    </>
  )
}

export default CancelSubscription;