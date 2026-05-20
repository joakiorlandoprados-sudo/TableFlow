import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './booking-form.component.html',
  styleUrl: './booking-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingFormComponent implements OnChanges {
  @Input() date = '';
  @Input() time = '';

  @Output() readonly bookingConfirmed = new EventEmitter<void>();

  readonly bookingForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });

  hasSubmitted = false;
  successMessage = '';
  submissionError = '';

  constructor(private readonly bookingService: BookingService) {}

  ngOnChanges(): void {
    this.successMessage = '';
    this.submissionError = '';
    this.hasSubmitted = false;
  }

  get nameControl(): FormControl<string> {
    return this.bookingForm.controls.name;
  }

  get emailControl(): FormControl<string> {
    return this.bookingForm.controls.email;
  }

  submitBooking(): void {
    this.hasSubmitted = true;
    this.successMessage = '';
    this.submissionError = '';

    if (!this.date || !this.time) {
      this.submissionError = 'Please choose a date and time before submitting the form.';
      return;
    }

    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    if (this.bookingService.isSlotTaken(this.date, this.time)) {
      this.submissionError = 'This time slot was just booked. Please choose another option.';
      return;
    }

    const formValue = this.bookingForm.getRawValue();

    this.bookingService.addBooking({
      date: this.date,
      time: this.time,
      name: formValue.name.trim(),
      email: formValue.email.trim().toLowerCase(),
    });

    this.successMessage = `Appointment confirmed for ${this.formatDate(this.date)} at ${this.time}.`;
    this.bookingForm.reset({
      name: '',
      email: '',
    });
    this.hasSubmitted = false;
    this.bookingConfirmed.emit();
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
