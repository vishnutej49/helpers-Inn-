import { Request, Response } from 'express';
import { Helper } from '../models/helper';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { log } from 'console';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const S3_BUCKET_NAME = "helpers-photos-docs";
export const getHelpers = async (req: Request, res: Response): Promise<void> => {
  const helpers = await Helper.find();
  res.json(helpers);
};

export const getHelperById = async(req: Request, res: Response): Promise<void> =>{
  const {id} = req.params;
  const helper = await Helper.findById(id);
  res.json(helper);
}

export const createHelper = async (req: Request, res: Response): Promise<void> => {
  
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const photoFile = files?.photoURL ? files.photoURL[0] : undefined;
    const kycDocFile = files?.kycdoc ? files.kycdoc[0] : undefined;
    let photoURL: string | undefined;
    let kycdoc: string | undefined;
    // console.log(req);
    // console.log("files"+files+" "+photoFile+" "+kycDocFile);
    if (photoFile) {
      const photoUploadParams = {
        Bucket: S3_BUCKET_NAME!,
        Key: `profile-photos/${uuidv4()}-${photoFile.originalname}`,
        Body: photoFile.buffer,
        ContentType: photoFile.mimetype,
        ACL: 'public-read',
      };
      const photoUploadResult = await s3.upload(photoUploadParams).promise();
      photoURL = photoUploadResult.Location;
      console.log(typeof photoURL)
      console.log(photoURL+" "+(typeof photoURL))
    }

    if (kycDocFile) {
      const kycUploadParams = {
        Bucket: S3_BUCKET_NAME!,
        Key: `kyc-documents/${uuidv4()}-${kycDocFile.originalname}`,
        Body: kycDocFile.buffer,
        ContentType: kycDocFile.mimetype,
        ACL: 'public-read',
      };
      const kycUploadResult = await s3.upload(kycUploadParams).promise();
      kycdoc = kycUploadResult.Location;
      console.log(kycdoc+" "+(typeof kycdoc));
    }
    const lastHelper = await Helper.findOne().sort({ employeeCode: -1 });
    let nextEmployeeCode = 10000;
    if (lastHelper && lastHelper.employeeCode) {
      const lastCodeNum = parseInt(lastHelper.employeeCode, 10);
      if (!isNaN(lastCodeNum) && lastCodeNum >= 10000) {
        nextEmployeeCode = lastCodeNum + 1;
      }
    }
    const employeeCode = nextEmployeeCode.toString().padStart(5, '0');

    const parsedLanguages = (() => {
    if (Array.isArray(req.body.languages)) return req.body.languages;
      try {
        return JSON.parse(req.body.languages);
      } catch {
        return [];
      }
    })();

    const newHelper = new Helper({
      serviceType: req.body.serviceType,
      organization: req.body.organization,
      fullName: req.body.fullName,
      gender: req.body.gender,
      phno: Number(req.body.phno),
      email: req.body.email,
      vehicleType: req.body.vehicleType,
      vehicleNumber: req.body.vehicleNumber,
      docType: req.body.docType,
      languages: parsedLanguages,
      photoURL,
      kycdoc,
      employeeCode,
      joinedOn: new Date(),
    });

    const savedHelper = await newHelper.save();
    res.status(201).json(savedHelper);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateHelper = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const photoFile = files?.photoURL ? files.photoURL[0] : undefined;
    const kycDocFile = files?.kycdoc ? files.kycdoc[0] : undefined;

    let photoURL: string | undefined = req.body.photoURL;
    let kycdoc: string | undefined = req.body.kycdoc;

    if (photoFile) {
      const photoUploadParams = {
        Bucket: S3_BUCKET_NAME!,
        Key: `profile-photos/${uuidv4()}-${photoFile.originalname}`,
        Body: photoFile.buffer,
        ContentType: photoFile.mimetype,
        ACL: 'public-read',
      };
      const photoUploadResult = await s3.upload(photoUploadParams).promise();
      photoURL = photoUploadResult.Location;
    }

    if (kycDocFile) {
      const kycUploadParams = {
        Bucket: S3_BUCKET_NAME!,
        Key: `kyc-documents/${uuidv4()}-${kycDocFile.originalname}`,
        Body: kycDocFile.buffer,
        ContentType: kycDocFile.mimetype,
        ACL: 'public-read',
      };
      const kycUploadResult = await s3.upload(kycUploadParams).promise();
      kycdoc = kycUploadResult.Location;
    }

    const updated = await Helper.findByIdAndUpdate(id, { ...req.body, photoURL, kycdoc }, { new: true, runValidators: true });
    if (!updated) {
      res.status(404).json({ message: 'Helper not found' });
      return;
    }
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteHelper = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const deleted = await Helper.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ message: 'Helper not found' });
      return;
    }
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
