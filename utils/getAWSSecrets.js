const AWS = require("aws-sdk");

AWS.config.update({
    region: process.env.REGION,
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    sessionToken: process.env.SESSION_TOKEN,
});
let cachedSecrets;

const client = new AWS.SecretsManager({ region: "us-east-1" });

exports.getSecrets = async () => {
    if (cachedSecrets) {
        return cachedSecrets;
    }

    console.log("fetched secrets =============================");

    const secret = await client
        .getSecretValue({
            SecretId: "blogiverSecret",
        })
        .promise();

    const secretsObj = JSON.parse(secret.SecretString);
    cachedSecrets = secretsObj;
    return secretsObj;
};
