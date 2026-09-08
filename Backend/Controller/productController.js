import Product from "../model/product.js";
import cloudinary from "../config/cloudnary.js";

const uploadBufferToCloudinary = (file) =>
    new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "ecommerce-products",
                resource_type: "image",
            },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(result);
            }
        );

        stream.end(file.buffer);
    });

// Create new product
export const createProduct = async (req, res) => {
    try {
        console.log('createProduct called');
        console.log('Content-Type:', req.headers['content-type']);
        console.log('Body keys:', req.body && Object.keys(req.body));
        console.log('Files:', req.files ? req.files.length : 0);

        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                message: 'No form fields parsed. Make sure request is multipart/form-data and the upload middleware is applied.'
            });
        }
        const {
            title,
            description,
            price,
            category,
            stock
        } = req.body;

        if (!title || price === undefined || price === null || price === "") {
            return res.status(400).json({
                message: "Title and price are required"
            });
        }

        const parsedPrice = Number(price);

        if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
            return res.status(400).json({
                message: "Price must be a valid non-negative number"
            });
        }

        const parsedStock =
            stock === undefined || stock === null || stock === ""
                ? 0
                : Number(stock);

        if (Number.isNaN(parsedStock) || parsedStock < 0) {
            return res.status(400).json({
                message: "Stock must be a valid non-negative number"
            });
        }

        const uploadedImages = [];
        let lastUploadError = null;

        // multer.memoryStorage() gives Buffer in file.buffer
        // req.files should be populated by upload.array("images", 5)
        const files = Array.isArray(req.files) ? req.files : [];
        console.log("[createProduct] req.files length:", files.length);
        console.log("[createProduct] req.body keys:", req.body ? Object.keys(req.body) : null);

        if (files.length === 0) {
            console.warn("No files received by multer.");
        }

        for (const file of files) {
            try {
                if (!file?.buffer) {
                    console.warn("Missing file.buffer for upload:", Object.keys(file || {}));
                    continue;
                }

                console.log(
                    "Uploading file to cloudinary. buffer length:",
                    file.buffer.length,
                    "originalname:",
                    file.originalname
                );

                const uploadedFile = await uploadBufferToCloudinary(file);
                console.log("Cloudinary upload result keys:", uploadedFile ? Object.keys(uploadedFile) : null);
                console.log("Cloudinary secure_url:", uploadedFile?.secure_url);

                if (uploadedFile?.secure_url) {
                    uploadedImages.push(uploadedFile.secure_url);
                } else {
                    console.warn("Cloudinary upload returned no secure_url:", uploadedFile);
                }
            } catch (uploadError) {
                lastUploadError = uploadError;
                console.warn(
                    "Cloudinary upload failed, continuing without this image:",
                    uploadError?.message || uploadError
                );
            }
        }

        // If nothing uploaded, fail fast so you notice the issue instead of saving images: [].
        if (uploadedImages.length === 0) {
            const filesReceived = Array.isArray(req.files) ? req.files.length : 0;
            const uploadMessage = lastUploadError?.message ||
                (filesReceived === 0
                    ? "No images were received. Select at least one image."
                    : "Cloudinary rejected the image upload.");

            return res.status(filesReceived === 0 ? 400 : 502).json({
                message: uploadMessage,
                filesReceived: Array.isArray(req.files) ? req.files.length : 0,
                cloudinaryConfigured: Boolean(
                    process.env.CLOUDINARY_CLOUD_NAME &&
                    process.env.CLOUDINARY_API_KEY &&
                    process.env.CLOUDINARY_API_SECRET
                ),
            });
        }

        const createdProduct = await Product.create({
            title,
            description,
            price: parsedPrice,
            category,
            images: uploadedImages,
            stock: parsedStock
        });

        res.status(201).json({
            message: "Product created successfully",
            product: createdProduct
        });

    } catch (error) {
        res.status(500).json({
            message: error.message || "Server error"
        });
    }
};

// Get all products
// Get all products
export const getAllProducts = async (req, res) => {
    try {
        const { search, category } = req.query;
        const categories = (await Product.distinct("category"))
            .filter(Boolean)
            .sort((first, second) => first.localeCompare(second));

        let filter = {};

        // Category filter
        if (category) {
            filter.category = category;
        }

        // If no search keyword, return all products
        if (!search) {
            const products = await Product.find(filter).sort({ createdAt: -1 });

            return res.status(200).json({
                products,
                similarProducts: [],
                categories,
            });
        }

        // Search by title, description and category
        filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } },
        ];

        let products = await Product.find(filter);

        // Exact title matches first
        products.sort((a, b) => {
            const aExact = a.title.toLowerCase() === search.toLowerCase();
            const bExact = b.title.toLowerCase() === search.toLowerCase();

            if (aExact && !bExact) return -1;
            if (!aExact && bExact) return 1;

            return a.title.localeCompare(b.title);
        });

        // Find similar products from same category
        let similarProducts = [];

        if (products.length > 0) {
            similarProducts = await Product.find({
                category: products[0].category,
                _id: { $nin: products.map((p) => p._id) },
            }).limit(8);
        }

        res.status(200).json({
            products,
            similarProducts,
            categories,
        });

    } catch (error) {
        res.status(500).json({
            message: "Server Error",
            error: error.message,
        });
    }
};

// Update product
export const updateProduct = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                message: "Product details are required."
            });
        }

        const parsedPrice = Number(req.body.price);
        const parsedStock = Number(req.body.stock || 0);

        if (!Number.isFinite(parsedPrice) || parsedPrice < 0 || !Number.isFinite(parsedStock) || parsedStock < 0) {
            return res.status(400).json({
                message: "Price and stock must be valid non-negative numbers.",
            });
        }

        const update = {
            title: req.body.title,
            description: req.body.description,
            price: parsedPrice,
            category: req.body.category,
            stock: parsedStock,
        };

        if (Array.isArray(req.files) && req.files.length > 0) {
            const uploadedFiles = await Promise.all(
                req.files.map((file) => uploadBufferToCloudinary(file))
            );
            const uploadedImages = uploadedFiles
                .map((file) => file.secure_url)
                .filter(Boolean);
            const existingImages = Array.isArray(req.body.existingImage)
                ? req.body.existingImage
                : [req.body.existingImage].filter(Boolean);
            update.images = [...existingImages, ...uploadedImages];
        } else {
            update.images = Array.isArray(req.body.existingImage)
                ? req.body.existingImage
                : [req.body.existingImage].filter(Boolean);
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            update,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({
            message: "Product updated successfully",
            product,
        });

    } catch (error) {
        res.status(500).json({
            message: "Server Error",
            error: error.message,
        });
    }
};

// Delete product
export const deleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);

        res.json({
            message: "Product deleted successfully",
        });

    } catch (error) {
        res.status(500).json({
            message: "Server Error",
            error: error.message,
        });
    }
};