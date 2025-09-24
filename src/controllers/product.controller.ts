import { Request, Response } from 'express';
import { AuthRequest } from '../types/request.types';
import { Product } from '../models/product.model';
import { ProductService } from '../services/product.service';

export class ProductController {
    private static instance: ProductController;
    private readonly productService: ProductService;

    private constructor() {
        this.productService = ProductService.getInstance();
    }

    /**
     * Get the singleton instance of ProductController
     */
    public static getInstance(): ProductController {
        if (!ProductController.instance) {
            ProductController.instance = new ProductController();
        }
        return ProductController.instance;
    }

    /**
     * Create a new product
     */
    public async createProduct(req: Request, res: Response): Promise<void> {
        try {
            const product = new Product(req.body);
            await product.save();
            res.status(201).json(product);
        } catch (error: any) {
            console.error('[ProductController] Error creating product:', error);
            res.status(400).json({
                error: 'Failed to create product',
                details: error.message
            });
        }
    }

    /**
     * Get all products
     */
    public async getAllProducts(req: Request, res: Response): Promise<void> {
        try {
            const products = await Product.find({});
            res.json(products);
        } catch (error: any) {
            console.error('[ProductController] Error getting products:', error);
            res.status(500).json({
                error: 'Failed to retrieve products',
                details: error.message
            });
        }
    }

    /**
     * Get a single product by ID
     */
    public async getProduct(req: Request, res: Response): Promise<void> {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) {
                res.status(404).json({ error: 'Product not found' });
                return;
            }
            res.json(product);
        } catch (error: any) {
            console.error('[ProductController] Error getting product:', error);
            res.status(500).json({
                error: 'Failed to retrieve product',
                details: error.message
            });
        }
    }

    /**
     * Update a product
     */
    public async updateProduct(req: Request, res: Response): Promise<void> {
        try {
            const product = await Product.findByIdAndUpdate(
                req.params.id,
                { $set: req.body },
                { new: true, runValidators: true }
            );

            if (!product) {
                res.status(404).json({ error: 'Product not found' });
                return;
            }

            res.json(product);
        } catch (error: any) {
            console.error('[ProductController] Error updating product:', error);
            res.status(400).json({
                error: 'Failed to update product',
                details: error.message
            });
        }
    }

    /**
     * Delete a product
     */
    public async deleteProduct(req: Request, res: Response): Promise<void> {
        try {
            const product = await Product.findByIdAndDelete(req.params.id);

            if (!product) {
                res.status(404).json({ error: 'Product not found' });
                return;
            }

            res.status(204).send();
        } catch (error: any) {
            console.error('[ProductController] Error deleting product:', error);
            res.status(500).json({
                error: 'Failed to delete product',
                details: error.message
            });
        }
    }

    /**
     * Get product by SKU
     */
    public async getProductBySku(req: Request, res: Response): Promise<void> {
        try {
            const product = await Product.findOne({ sku: req.params.sku });
            if (!product) {
                res.status(404).json({ error: 'Product not found' });
                return;
            }
            res.json(product);
        } catch (error: any) {
            console.error('[ProductController] Error getting product by SKU:', error);
            res.status(500).json({
                error: 'Failed to retrieve product',
                details: error.message
            });
        }
    }

    /**
     * Search products
     */
    public async searchProducts(req: Request, res: Response): Promise<void> {
        try {
            const searchTerm = req.query.q as string;
            if (!searchTerm) {
                res.status(400).json({ error: 'Search term is required' });
                return;
            }

            const products = await Product.find({
                $or: [
                    { name: { $regex: searchTerm, $options: 'i' } },
                    { sku: { $regex: searchTerm, $options: 'i' } },
                    { description: { $regex: searchTerm, $options: 'i' } }
                ]
            });

            res.json(products);
        } catch (error: any) {
            console.error('[ProductController] Error searching products:', error);
            res.status(500).json({
                error: 'Failed to search products',
                details: error.message
            });
        }
    }
}