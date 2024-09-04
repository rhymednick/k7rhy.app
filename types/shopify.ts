// types/shopify.ts

export interface ShopifyImage {
    src: string;
    altText: string | null;
}

export interface ShopifyProduct {
    id: string;
    title: string;
    description: string;
    handle: string;
    images: ShopifyImage[];
}

export interface ShopifyProductEdge {
    node: ShopifyProduct;
}

export interface ShopifyProductData {
    products: {
        edges: ShopifyProductEdge[];
    };
}

// Define a more general error type
export interface GraphQLError {
    message: string;
    locations?: { line: number; column: number }[];
    path?: string[];
    extensions?: any;
}

export interface ShopifyProductResponse {
    data?: ShopifyProductData;
    errors?: GraphQLError[]; // Adjust to match possible error structure
}
