import { Response } from 'express';
import { AuthRequest } from '../types/request.types';
import { productService } from '../services/product.service';

// Create a new product
export const createProduct = async (req: AuthRequest, res: Response) => {
    try {
        const product = await productService.createProduct(req.body);
        res.status(201).json(product);
    } catch (error: any) {
        if (error.message === 'Product with this SKU already exists') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error creating product' });
    }
};

// Get all products
export const getProducts = async (_req: AuthRequest, res: Response) => {
    try {
        const products = await productService.getAllProducts();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching products' });
    }
};

// Get a single product by ID
export const getProductById = async (req: AuthRequest, res: Response) => {
    try {
        const product = await productService.getProductById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching product' });
    }
};

// Get a product by SKU
export const getProductBySku = async (req: AuthRequest, res: Response) => {
    try {
        const product = await productService.getProductBySku(req.params.sku);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching product' });
    }
};

// Update a product
export const updateProduct = async (req: AuthRequest, res: Response) => {
    try {
        const product = await productService.updateProduct(req.params.id, req.body);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error: any) {
        if (error.message === 'Product with this SKU already exists') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error updating product' });
    }
};

// Delete a product
export const deleteProduct = async (req: AuthRequest, res: Response) => {
    try {
        const product = await productService.deleteProduct(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting product' });
    }
};