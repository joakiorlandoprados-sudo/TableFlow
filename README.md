# TableFlow

TableFlow is a polished appointment booking system built as an Angular portfolio project. It demonstrates a complete scheduling flow with reactive UI updates, clear separation of concerns, and browser-based persistence through LocalStorage.

The project is intentionally structured to feel production-minded while staying approachable for a junior-to-mid developer code review.

## Tech Stack

- Angular 21 with standalone components
- TypeScript
- CSS
- RxJS
- LocalStorage

## Run Locally

1. Install dependencies with `npm install`
2. Start the development server with `ng serve`
3. Open `http://localhost:4200/`

## Features

- Monthly calendar with future-date selection
- Real-time time-slot availability for each selected day
- Reactive booking flow powered by a LocalStorage-backed service
- Booking list with cancellation support instead of destructive deletion
- Optional visibility for cancelled appointments
- Responsive, accessible UI with visible focus states

## Notes

LocalStorage will be replaced by REST API in v2.

## Folder Structure

```text
booking-system/
├── index.html
├── styles.css
├── main.ts
└── app/
    ├── app.component.ts
    ├── app.component.html
    ├── app.component.css
    ├── models/
    │   └── booking.model.ts
    ├── services/
    │   └── booking.service.ts
    └── components/
        ├── calendar/
        ├── time-selector/
        ├── booking-form/
        └── booking-list/
```

- `booking-system/main.ts` bootstraps the standalone Angular application.
- `booking-system/app/services` contains the LocalStorage-backed booking state.
- `booking-system/app/models` defines the booking domain model.
- `booking-system/app/components` contains focused UI pieces for each booking step.
- `booking-system/app/app.component.*` coordinates the overall user flow.
