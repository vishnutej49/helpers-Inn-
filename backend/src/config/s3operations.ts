import { s3, S3_BUCKET } from './s3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export const uploadToS3 = async (file: Express.Multer.File, folder: 'kyc-documents' | 'profile-photos'): Promise<string> => {
  const fileExt = path.extname(file.originalname);
  const key = `${folder}/${uuidv4()}${fileExt}`;
  const params = {
    Bucket: S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ACL: 'public-read',
    ContentType: file.mimetype,
  };

  await s3.upload(params).promise();
  return `https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};

export const deleteFromS3 = async(fileUrl: string): Promise<void> =>{
  if(!fileUrl) return;
  const key = new URL(fileUrl).pathname.slice(1); 
  try{
    await s3.deleteObject({
      Bucket: S3_BUCKET,
      Key: key
    }).promise();
  }
  catch(e){
    console.log(e);
  }
}
