import React, { useState } from 'react'
import { useAuthenticatedFetch } from './useAuthenticatedFetch'

const useApi = () => {
    const [metafieldId, setMetafieldId] = useState("")
    const fetch = useAuthenticatedFetch()
    const [subscrId, setSubscrId] = useState([])

    const shop = async () => {
        try {
            const response = await fetch(`/api/getshop`);
            const result = await response.json();
            let shopName = result.countData[0].name;
            let domain = result.countData[0].domain;
            const email = result.countData[0].email;
            return {
                shopName: shopName,
                domain: domain,
                email: email
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }

    const metafield = async () => {
        try {
            const response = await fetch("/api/app-metafield/get-id");
            const result = await response.json();
            const id = result.data.body.data.currentAppInstallation.id
            return id
        } catch (error) {
            console.error("Error:", error);
        }
    }
    const getCurrentPlan = async () => {
        try {
            const response = await fetch(`/api/subscription/planstatus`);
            const result = await response.json();
            let newArr = result.data;
            const plan = await subscription.subscriptionArr(result.data);
            const currentPlan = plan === "" ? "Free" : plan;
            let newArrId = "";
            await newArr.find((value) => {
                if (value.status.toLowerCase() === "active") {
                    newArrId = value.id
                }
            })
            let id = newArrId;
            return {id: id, currentPlan: currentPlan}
        } catch (error) {
            console.error("Error:", error);
        }
    };
    // const getSubscription = async () => {
    //     let arr
    //     let Newarr = ""
    //     try {
    //         const response = await fetch(`/api/subscription/get-all`);
    //         const result = await response.json();
    //         arr = result.data;
    //         // arr = result.data[0].body.data.currentAppInstallation.allSubscriptions.edges
    //     } catch (error) {
    //         console.error("Error:", error);
    //     }
    //     const data = await arr.find((value) => {
    //         if (value.node.status === "ACTIVE") {
    //             Newarr = value.node.id
    //         }
    //     })
    //     let id = Newarr
    //     return id
    // }

    return {
        shop: shop,
        metafield: metafield,
        getCurrentPlan: getCurrentPlan
    }
}

export default useApi