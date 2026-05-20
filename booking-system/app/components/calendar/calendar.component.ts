import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';

import { Booking } from '../../models/booking.model';
import { BookingService } from '../../services/booking.service';

interface CalendarDay {
  isoDate: string;
  dayNumber: number;
  isToday: boolean;
  isSelected: boolean;
  isPast: boolean;
  hasConfirmedBooking: boolean;
  isInteractive: boolean;
  isPlaceholder: boolean;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarComponent {
  @Output() readonly dateSelected = new EventEmitter<string>();

  @Input() set selectedDate(value: string | null) {
    this.selectedDateSubject.next(value ?? '');
  }

  readonly weekDayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  private readonly bookingService = inject(BookingService);
  private readonly todayIso = this.toIsoDate(new Date());
  private readonly viewedMonthSubject = new BehaviorSubject<Date>(this.startOfMonth(new Date()));
  private readonly selectedDateSubject = new BehaviorSubject<string>('');

  readonly monthLabel$ = this.viewedMonthSubject.pipe(
    map((viewedMonth) =>
      viewedMonth.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      }),
    ),
  );

  readonly canGoToPreviousMonth$ = this.viewedMonthSubject.pipe(
    map((viewedMonth) => this.getMonthKey(viewedMonth) > this.getMonthKey(this.startOfMonth(new Date()))),
  );

  readonly calendarDays$ = combineLatest([
    this.viewedMonthSubject,
    this.selectedDateSubject,
    this.bookingService.getBookings(),
  ]).pipe(
    map(([viewedMonth, selectedDate, bookings]) =>
      this.buildCalendarDays(viewedMonth, selectedDate, bookings),
    ),
  );

  goToPreviousMonth(): void {
    const previousMonth = new Date(
      this.viewedMonthSubject.value.getFullYear(),
      this.viewedMonthSubject.value.getMonth() - 1,
      1,
    );

    if (this.getMonthKey(previousMonth) < this.getMonthKey(this.startOfMonth(new Date()))) {
      return;
    }

    this.viewedMonthSubject.next(previousMonth);
  }

  goToNextMonth(): void {
    const nextMonth = new Date(
      this.viewedMonthSubject.value.getFullYear(),
      this.viewedMonthSubject.value.getMonth() + 1,
      1,
    );

    this.viewedMonthSubject.next(nextMonth);
  }

  selectDate(day: CalendarDay): void {
    if (!day.isInteractive) {
      return;
    }

    this.dateSelected.emit(day.isoDate);
  }

  trackByDay(index: number, day: CalendarDay): string {
    return day.isoDate || `placeholder-${index}`;
  }

  private buildCalendarDays(viewedMonth: Date, selectedDate: string, bookings: Booking[]): CalendarDay[] {
    const confirmedDates = new Set(
      bookings
        .filter((booking) => booking.status === 'confirmed')
        .map((booking) => booking.date),
    );
    const days: CalendarDay[] = [];
    const firstDayOfMonth = new Date(viewedMonth.getFullYear(), viewedMonth.getMonth(), 1);
    const daysInMonth = new Date(viewedMonth.getFullYear(), viewedMonth.getMonth() + 1, 0).getDate();
    const leadingPlaceholders = this.getMondayBasedDayIndex(firstDayOfMonth);

    for (let index = 0; index < leadingPlaceholders; index += 1) {
      days.push(this.createPlaceholderDay());
    }

    for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber += 1) {
      const date = new Date(viewedMonth.getFullYear(), viewedMonth.getMonth(), dayNumber);
      const isoDate = this.toIsoDate(date);
      const isPast = isoDate < this.todayIso;

      days.push({
        isoDate,
        dayNumber,
        isToday: isoDate === this.todayIso,
        isSelected: isoDate === selectedDate,
        isPast,
        hasConfirmedBooking: confirmedDates.has(isoDate),
        isInteractive: !isPast,
        isPlaceholder: false,
      });
    }

    while (days.length % 7 !== 0) {
      days.push(this.createPlaceholderDay());
    }

    return days;
  }

  private createPlaceholderDay(): CalendarDay {
    return {
      isoDate: '',
      dayNumber: 0,
      isToday: false,
      isSelected: false,
      isPast: true,
      hasConfirmedBooking: false,
      isInteractive: false,
      isPlaceholder: true,
    };
  }

  private startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  private getMonthKey(date: Date): number {
    return date.getFullYear() * 12 + date.getMonth();
  }

  private getMondayBasedDayIndex(date: Date): number {
    return (date.getDay() + 6) % 7;
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
