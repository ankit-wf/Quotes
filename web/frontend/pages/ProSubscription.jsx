import React, { useState, useEffect } from 'react';
import useApi from '../hooks/useApi';
import useSubscriptionUrl from '../hooks/useSubscriptionUrl';
import { useAuthenticatedFetch } from '../hooks';
import { Button } from '@shopify/polaris';

const ProSubscription = () => {
  const ShopApi = useApi();
  const fetch = useAuthenticatedFetch();
  const [shop, setShop] = useState();

  useEffect(async () => {
    const shopApi = await ShopApi.shop()
    setShop(shopApi)
  }, [])


  const handleChange = async (value) => {
    const returnData = `https://${shop.domain}/admin/apps/quotes-app-2-o`

    try {
      const response = await fetch("/api/subscription/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ price: value.amount, shop: shop.shopName, plan: value.plan, returnUrl: returnData }),
      });
      const result = await response.json();
      const urlName = result.data.confirmation_url
      const subscription = useSubscriptionUrl(urlName)
      subscription.ReloadPage()

    } catch (error) {
      console.error("Error:", error);
    }
  }

  return (
    <Button onClick={() => handleChange({ amount: "500", plan: "Premium" })}>Upgrade to Pro</Button>
  )
}

export default ProSubscription
