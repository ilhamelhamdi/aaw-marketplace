import express from 'express';
import { validate, verifyJWTProduct } from "@src/middleware";
import * as Validation from './validation';
import * as Handler from './category.handler';

const router = express.Router();

router.get('/', Handler.getAllCategoryHandler);
router.post('/', verifyJWTProduct, validate(Validation.createCategorySchema), Handler.createCategoryHandler);
router.put('/:category_id', verifyJWTProduct, validate(Validation.editCategorySchema), Handler.editCategoryHandler);
router.delete('/:category_id', verifyJWTProduct, validate(Validation.deleteCategorySchema), Handler.deleteCategoryHandler);

export default router;