import React, { useEffect, useState } from 'react';
import { TextField, AlphaCard, Text, Grid, Page, Spinner } from '@shopify/polaris';
import { useForm, Controller } from 'react-hook-form';
import { useAuthenticatedFetch } from "../hooks/index";
import * as errorConstant from '../Utils/ErrorMessage'
import { Dot } from 'react-bootstrap-icons';
import useApi from '../hooks/useApi';
import './css/myStyle.css';
import SmallSpinner from '../hooks/SmallSpinner';

const AdminForm = () => {
    const metafieldHook = useApi();
    const fetch = useAuthenticatedFetch();
    const { reset: reset1, control: control1,
        handleSubmit: handleSubmit1,
        formState: { errors: errors1 }, } = useForm();
    const { reset: reset2, control: control2,
        handleSubmit: handleSubmit2,
        formState: { errors: errors2 }, } = useForm();
    const [metaId, setMetaId] = useState("");
    const [tokenData, setTokenData] = useState([]);
    const [shopData, setShopData] = useState("");
    const [loading, setLoading] = useState(true)
    const [smallLoading, setSmallLoading] = useState(false);
    const swtAltMsg = { title: "Successfully Updated", text: "Your data has been updadted successfully", isSwtAlt: true, smallSpinner: setSmallLoading };

    useEffect(async () => {
        const metafieldId = await metafieldHook.metafield();
        const shop = await metafieldHook.shop();
        setShopData(shop.shopName);
        setMetaId(metafieldId);
        try {
            const response = await fetch(`/api/app-metafield/get-all?id=${metafieldId.id}`);
            const result = await response.json();
            let arr = result.data.body.data.app.installation.metafields.edges
            arr.find((f) => {
                if (f.node.key === "admin-form-display") {
                    let avv = JSON.parse(f.node.value)
                    return reset1(avv)
                }
                if (f.node.key === "admin-form-token") {
                    let avv = JSON.parse(f.node.value)
                    setTokenData(avv)
                }
            })
            setLoading(false)
        } catch (error) {
            console.error("Error:", error);
        }
    }, [])

    const onSubmit = async (data) => {
        const customerData = {
            key: "admin-form-display",
            namespace: "quotes-app",
            ownerId: `${metaId}`,
            type: "single_line_text_field",
            value: JSON.stringify(data)
        };
        await metafieldHook.createAppMetafield(customerData, swtAltMsg);
    }

    const onSubmitEmail = async (data) => {
        setSmallLoading(true)
        let name = "John"
        let number = "985241325"
        let msg = "Query about this Product. It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English."
        var todayDate = new Date().toLocaleString();
        let subject = "[RFQ] new request from John"
        let arr = {
            adminEmail: data.email,
            email: data.testemail,
            name: name,
            number: number,
            msg: msg,
            date: todayDate,
            subject: subject,
            shopName: shopData
        }
        try {
            const response = await fetch("/api/testemail", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(arr),
            });
            reset2({ testemail: "" })
            await response.json();
            metafieldHook.swtAlt(swtAltMsg);
        } catch (error) {
            console.error("Error:", error);
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
                    <Grid>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
                            <form onSubmit={handleSubmit1(onSubmit)} >
                                <Controller
                                    name="subject"
                                    control={control1}
                                    rules={{ required: true }}
                                    defaultValue={""}
                                    render={({ field }) => <TextField type="text" onChange={field.onChange} onBlur={field.onBlur}
                                        value={field.value}
                                        name={field.name}
                                        inputRef={field.ref}
                                        label="Subject"
                                    />}
                                />
                                {errors1.subject && <p className='errorPera'>{errorConstant.EmptyFieldError}</p>}

                                <Controller
                                    name="dataEmail"
                                    control={control1}
                                    defaultValue={""}
                                    rules={{ required: true, pattern: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ }}
                                    render={({ field }) => <TextField type="email" onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        value={field.value}
                                        name={field.name}
                                        inputRef={field.ref}
                                        label="Admin Email" />}
                                />
                                {errors1.adminEmail && errors1.adminEmail.type === "required" && <p className='errorPera'>{errorConstant.EmptyFieldError}</p>}
                                {errors1.adminEmail && errors1.adminEmail.type === "pattern" && <p className='errorPera'>{errorConstant.EmailFieldError}</p>}

                                <Controller
                                    name="emailReply"
                                    control={control1}
                                    defaultValue={""}
                                    rules={{ required: true }}
                                    render={({ field }) => <TextField type="text" onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        value={field.value}
                                        name={field.name}
                                        inputRef={field.ref}
                                        label="Email Reply"
                                    />}
                                />
                                {errors1.emailReply && errors1.emailReply.type === "required" && <p className='errorPera'>{errorConstant.EmptyFieldError}</p>}
                                {errors1.emailReply && errors1.emailReply.type === "pattern" && <p className='errorPera'>{errorConstant.EmailFieldError}</p>}

                                <Controller
                                    name="emailTo"
                                    control={control1}
                                    rules={{ required: true }}
                                    defaultValue={""}
                                    render={({ field }) => <TextField type="text" onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        value={field.value}
                                        name={field.name}
                                        inputRef={field.ref}
                                        label="To"
                                    />}
                                />
                                {errors1.emailTo && errors1.emailTo.type === "required" && <p className='errorPera'>{errorConstant.EmptyFieldError}</p>}
                                {errors1.emailTo && errors1.emailTo.type === "pattern" && <p className='errorPera'>{errorConstant.EmailFieldError}</p>}

                                <Controller
                                    name="emailFrom"
                                    control={control1}
                                    rules={{ required: true }}
                                    defaultValue={""}
                                    render={({ field }) => <TextField type="text" onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        value={field.value}
                                        name={field.name}
                                        inputRef={field.ref}
                                        label="From" />}
                                />
                                {errors1.emailFrom && errors1.emailFrom.type === "required" && <p className='errorPera'>{errorConstant.EmptyFieldError}</p>}
                                {errors1.emailFrom && errors1.emailFrom.type === "pattern" && <p className='errorPera'>{errorConstant.EmailFieldError}</p>}
                                <div className='submitButton'>
                                    {smallLoading ? <SmallSpinner /> : <input type="submit" />}
                                </div>
                            </form >
                        </Grid.Cell>

                        <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
                            <h4>Tokens which you can use in your app </h4>
                            {tokenData.map((e, i) => {
                                return (
                                    <div key={i}>
                                        <Dot /> <b> ## {e.token} ##  </b><span className='textChange'>anywhere to have replaced by the {e.token} </span>
                                    </div>
                                )
                            })}

                            <AlphaCard className="w-50 ms-5 mt-4">
                                <Text as="h2" variant="bodyMd">
                                    Send Test Mail
                                </Text>

                                <form onSubmit={handleSubmit2(onSubmitEmail)} >
                                    <Controller
                                        name="testemail"
                                        control={control2}
                                        defaultValue={""}
                                        rules={{ required: true, pattern: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ }}
                                        render={({ field }) => <TextField type="text" onChange={field.onChange}
                                            onBlur={field.onBlur}
                                            value={field.value}
                                            name={field.name}
                                            inputRef={field.ref}
                                            label="Test Email"
                                        />}
                                    />
                                    {errors2.testemail && errors2.testemail.type === "required" && <p className='errorPera'>{errorConstant.EmptyFieldError}</p>}
                                    {errors2.testemail && errors2.testemail.type === "pattern" && <p className='errorPera'>{errorConstant.EmailFieldError}</p>}
                                    <div className='submitButton'>
                                        {smallLoading ? <SmallSpinner /> : <input type="submit" />}
                                    </div>
                                </form>
                            </AlphaCard>
                        </Grid.Cell>
                    </Grid >
                </Page>
            }
        </>
    )
}

export default AdminForm;