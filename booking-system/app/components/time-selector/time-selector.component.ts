import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';

import { BookingService } from '../../services/booking.service';

interface TimeSlot {
  time: string;
  isTaken: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'app-time-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './time-selector.component.html',
  styleUrl: './time-selector.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeSelectorComponent {
  @Output() readonly timeSelected = new EventEmitter<string>();

  @Input() set selectedDate(value: string) {
    this.selectedDateSubject.next(value);
  }

  @Input() set selectedTime(value: string | null) {
    this.selectedTimeSubject.next(value ?? '');
  }

  private readonly bookingService = inject(BookingService);
  private readonly selectedDateSubject = new BehaviorSubject<string>('');
  private readonly selectedTimeSubject = new BehaviorSubject<string>('');

  readonly formattedDate$ = this.selectedDateSubject.pipe(
    map((selectedDate) => (selectedDate ? this.formatDate(selectedDate) : '')),
  );

  readonly timeSlots$ = combineLatest([
    this.selectedDateSubject,
    this.selectedTimeSubject,
    this.bookingService.getBookings(),
  ]).pipe(
    map(([selectedDate, selectedTime]) => this.buildTimeSlots(selectedDate, selectedTime)),
  );

  readonly hasAvailableSlots$ = this.timeSlots$.pipe(
    map((timeSlots) => timeSlots.some((timeSlot) => !timeSlot.isTaken)),
  );

  selectTime(timeSlot: TimeSlot): void {
    if (timeSlot.isTaken) {
      return;
    }

    this.timeSelected.emit(timeSlot.time);
  }

  trackByTime(_index: number, timeSlot: TimeSlot): string {
    return timeSlot.time;
  }

  private buildTimeSlots(selectedDate: string, selectedTime: string): TimeSlot[] {
    if (!selectedDate) {
      return [];
    }

    return Array.from({ length: 10 }, (_, index) => {
      const hour = String(index + 9).padStart(2, '0');
      const time = `${hour}:00`;
      const isTaken = this.bookingService.isSlotTaken(selectedDate, time);

      return {
        time,
        isTaken,
        isSelected: selectedTime === time,
      };
    });
  }

  private formatDate(isoDate: string): string {
    const [year, month, day] = isoDate.split('-').map((value) => Number(value));
    const displayDate = new Date(year, month - 1, day);

    return displayDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'long',
      day: 'numeric',
    });
  }
}
