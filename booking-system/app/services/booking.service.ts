import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { Booking } from '../models/booking.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly storageKey = 'bookeasy.bookings';
  private readonly bookingsSubject = new BehaviorSubject<Booking[]>(this.loadInitialData());
  /**
   * Returns a reactive stream of all stored bookings.
   */
  getBookings(): Observable<Booking[]> {
    return this.bookingsSubject.asObservable();
  }

  /**
   * Creates a new confirmed booking and persists it to LocalStorage.
   * @param data Appointment details supplied by the booking form.
   */
  addBooking(data: Omit<Booking, 'id' | 'status' | 'createdAt'>): void {
    if (this.isSlotTaken(data.date, data.time)) {
      return;
    }

    const nextBookings = this.sortBookings([
      ...this.bookingsSubject.value,
      {
        ...data,
        id: crypto.randomUUID(),
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      },
    ]);

    this.saveToStorage(nextBookings);
    this.bookingsSubject.next(nextBookings);
  }

  /**
   * Marks an existing booking as cancelled without removing it from storage.
   * @param id Unique booking identifier.
   */
  cancelBooking(id: string): void {
    const nextBookings = this.sortBookings(
      this.bookingsSubject.value.map((booking) =>
        booking.id === id ? { ...booking, status: 'cancelled' } : booking,
      ),
    );

    this.saveToStorage(nextBookings);
    this.bookingsSubject.next(nextBookings);
  }

  /**
   * Checks whether a date and time combination is already reserved by a confirmed booking.
   * @param date Booking date in YYYY-MM-DD format.
   * @param time Booking time in HH:mm format.
   */
  isSlotTaken(date: string, time: string): boolean {
    return this.bookingsSubject.value.some(
      (booking) => booking.date === date && booking.time === time && booking.status === 'confirmed',
    );
  }

  private loadInitialData(): Booking[] {
    const stored = this.loadFromStorage();

    if (stored.length > 0) {
      return stored;
    }

    const seed: Booking[] = [
      {
        id: crypto.randomUUID(),
        date: '2026-06-10',
        time: '10:00',
        name: 'Laura Martínez',
        email: 'laura@example.com',
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        date: '2026-06-15',
        time: '15:00',
        name: 'Carlos Ruiz',
        email: 'carlos@example.com',
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      },
    ];

    this.saveToStorage(seed);
    return seed;
  }

  private loadFromStorage(): Booking[] {
    try {
      const rawBookings = localStorage.getItem(this.storageKey);

      if (!rawBookings) {
        return [];
      }

      const parsedBookings: unknown = JSON.parse(rawBookings);

      if (!Array.isArray(parsedBookings)) {
        return [];
      }

      return this.sortBookings(parsedBookings.filter((value): value is Booking => this.isStoredBooking(value)));
    } catch (error: unknown) {
      console.error('Unable to load bookings from LocalStorage.', error);
      return [];
    }
  }

  private saveToStorage(bookings: Booking[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(bookings));
    } catch (error: unknown) {
      console.error('Unable to save bookings to LocalStorage.', error);
    }
  }

  private isStoredBooking(value: unknown): value is Booking {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const candidate = value as Partial<Booking>;

    return (
      typeof candidate.id === 'string' &&
      typeof candidate.date === 'string' &&
      typeof candidate.time === 'string' &&
      typeof candidate.name === 'string' &&
      typeof candidate.email === 'string' &&
      (candidate.status === 'confirmed' || candidate.status === 'cancelled') &&
      typeof candidate.createdAt === 'string'
    );
  }

  private sortBookings(bookings: Booking[]): Booking[] {
    return [...bookings].sort((left, right) => {
      const dateComparison = left.date.localeCompare(right.date);

      if (dateComparison !== 0) {
        return dateComparison;
      }

      return left.time.localeCompare(right.time);
    });
  }
}
