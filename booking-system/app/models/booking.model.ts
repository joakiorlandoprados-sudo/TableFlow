export interface Booking {
  id: string;
  date: string;
  time: string;
  name: string;
  email: string;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
}
