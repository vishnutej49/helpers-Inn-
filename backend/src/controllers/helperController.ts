import { Request, Response } from 'express';
import { Helper } from '../models/helper';

export const getHelpers = async (req: Request, res: Response) => {
  const helpers = await Helper.find();
  console.log(helpers);
  helpers.sort((a, b) => a.name.localeCompare(b.name));
  res.json(helpers);
};
export const getHelperById = async(req: Request, res: Response) =>{
  const {id} = req.params;
  const helper = await Helper.findById(id);
  res.json(helper);
}
export const createHelper = async (req: Request, res: Response) => {
  const helper = new Helper(req.body);
  await helper.save();
  res.status(201).json(helper);
};

export const updateHelper = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = await Helper.findByIdAndUpdate(id, req.body, { new: true });
  res.json(updated);
};

export const deleteHelper = async (req: Request, res: Response) => {
  const { id } = req.params;
  await Helper.findByIdAndDelete(id);
  res.status(204).send("Deleted successfully");
};
