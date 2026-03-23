export interface ApiErrorLike {
  message?: string;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
}

export interface ImageAsset {
  _id?: string;
  url?: string;
  imageUrl?: string;
}

export interface Address {
  label?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface User {
  _id: string;
  name?: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  phone?: string;
  addresses?: Address[];
  isProfileCompleted?: boolean;
  isBlocked?: boolean;
}

export interface Category {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  images?: ImageAsset[];
  ratingAverage?: number;
  ratingCount?: number;
  stock: number;
  status?: string;
  categoryId?: string;
}

export interface CartItem {
  _id?: string;
  productId: Product;
  quantity: number;
  price: number;
}

export interface Cart {
  _id?: string;
  items: CartItem[];
}

export interface Review {
  _id: string;
  rating: number;
  comment: string;
  userId?: Pick<User, '_id' | 'name'>;
}

export interface OrderItem {
  _id?: string;
  productId?: Product;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  createdAt?: string;
  items?: OrderItem[];
  totalAmount?: number;
  orderStatus?: string;
}

export interface Payment {
  _id: string;
  amount: number;
  paymentMethod: string;
  orderId?: string | Pick<Order, '_id'>;
}

export interface SellerProfile {
  _id: string;
  shopName: string;
  shopDescription?: string;
  businessAddress?: string;
  approvalStatus?: string;
  isBlocked?: boolean;
  userId?: string | Pick<User, '_id' | 'email'>;
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong') {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const maybeMessage = (error as ApiErrorLike).message;
    if (typeof maybeMessage === 'string' && maybeMessage.length > 0) {
      return maybeMessage;
    }
  }

  return fallback;
}