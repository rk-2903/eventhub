export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'organizer' | 'admin';
  avatar?: string;
  phone?: string;
  address?: string;
  joinDate: string;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  organizer_id: string;
  organizerName: string;
  event_type: 'regular' | 'intermediate' | 'advanced' | 'summer';
  price_type: 'hourly' | 'weekly' | 'monthly';
  base_price: number;
  min_hours?: number;
  min_weeks?: number;
  min_months?: number;
  created_at: string;
  updated_at: string;
  batches?: Batch[];
  discounts?: Discount[];
  // UI display properties
  imageUrl?: string;
  category?: string;
  date?: string;
  time?: string;
  location?: string;
  capacity?: number;
  enrolled?: number;
}

export interface Batch {
  id: string;
  event_id: string;
  name: string;
  schedule: string;
  start_time: string;
  end_time: string;
  working_days: string[];
  capacity: number;
  enrolled: number;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  event_id: string;
  batch_id?: string;
  hours_registered?: number;
  weeks_registered?: number;
  months_registered?: number;
  total_amount: number;
  discount_applied: number;
  final_amount: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  event?: Event;
}

export interface Discount {
  id: string;
  event_id: string;
  name: string;
  description?: string;
  discount_type: 'seasonal' | 'bulk' | 'early_bird';
  percentage: number;
  min_registration_value?: number;
  valid_from: string;
  valid_until: string;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: string;
  userId: string;
  eventId: string;
  batchId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  notes?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface PaymentDetails {
  id: string;
  userId: string;
  eventId: string;
  amount: number;
  status: 'pending' | 'completed' | 'refunded';
  paymentMethod: string;
  paymentDate: string;
  transactionId: string;
}

export interface UserProfile {
  user: User;
  enrollments: (Enrollment & { event: Event })[];
  attendance: Attendance[];
  payments: PaymentDetails[];
  stats: {
    totalEvents: number;
    completedEvents: number;
    upcomingEvents: number;
    attendanceRate: number;
  };
}