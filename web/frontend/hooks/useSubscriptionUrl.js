import React, { useState } from 'react'
import createApp from '@shopify/app-bridge';
import { Redirect } from '@shopify/app-bridge/actions';

const useSubscriptionUrl = (url) => {
  // let ab=[]
  const subscriptionArr = async(array) => {
// let newArray = array.slice(0,1);
// console.log("gfgfgfgfgffgfg",newArray);
  
  let planName=""
    if(array.length==0){
    planName="Free"
    }
  
     const ab = await array.find((val, i) => {
      if (val.status === "active"){
        planName=val.name
        return planName
      }
      else{
        planName="Free"
        return planName
      }
    })
    return planName

  }
  const config = {
    apiKey: process.env.SHOPIFY_API_KEY,
    host: new URLSearchParams(location.search).get("host"),
    forceRedirect: true
};

  // const config = {
  //   // The client ID provided for your application in the Partner Dashboard.
  //   apiKey: process.env.SHOPIFY_API_KEY,
  //   // The host of the specific shop that's embedding your app. This value is provided by Shopify as a URL query parameter that's appended to your application URL when your app is loaded inside the Shopify admin.
  //   host: "https://gurmeet-webframez.myshopify.com/admin",
  //   forceRedirect: true
  // };
  // const app = createApp(config);

  const redirect = Redirect.create(app);
  const ReloadPage = () => {
    // console.log("fdfreg",url)
    //   redirect.dispatch(Redirect.Action.REMOTE, {
    //     url: url,
    //     // newContext: true,
    //   });
    window.top.location.replace(url)
  }
  return {
    ReloadPage: ReloadPage,
    subscriptionArr: subscriptionArr
    // subsriptionStatus:ab
  }
}

export default useSubscriptionUrl