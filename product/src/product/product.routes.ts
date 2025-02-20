import express from 'express';
import { validate, verifyJWTProduct } from "@src/middleware";
import * as Validation from './validation';
import * as Handler from './product.handler';

const router = express.Router();

router.get('', Handler.getAllProductsHandler);
router.get('/:id', validate(Validation.getProductByIdSchema), Handler.getProductByIdHandler);
router.post('/many', validate(Validation.getManyProductDatasByIdSchema), Handler.getManyProductDatasByIdHandler);
router.get('/category/:category_id', validate(Validation.getProductByCategorySchema), Handler.getProductByCategoryHandler);
router.post('', verifyJWTProduct, validate(Validation.createProductSchema), Handler.createProductHandler);
router.put('/:id', verifyJWTProduct, validate(Validation.editProductSchema), Handler.editProductHandler);
router.delete('/:id', verifyJWTProduct, validate(Validation.deleteProductSchema), Handler.deleteProductHandler);

export default router;