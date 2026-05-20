import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';

import { Booking } from '../../models/booking.model';
import { BookingService } from '../../services/booking.service';

interface BookingListItem extends Booking {
  displayDate: string;
}

interface BookingListViewModel {
  bookings: BookingListItem[];
  showCancelled: boolean;
  hasConfirmedBookings: boolean;
  hasAnyBookings: boolean;
}

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-list.component.html',
  styleUrl: './booking-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingListComponent {
  private readonly bookingService = inject(BookingService);
  private readonly showCancelledSubject = new BehaviorSubject<boolean>(false);

  readonly viewModel$ = combineLatest([
    this.bookingService.getBookings(),
    this.showCancelledSubject,
  ]).pipe(
    map(([bookings, showCancelled]) => this.createViewModel(bookings, showCancelled)),
  );

  handleCancelledToggle(event: Event): void {
    const checkbox = event.target as HTMLInputElement | null;
    this.showCancelledSubject.next(checkbox?.checked ?? false);
  }

  cancelBooking(id: string): void {
    this.bookingService.cancelBooking(id);
  }

  trackByBookingId(_index: number, booking: BookingListItem): string {
    return booking.id;
  }

  private createViewModel(bookings: Booking[], showCancelled: boolean): BookingListViewModel {
    const sortedBookings = [...bookings].sort((left, right) => {
      const dateComparison = left.date.localeCompare(right.date);

      if (dateComparison !== 0) {
        return dateComparison;
      }

      return left.time.localeCompare(right.time);
    });

    const visibleBookings = sortedBookings
      .filter((booking) => showCancelled || booking.status === 'confirmed')
      .map((booking) => ({
        ...booking,
        displayDate: this.formatDate(booking.date),
      }));

    return {
      bookings: visibleBookings,
      showCancelled,
      hasConfirmedBookings: sortedBookings.some((booking) => booking.status === 'confirmed'),
      hasAnyBookings: sortedBookings.length > 0,
    };
  }

  private formatDate(isoDate: string): string {
    const [year, month, day] = isoDate.split('-').map((value) => Number(value));
    const displayDate = new Date(year, month - 1, day);

    return displayDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
