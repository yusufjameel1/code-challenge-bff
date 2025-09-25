import { Request, Response } from 'express';
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
            const product = await this.productService.createProduct(req.body);
            res.status(201).json(product);
        } catch (error: any) {
            console.error('[ProductController] Error creating product:', error);
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * Get all products
     */
    public async getAllProducts(req: Request, res: Response): Promise<void> {
        try {
            const products = await this.productService.getAllProducts();
            res.json(products);
        } catch (error: any) {
            console.error('[ProductController] Error getting products:', error);
            res.status(500).json({ error: 'Failed to retrieve products' });
        }
    }

    /**
     * Get a single product by ID
     */
    public async getProduct(req: Request, res: Response): Promise<void> {
        try {
            const product = await this.productService.getProductById(req.params.id);
            if (!product) {
                res.status(404).json({ error: 'Product not found' });
                return;
            }
            res.json(product);
        } catch (error: any) {
            console.error('[ProductController] Error getting product:', error);
            res.status(500).json({ error: 'Failed to retrieve product' });
        }
    }

    /**
     * Update a product
     */
    public async updateProduct(req: Request, res: Response): Promise<void> {
        try {
            const product = await this.productService.updateProduct(req.params.id, req.body);
            if (!product) {
                res.status(404).json({ error: 'Product not found' });
                return;
            }
            res.json(product);
        } catch (error: any) {
            console.error('[ProductController] Error updating product:', error);
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * Delete a product
     */
    public async deleteProduct(req: Request, res: Response): Promise<void> {
        try {
            const product = await this.productService.deleteProduct(req.params.id);
            if (!product) {
                res.status(404).json({ error: 'Product not found' });
                return;
            }
            res.status(200).json({ message: 'Product deleted successfully' });
        } catch (error: any) {
            console.error('[ProductController] Error deleting product:', error);
            res.status(500).json({ error: 'Failed to delete product' });
        }
    }

    /**
     * Get product by SKU
     */
    public async getProductBySku(req: Request, res: Response): Promise<void> {
        try {
            const product = await this.productService.getProductBySku(req.params.sku);
            if (!product) {
                res.status(404).json({ error: 'Product not found' });
                return;
            }
            res.json(product);
        } catch (error: any) {
            console.error('[ProductController] Error getting product by SKU:', error);
            res.status(500).json({ error: 'Failed to retrieve product' });
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
            const products = await this.productService.searchProducts(searchTerm);
            res.json(products);
        } catch (error: any) {
            console.error('[ProductController] Error searching products:', error);
            res.status(500).json({ error: 'Failed to search products' });
        }
    }
}