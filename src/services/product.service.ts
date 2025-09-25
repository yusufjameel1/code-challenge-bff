import { Product } from '../models/product.model';
import { IProduct } from '../types/product.types';

export class ProductService {
    private static instance: ProductService;

    private constructor() { }

    /**
     * Get the singleton instance of ProductService
     */
    public static getInstance(): ProductService {
        if (!ProductService.instance) {
            ProductService.instance = new ProductService();
        }
        return ProductService.instance;
    }

    /**
     * Create a new product
     */
    public async createProduct(productData: IProduct): Promise<IProduct> {
        const existingProduct = await Product.findOne({ sku: productData.sku });
        if (existingProduct) {
            throw new Error('Product with this SKU already exists');
        }

        const product = new Product(productData);
        return await product.save();
    }

    async getAllProducts(): Promise<IProduct[]> {
        return await Product.find().lean();
    }

    async getProductById(id: string): Promise<IProduct | null> {
        return await Product.findById(id);
    }

    async getProductBySku(sku: string): Promise<IProduct | null> {
        return await Product.findOne({ sku });
    }

    async updateProduct(id: string, productData: Partial<IProduct>): Promise<IProduct | null> {
        // If SKU is being updated, check if new SKU already exists
        if (productData.sku) {
            const existingProduct = await Product.findOne({
                sku: productData.sku,
                _id: { $ne: id }
            });
            if (existingProduct) {
                throw new Error('Product with this SKU already exists');
            }
        }

        return await Product.findByIdAndUpdate(
            id,
            productData,
            { new: true, runValidators: true }
        );
    }

    async deleteProduct(id: string): Promise<IProduct | null> {
        return await Product.findByIdAndDelete(id);
    }

    async searchProducts(searchTerm: string): Promise<IProduct[]> {
        return await Product.find({
            $or: [
                { name: { $regex: searchTerm, $options: 'i' } },
                { sku: { $regex: searchTerm, $options: 'i' } }
            ]
        });
    }
}