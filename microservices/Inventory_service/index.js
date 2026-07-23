const axios = require('axios');

exports.handler = async (event) => {

    try {

        for (const record of event.Records) {

            console.log('Raw SQS Message:', record.body);

            // SNS messages arrive wrapped inside SQS
            const snsEnvelope = JSON.parse(record.body);

            const message = JSON.parse(snsEnvelope.Message);

            console.log('Parsed Event:', message);

            const productResponse = await axios.get(
                `${process.env.API_BASE_URL}api/products/${message.productId}`
            );

            const product = productResponse.data;

            console.log('Current Product:', product);

            await axios.put(
                `${process.env.API_BASE_URL}api/products/${message.productId}`,
                {
                    stock: product.stock - message.quantity
                }
            );

            console.log(
                `Inventory updated for product ${message.productId}`
            );
        }

        return {
            statusCode: 200,
            body: 'Inventory updated successfully'
        };

    } catch (error) {

        console.error('Inventory Consumer Error:', error);

        throw error; // important for SQS retry behavior
    }
};