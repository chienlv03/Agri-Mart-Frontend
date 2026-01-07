export interface Notification {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  type: 'ORDER_CREATED' | 'ORDER_CONFIRMED' | 'ORDER_SHIPPING' | 'ORDER_COMPLETED' | 'ORDER_CANCELLED' | 'PRODUCT_APPROVED' | 'PRODUCT_REJECTED' | 'SHOP_NEW_PRODUCT' | 'PRODUCT_HARVEST_NOW';
  referenceId: string; // OrderId hoặc ProductId
  imageUrl?: string;
  isRead: boolean;
  createdAt: string;
}