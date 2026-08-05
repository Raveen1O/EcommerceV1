const axios = require('axios');
const AWSXRay = require('aws-xray-sdk');
AWSXRay.captureHTTPsGlobal(require('http'));
AWSXRay.captureHTTPsGlobal(require('https'));

exports.handler = async (event) => {

    try {

        for (const record of event.Records) {

            // SQS message contains the SNS envelope
            const snsEnvelope = JSON.parse(record.body);
            const message = JSON.parse(snsEnvelope.Message);

            console.log('==============================');
            console.log('Received Event:', message);
            console.log('==============================');

            // =========================
            // GET PRODUCT
            // =========================

            console.log(
                `Fetching Product: ${process.env.API_BASE_URL}api/products/${message.productId}`
            );

            const productResponse = await axios.get(
                `${process.env.API_BASE_URL}api/products/${message.productId}`
            );

            const product = productResponse.data;

            console.log('Current Product:', product);

            // =========================
            // UPDATE INVENTORY
            // =========================

            console.log('Updating Inventory...');

            await axios.put(
                `${process.env.API_BASE_URL}api/products/${message.productId}`,
                {
                    stock: product.stock - message.quantity
                },
                {
                    headers: {
                        "x-service-secret": process.env.SERVICE_SECRET
                    }
                }
            );

            console.log(
                `Inventory updated successfully for Product ${message.productId}`
            );

            // =========================
            // UPDATE ORDER STATUS
            // =========================

            console.log('Updating Order Status...');

            await axios.put(
                `${process.env.API_BASE_URL}api/orders/${message.orderId}`,
                {
                    status: 'Success'
                },
                {
                headers: {
                    "x-service-secret": process.env.SERVICE_SECRET
                }
            }
            );

            console.log(
                `Order ${message.orderId} updated successfully`
            );
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'All SQS messages processed successfully'
            })
        };

    } catch (error) {

        console.error('==============================');
        console.error('CONSUMER ERROR');
        console.error('==============================');

        console.error(error);

        if (error.response) {
            console.error('Axios Status:', error.response.status);
            console.error('Axios Response:', error.response.data);
        }

        throw error;
    }
};