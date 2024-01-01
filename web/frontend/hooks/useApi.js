import { useAuthenticatedFetch } from './useAuthenticatedFetch';
import useSubscriptionUrl from './useSubscriptionUrl';
import Swal from 'sweetalert2';


const useApi = () => {
    const fetch = useAuthenticatedFetch();
    const subscription = useSubscriptionUrl();

    const swtAlt = (data) => {
        Swal.fire({
            icon: "success",
            title: data.title,
            text: data.text
        });
    }


    const shop = async () => {
        try {
            const response = await fetch(`/api/getshop`);
            const result = await response.json();
            let domain = result.countData[0].domain
            let position = domain.search(".myshopify.com")
            const shopName = domain.substring(0, position)
            const email = result.countData[0].email
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
        let planIdArray = [];
        try {
            const response = await fetch(`/api/getPlanId`);
            const result = await response.json();
            planIdArray = result.data
        } catch (err) {
            console.log("err")
        }

        try {
            const response = await fetch(`/api/subscription/planstatus`);
            const result = await response.json();
            let newArr = result.data;
            const plan = await subscription.subscriptionArr(result.data);
            const currentPlan = plan === "" ? "Free" : plan;
            let planId = null;
            await planIdArray.filter((item, index) => {
                if (item.plan_name === currentPlan) {
                    planId = item.plan_id
                }
            })
            let newArrId = "";
            let newPlanCreatedDate = "";
            console.log("newlist", newArr)
            await newArr.find((value) => {
                if (value.status.toLowerCase() === "active") {
                    newArrId = value.id
                    newPlanCreatedDate = value.activated_on
                }
            })
            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(currentDate.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;
            
            let id = newArrId;
            let createDate = newPlanCreatedDate ? newPlanCreatedDate : formattedDate;
            return { id: id, currentPlan: currentPlan, planId: planId, createDate: createDate }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const createAppMetafield = async (data, msg) => {
        console.log("bbbbbbbbbbbbbbb", data)
        try {
            const response = await fetch("/api/app-metafield/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            msg.smallSpinner && msg.smallSpinner(false)
            msg.isSwtAlt ? swtAlt(msg) : "";
        } catch (error) {
            console.error("Error:", error);
        }
    };


    const getAllAppMetafields = async () => {
        try {
            const response = await fetch(`/api/app-metafield/get-all?limit=${10}`);
            const result = await response.json();
            let allData = result.data.body.data.app.installation.metafields.edges;
            return allData;
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const commonForm = () => {
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
                type: "text",
                subtype: "tel",
                label: "Mobile",
                className: "form-control",
                name: "text",
                access: false
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

        let htmlForm = `<div class="rendered-form"><div class="formbuilder-text form-group field-name"><label for="name" class="formbuilder-text-label">Name</label><input type="text" class="form-control" name="name" id="name"></div><div class="formbuilder-text form-group field-email"><label for="email" class="formbuilder-text-label">Email</label><input type="email" class="form-control" name="email" id="email"></div><div class="formbuilder-text form-group field-text"><label for="phone" class="formbuilder-text-label">Phone</label><input type="tel" class="form-control" name="phone" id="phone"></div><div class="formbuilder-textarea form-group field-textarea"><label for="message" class="formbuilder-textarea-label">Message</label><textarea class="form-control" name="message" id="message"></textarea></div><div class="formbuilder-button form-group field-button"><button type="submit" class="btn-primary btn" name="button" style="primary" id="button">Submit</button></div></div>`

        let defaultTokens = [
            { token: " shopName " },
            { token: " shopDomain " },
            { token: "name" },
            { token: "email" },
            { token: "message" },
            { token: "mobile" }
        ];

        return { htmlForm: htmlForm, defaultForm: defaultForm, defaultTokens: defaultTokens }
    }

    return {
        shop: shop,
        metafield: metafield,

        swtAlt: swtAlt,
        getCurrentPlan: getCurrentPlan,
        createAppMetafield: createAppMetafield,
        getAllAppMetafields: getAllAppMetafields,
        commonForm: commonForm
    }
}

export default useApi;





