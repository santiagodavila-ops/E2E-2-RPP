export type Role = 'PASSENGER' | 'DRIVER';
export type TripStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  available: boolean;
  rating: number;
}

export interface Trip {
  id: number;
  status: TripStatus;
  pickupAddress: string;
  dropoffAddress: string;
  requestedAt: string; // ISO 8601
  acceptedAt: string | null;
  completedAt: string | null;
  passenger: User;
  driver: User | null;
  passengerRating: number | null;
  ratingComment: string | null;
}

export interface AuthResponse {
  token: string;
}

export interface RegisterBody {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface CreateTripBody {
  pickupAddress: string;
  dropoffAddress: string;
}

export interface RateTripBody {
  rating: number;
  comment?: string;
}
