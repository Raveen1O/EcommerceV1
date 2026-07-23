const { sendPaymentSuccessEmail } = require('./services/emailService');

exports.handler = async (event) => {

    console.log("NOTIFICATION SERVICE STARTED");

    try {

        for (const record of event.Records) {

            // SQS body contains SNS envelope
            const snsEnvelope = JSON.parse(record.body);

            // Actual SNS message
            const message = JSON.parse(snsEnvelope.Message);

            console.log("Received Event:", message);

            switch (message.eventType) {

                case "PaymentSucceeded":

                    await sendPaymentSuccessEmail(message);
                    break;

                default:

                    console.log("Unknown Event:", message.eventType);
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Notification processed successfully"
            })
        };

    } catch (error) {

        console.error("Notification Error:", error);

        throw error;
    }

};