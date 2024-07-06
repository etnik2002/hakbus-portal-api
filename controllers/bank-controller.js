const axios = require('axios');
const crypto = require('crypto');

module.exports = {
    refund: async (req, res) => {
        try {
            console.log(req.body)
            const apiKey = '863001IC086301';
            const sharedSecret = 'ezNxtWlHbR622MpAdrKF3yVdTV3Zvx';
            const inputBody = {
                merchantTransactionId: req.body.merchantTransactionId,
                referenceUuid: req.body.referenceUuid,
                amount: req.body.amount,
                currency: 'MKD',
                callbackUrl: 'https://admin.hakbus.net',
                description: req.body.description || 'Refund money'
            };

            const jsonBody = JSON.stringify(inputBody);
            const bodyHash = crypto.createHash('sha512').update(jsonBody).digest('hex');

            const contentType = 'application/json';
            const date = new Date().toUTCString();
            const requestUri = `/api/v3/transaction/${apiKey}/refund`;

            const message = [
                'POST',
                bodyHash,
                contentType,
                date,
                requestUri
            ].join('\n');
            
            const hmac = crypto.createHmac('sha512', sharedSecret);
            const signature = hmac.update(message).digest('base64');
            
            const headers = {
                'Content-Type': contentType,
                'X-Signature': signature,
                'Date': date
            };
            console.log({headers})

            const response = await axios.post(`https://gateway.bankart.si/api/v3/transaction/${apiKey}/refund`, inputBody, { headers });

            console.log(response.data);
            return res.status(200).json(response.data);
        } catch (error) {
            console.error('Error processing refund:', error.message);
            return res.status(500).json({ error: 'Kthimi i parave deshtoi', details: error });
        }
    }
};
