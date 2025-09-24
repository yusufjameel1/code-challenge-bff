export interface IProduct {
    _id?: string;
    sku: string;
    name: string;
    price: number;
}

export interface IProductDocument extends Omit<IProduct, '_id'> {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}