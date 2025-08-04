import { Request, Response } from 'express';
import { Helper } from '../models/helper';
import { uploadToS3 } from '../config/uploadToS3';

export const createHelper = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };
    console.log(req.body);
    console.log(files);
    let photoURL = '';
    let kycdoc = '';

    if (files?.photoURL?.[0]) {
      photoURL = await uploadToS3(files.photoURL[0]);
    }
    if (files?.kycdoc?.[0]) {
      kycdoc = await uploadToS3(files.kycdoc[0]);
    }
    console.log(photoURL, kycdoc);


    const lastHelper = await Helper.findOne().sort({ employeeCode: -1 });
    let nextEmployeeCode = 10000;
    if (lastHelper && lastHelper.employeeCode) {
      const lastCodeNum = parseInt(lastHelper.employeeCode, 10);
      if (!isNaN(lastCodeNum) && lastCodeNum >= 10000) {
        nextEmployeeCode = lastCodeNum + 1;
      }
    }
    const employeeCode = nextEmployeeCode.toString().padStart(5, '0');
    const {
      serviceType,
      organization,
      fullName,
      gender,
      phno,
      email,
      vehicleType,
      vehicleNumber,
      docType,
      languages,
      joinedOn
    } = req.body;

    const helper = new Helper({
      serviceType,
      organization,
      fullName,
      gender,
      phno,
      email,
      vehicleType,
      vehicleNumber,
      docType,
      kycdoc,
      photoURL,
      languages: Array.isArray(languages) ? languages : JSON.parse(languages),
      employeeCode,
      joinedOn
    });

    const savedHelper = await helper.save();
    res.status(201).json(savedHelper);
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const updateHelper = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    let photoURL = '';
    let kycdoc = '';

    if (files?.photoURL?.[0]) {
      photoURL = await uploadToS3(files.photoURL[0]);
    }
    if (files?.kycdoc?.[0]) {
      kycdoc = await uploadToS3(files.kycdoc[0]);
    }


    const {
      serviceType,
      organization,
      fullName,
      gender,
      phno,
      email,
      vehicleType,
      vehicleNumber,
      docType,
      languages,
      joinedOn
    } = req.body;

    const updateData: any = {
      serviceType,
      organization,
      fullName,
      gender,
      phno,
      email,
      vehicleType,
      vehicleNumber,
      docType,
      joinedOn,
      languages: Array.isArray(languages) ? languages : JSON.parse(languages)
    };

    if (photoURL) updateData.photoURL = photoURL;
    if (kycdoc) updateData.kycdoc = kycdoc;

    const updatedHelper = await Helper.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (!updatedHelper) {
      res.status(404).json({ message: 'Helper not found' });
      return;
    }

    res.json(updatedHelper);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getHelpers = async (req: Request, res: Response): Promise<void> => {
  const helpers = await Helper.find();
  res.json(helpers);
};

export const getHelperById = async(req: Request, res: Response): Promise<void> =>{
  const {id} = req.params;
  const helper = await Helper.findById(id);
  res.json(helper);
}

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




// export const createHelperTemp = async(req: Request, res: Response): Promise<void> => {
//   try {
//     const {fullName, email, phno, serviceType, organization, gender, vehicleType, vehicleNumber, docType, languages} = req.body;
//     const newHelper = new Helper({fullName, email, phno, serviceType, organization, gender, vehicleType, vehicleNumber, docType, languages});
//     const savedHelper = await newHelper.save();
//     res.status(201).json(savedHelper);
//   } catch (error: any) {
//     console.log(error.message)
//     res.status(400).json({ message: error.message });
//   }
// }

// export const updateHelperTemp = async(req: Request, res: Response): Promise<void> => {
//   const {id} = req.params;
//   try {
//     const updated = await Helper.findByIdAndUpdate(id, req.body, {new: true, runValidators: true});
//     if(!updated){
//       res.status(404).json({message: 'Helper not found'});
//       return;
//     }
//     res.json(updated);
//   } catch (error: any) {
//     res.status(400).json({ message: error.message });
//   }
// }
