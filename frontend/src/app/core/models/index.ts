export interface User {
  _id: string;
  email: string;
  name: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    district?: string;
    ward?: string;
  };
  avatar?: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  description: string;
  specs: {
    screen?: string;
    cpu?: string;
    ram?: string;
    storage?: string;
    battery?: string;
    camera?: string;
    os?: string;
  };
  images: string[];
  thumbnail: string;
  video: string;
  stock: number;
  sold: number;
  rating: number;
  numReviews: number;
  isActive: boolean;
  isFeatured: boolean;
  colors: string[];
  reviews?: {
    _id: string;
    user: string;
    name: string;
    rating: number;
    comment: string;
    createdAt: string;
  }[];
  promotion?: {
    name: string;
    discountPercentage: number;
    endDate: Date | string;
  };
  salePrice?: number;
  discountPercentage?: number;
  flashSaleEnd?: Date | string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  color?: string;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  total: number;
}

export interface OrderItem {
  product: any;
  name: string;
  price: number;
  quantity: number;
  color?: string;
  thumbnail?: string;
}

export interface Order {
  _id: string;
  user: string;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: {
    name: string;
    phone: string;
    street: string;
    ward?: string;
    district: string;
    city: string;
  };
  paymentMethod: 'cod' | 'banking' | 'momo' | 'vnpay';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentProof?: string;
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
  note?: string;
  shippingFee: number;
  paymentUrl?: string; // VNPay payment URL
  createdAt: string;
  updatedAt: string;
}


export interface Message {
  _id: string;
  sender: User;
  receiver: User;
  content: string;
  messageType: 'text' | 'image' | 'product';
  read: boolean;
  createdAt: string;
  suggestedProducts?: {
    _id: string;
    name: string;
    price: number;
    brand: string;
    thumbnail: string;
    rating: number;
    numReviews: number;
    sold: number;
  }[];
}

export interface Notification {
  _id: string;
  user: string;
  type: 'order' | 'order_status' | 'message' | 'promotion' | 'system';
  title: string;
  content: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data?: {
    products?: T[];
    orders?: T[];
    users?: T[];
    pagination?: {
      current: number;
      pages: number;
      total: number;
    };
  };
}
