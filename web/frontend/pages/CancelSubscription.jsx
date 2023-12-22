import React from 'react';
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
  const ShopApi = useApi();
  const navigate = useNavigate();
  const [smallLoading, setSmallLoading] = useState(false);


  useEffect(async () => {
    const activeId = await ShopApi.getCurrentPlan();
    setActiveSub(activeId)
    setStatus(activeId.currentPlan)
    setLoading(false)
  }, [])


  const handleCancelSubscription = async () => {
    try {
      setSmallLoading(true)
      const response = await fetch(`/api/subscription/cancel?id=${activeSub.id}`);
      const result = await response.json();
      if (result.msg === "Subscription Cancelled") {
        setSmallLoading(false)
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