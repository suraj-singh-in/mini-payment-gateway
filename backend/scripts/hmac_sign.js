// hmac_sign.js
const crypto = require("crypto");
const apiSecret = "1e5a9e917dd2db500502821ce928a1181c87da0f4cf7878484e54be3a91c3e9d";
const timestamp = Date.now().toString();
const body = {
    amount: 1000,
    currency: "INR",
    customer_email: "test@example.com",
    metadata: { orderId: "ORD-123" }
};

const signingString = `${timestamp}.${JSON.stringify(body)}`;
const signature = crypto
    .createHmac("sha256", apiSecret)
    .update(signingString)
    .digest("hex");

console.log({ timestamp, signature });
