const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.sendPaymentSuccessEmail = async (message) => {

    const recipientEmail = message.email || message.userEmail || message.customerEmail;;

    if (!recipientEmail) {
        throw new Error("Recipient email not found in SNS message.");
    }

    const mailOptions = {

        from: process.env.EMAIL_USER,

        to: recipientEmail,

        subject: `Order ${message.orderId} Confirmed`,

        html: `
            <h2>Payment Successful 🎉</h2>

            <p>Hello ${message.customerName || 'Customer'},</p>

            <p>Your payment has been processed successfully.</p>

            <table border="1" cellpadding="8" cellspacing="0">

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

            <p><b>SwiftCart Team</b></p>
        `
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent successfully.");
    console.log("Recipient:", recipientEmail);
    console.log(info.response);
};