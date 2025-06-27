import { create } from 'zustand';
import { PaymentDetails } from '../types';

interface PaymentState {
  paymentDetails: PaymentDetails | null;
  isProcessing: boolean;
  error: string | null;
  processPayment: (userId: string, eventId: string, amount: number, paymentMethod: string) => Promise<PaymentDetails | null>;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  paymentDetails: null,
  isProcessing: false,
  error: null,
  
  processPayment: async (userId: string, eventId: string, amount: number, paymentMethod: string) => {
    set({ isProcessing: true, error: null });
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a mock payment response
      const paymentDetails: PaymentDetails = {
        id: `pay_${Math.random().toString(36).substring(2, 15)}`,
        userId,
        eventId,
        amount,
        status: 'completed',
        paymentMethod,
        paymentDate: new Date().toISOString(),
        transactionId: `txn_${Math.random().toString(36).substring(2, 15)}`
      };
      
      set({ 
        paymentDetails, 
        isProcessing: false 
      });
      
      return paymentDetails;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Payment processing failed', 
        isProcessing: false 
      });
      return null;
    }
  }
}));