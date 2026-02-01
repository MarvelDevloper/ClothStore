const { S3Client} = require("@aws-sdk/client-s3");

const s3client=new S3Client({
    region:'eu-north-1',
    credentials:{
        accessKeyId:process.env.AMAZON_ACCESS_KEY,
        secretAccessKey:process.env.AMAZON_SECRET_ID
    }
})

module.exports=s3client
