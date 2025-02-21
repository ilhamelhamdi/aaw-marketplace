import { Request, Response } from "express";
import * as Service from './services';


export const getAllCategoryHandler = async (req: Request, res: Response) => {
  const response = await Service.getAllCategoriesService();
  return res.status(response.status).send(response.data);
}

export const createCategoryHandler = async (req: Request, res: Response) => {
  const { name } = req.body;
  const response = await Service.createCategoryService(name);
  return res.status(response.status).send(response.data);
}

export const editCategoryHandler = async (req: Request, res: Response) => {
  const { category_id } = req.params;
  const { name } = req.body;
  const response = await Service.editCategoryService(category_id, name);
  return res.status(response.status).send(response.data);
}

export const deleteCategoryHandler = async (req: Request, res: Response) => {
  const { category_id } = req.params;
  const response = await Service.deleteCategoryService(category_id);
  return res.status(response.status).send(response.data);
}
