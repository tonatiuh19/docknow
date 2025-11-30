// Common types
import { Marina } from "../models/marina";

// Re-export Marina for convenience
export type { Marina };

export interface User {
  id: number;
  email: string;
  name: string;
  role: "admin" | "general_admin" | "receptionist" | "doctor" | "customer";
  profile_picture_url?: string;
  specialization?: string;
  employee_id?: string;
  is_active: boolean;
}

export interface Port {
  id: number;
  marina_id: number;
  name: string;
  type: "slip" | "mooring" | "dry_storage";
  size?: string;
  max_length?: number;
  max_beam?: number;
  price_per_day?: number;
  price_per_week?: number;
  price_per_month?: number;
  amenities?: string[];
  is_available: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: number;
  user_id: number;
  port_id: number;
  marina_id: number;
  check_in_date: string;
  check_out_date: string;
  boat_name?: string;
  boat_length?: number;
  boat_type?: string;
  total_amount: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  payment_status: "pending" | "paid" | "refunded";
  created_at: string;
  updated_at: string;
}

export interface DashboardMetrics {
  total_bookings: number;
  total_revenue: number;
  active_bookings: number;
  available_ports: number;
  occupancy_rate: number;
  revenue_growth: number;
  bookings_growth: number;
}

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  timestamp: number;
  read: boolean;
}

export type LoadingState = "idle" | "loading" | "succeeded" | "failed";
