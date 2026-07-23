const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({

    service: 'gmail',

    auth: {

        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS

    }

});

exports.sendPaymentSuccessEmail = async (message) => {

    const recipientEmail = message.customerEmail || process.env.RECIPIENT_EMAIL;

    const mailOptions = {

        from: process.env.EMAIL_USER,

        to: recipientEmail,

        subject: `Order ${message.orderId} Confirmed`,

        html: `

            <h2>Payment Successful 🎉</h2>

            <p>Hi ${message.customerName || 'Customer'}, your payment has been processed successfully.</p>

            <table border="1" cellpadding="8">

                <tr>
                    <td><b>Order ID</b></td>
                    <td>${message.orderId}</td>
                </tr>

                <tr>
                    <td><b>Product ID</b></td>
                    <td>${message.productId}</td>
                </tr>

                <tr>
                    <td><b>Quantity</b></td>
                    <td>${message.quantity}</td>
                </tr>

                <tr>
                    <td><b>Amount Paid</b></td>
                    <td>₹${message.amount}</td>
                </tr>

            </table>

            <br>

            <p>Thank you for shopping with us.</p>

        `

    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email Sent Successfully");

    console.log(info.response);

};