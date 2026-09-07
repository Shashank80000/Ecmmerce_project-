import express from "express";
import { loginAdmin, createAdmin } from "../Controller/adminController.js";

import {
    createProduct,
    getAllProducts,
    updateProduct,
    deleteProduct,

} from "../Controller/productController.js";

import { verifyAdmin } from "../middleware/adminMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/login", loginAdmin);


// ⚠️ USE ONLY ONCE THEN DELETE
router.post("/create-admin", createAdmin);

// router to create new product (handles multipart/form-data)
router.post('/add', verifyAdmin, upload.array('images', 5), createProduct);

// router to get all product
router.get('/',verifyAdmin, getAllProducts); 

// router to update product
router.put('/update/:id', verifyAdmin, upload.array('images', 1), updateProduct);

// router to delete product
router.delete('/delete/:id', verifyAdmin, deleteProduct);




export default router;