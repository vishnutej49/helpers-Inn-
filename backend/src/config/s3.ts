import AWS from 'aws-sdk';

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  region: process.env.AWS_REGION!,
});

export const s3 = new AWS.S3();
export const S3_BUCKET = process.env.CKEAWS_BUT_NAME! || "helpers-photos-docs";
