import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BookingFormComponent } from './components/booking-form/booking-form.component';
import { BookingListComponent } from './components/booking-list/booking-list.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { TimeSelectorComponent } from './components/time-selector/time-selector.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    CalendarComponent,
    TimeSelectorComponent,
    BookingFormComponent,
    BookingListComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  selectedDate = '';
  selectedTime = '';
  confirmationMessage = '';

  handleDateSelected(date: string): void {
    this.selectedDate = date;
    this.selectedTime = '';
    this.confirmationMessage = '';
  }

  handleTimeSelected(time: string): void {
    this.selectedTime = time;
    this.confirmationMessage = '';
  }

  handleBookingConfirmed(): void {
    this.confirmationMessage = `Appointment confirmed for ${this.formatDate(this.selectedDate)} at ${this.selectedTime}.`;
    this.selectedDate = '';
    this.selectedTime = '';
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
