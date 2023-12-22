import React from 'react'
import {Button} from '@shopify/polaris';
import "./css/myStyle.css"
import { useAuthenticatedFetch } from '../hooks'
import useApi from '../hooks/useApi';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSubscriptionUrl from '../hooks/useSubscriptionUrl';

const CancelSubscription = () => {
    const fetch = useAuthenticatedFetch()
    const subscription = useSubscriptionUrl()
  const [activeSub, setActiveSub] = useState("")
  const [status, setStatus] = useState("")
  const ShopApi = useApi()
  const [test, setTest] = useState(false)
  const navigate = useNavigate();
  let dataArr = []
  let planName = ""

    useEffect(async()=>{
        const activeSubId = await ShopApi.getCurrentPlan()
        setActiveSub(activeSubId)   
        try {
          const response = await fetch(`/api/subscription/planstatus`);
          const result = await response.json();
          dataArr = result.data;
          console.log("12121212", dataArr)
          planName = await subscription.subscriptionArr(result.data)
          if (planName === "") {
            setStatus("Free")
          }
          setStatus(planName)
        } catch (error) {
          console.error("Error:", error);
        }  

      },[test])

    const cancel_Handler = async () => {
      try {
        // setSmallLoading(true)
        const response = await fetch(`/api/subscription/cancel?id=${activeSub.id}`);
        const result = await response.json();
        if (result.msg === "Subscription Cancelled") {
          // setSmallLoading(false)
          navigate('/');
        }
      } catch (error) {
        console.error("Error:", error);
      }
        // try {
        //   const response = await fetch("/api/subscription/cancel", {
        //     method: "POST",
        //     headers: {
        //       "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({ id: activeSub }),
        //   });
        //   const result = await response.json();       
        //   if (result.data.body.data.appSubscriptionCancel.appSubscription.status === "CANCELLED") {
        //     setTest(true)
        //     navigate('/')
        //   }
    
        // } catch (error) {
        //   console.error("Error:", error);
        // }   
    }
    const addSub = () =>{
      navigate('/pricingplan') 
    }
  return (
    <>
    {status === "Free" ?  <div>
    <p>You don't have any Plan please add Plan : <strong>{status}</strong></p>
        <Button onClick={addSub}>
     Add Subscription
   </Button>
   </div> :
    <div>
        <p>If you want to Cancel Subscription </p>
        <p>Your Current Subscription Plan : <strong>{status}</strong></p>
     <Button onClick={cancel_Handler}>
     Cancel
   </Button>
   </div>
}
</>
  )
}

export default CancelSubscription
