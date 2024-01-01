import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import "./css/myStyle.css";
import useApi from '../hooks/useApi';
import { useAuthenticatedFetch } from '../hooks';
import SmallSpinner from '../hooks/SmallSpinner';

const EmailSMT = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const fetch = useAuthenticatedFetch();
    const ShopApi = useApi();
    const [shop, setShop] = useState({});
    const [smallLoading, setSmallLoading] = useState(false);
    const swtAltMsg = { title: "Successfully Updated", text: "Your data has been updadted successfully", isSwtAlt: true, smallSpinner: setSmallLoading };


    useEffect(async () => {
        const shopName = await ShopApi.shop();
        setShop(shopName)
    }, [])


    const onSubmit = async (data) => {
        setSmallLoading(true)
        let userData = {
            driver: data.Driver,
            // from_email: data.From_Email,
            password: data.Password,
            port: data.Port,
            smtp_server: data.SMTP_Server,
            user_email: data.User_Email,
            shop_name: shop.shopName
        }
        try {
            const response = await fetch("/api/emailSMTP_data", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });
            await response.json();
            setSmallLoading(false)
            ShopApi.swtAlt(swtAltMsg);
        } catch (error) {
            console.error("Error:", error);
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="email_main_Div">
                <div className='label_div'>
                    <label>Driver</label>
                    <div>
                        <input  {...register("Driver", { required: true })} className='input_width' />
                        {errors.Driver && <p className='errorPera'>This field is required*</p>}
                    </div>
                </div>
            </div>

            <div className='email_main_Div'>
                <div className='label_div'>
                    <label>SMTP Server</label>
                    <div>
                        <input {...register("SMTP_Server", { required: true })} className='input_width' />
                        {errors.SMTP_Server && <p className='errorPera'>This field is required*</p>}
                    </div>
                </div>
            </div>

            <div className='email_main_Div'>
                <div className='label_div'>
                    <label>User Email</label>
                    <div>
                        <input  {...register("User_Email", { required: true })} className='input_width' />
                        {errors.User_Email && <p className='errorPera'>This field is required*</p>}
                    </div>
                </div>
            </div>

            <div className='email_main_Div'>
                <div className='label_div'>
                    <label>Password</label>
                    <div>
                        <input  {...register("Password", { required: true })} className='input_width' />
                        {errors.Password && <p className='errorPera'>This field is required*</p>}
                    </div>
                </div>
            </div>

            <div className='email_main_Div'>
                <div className='label_div'>
                    <label>Port</label>
                    <div>
                        <input  {...register("Port", { required: true })} className='input_width' />
                        {errors.Port && <p className='errorPera'>This field is required*</p>}
                    </div>
                </div>
            </div>

            {/* <div className='email_main_Div'>
                <div className='label_div'>
                    <label>From Email</label>
                    <div>
                        <input  {...register("From_Email", { required: true })} className='input_width' />
                        {errors.From_Email && <p className='errorPera'>This field is required*</p>}
                    </div>
                </div>
            </div> */}

            <div className='submitButton smtpSubmit'>
                {smallLoading ? <SmallSpinner /> : <input className='smtpButton' type="submit" value='Save Data' />}
            </div>
        </form>
    )
}

export default EmailSMT;