import nodemailer from 'nodemailer';

const sendEmail = (data) => {
    let transporter = nodemailer.createTransport({
        host: data.result[0].smtp_server,
        port: data.result[0].port,
        secure: false,
        auth: {
            user: data.result[0].user_email,
            pass: data.result[0].password
        },
    });

    if (data.isTrue) {
        transporter.sendMail({
            headers: {
                // From: "rajeev.webframez@gmail.com",
                From: data.shop.shop_email,
                To: data.isUser,
                Subject: data.shop.companyName, //here will come company name
            },
            html: data.content
        });
    } else {
        transporter.sendMail({
            headers: {
                From: data.isUser ? data.isUser : data.shop.admin_email,
                To: data.shop.shop_email,
                Subject: data.alert ? data.shop.companyName : data.subject ? data.subject : data.shop.subject,
            },
            html: data.content
        });
    }
}

export default sendEmail;