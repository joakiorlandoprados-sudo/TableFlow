# TableFlow

TableFlow is a polished appointment booking system built as an Angular portfolio project. It demonstrates a complete scheduling flow with reactive UI updates, clear separation of concerns, and browser-based persistence through LocalStorage.

The project is intentionally structured to feel production-minded while staying approachable for a junior-to-mid developer code review.

🔗 **Live demo:** [tableflow-booking-system.netlify.app](https://tableflow-booking-system.netlify.app)  
📁 **Repository:** [github.com/joakiorlandoprados-sudo/TableFlow.git](https://github.com/joakiorlandoprados-sudo/TableFlow.git)

---

## Tech Stack

- Angular 17+ with standalone components
- TypeScript
- CSS (no frameworks)
- RxJS
- LocalStorage (REST API in v2)

---

## Run Locally

**Requirements:** Node.js 18+, Angular CLI 17+

```bash
git clone https://github.com/joakiorlandoprados-sudo/tableflow-booking-system.git
cd tableflow-booking-system
npm install
ng serve
```

Open `http://localhost:4200/`

---

## Features

- Monthly calendar with future-date selection and month navigation
- Real-time time-slot availability — taken slots are blocked and visually disabled
- Booking form with inline validation (name + email)
- Reactive booking list powered by a LocalStorage-backed service
- Cancellation support — records are soft-deleted, not removed
- Toggle to show/hide cancelled appointments
- Responsive, accessible UI with visible focus states

---

## Folder Structure

```
src/app/
├── models/
│   └── booking.model.ts        # Booking interface + types
├── services/
│   └── booking.service.ts      # State management + LocalStorage
└── components/
    ├── calendar/                # Monthly calendar with date selection
    ├── time-selector/           # Slot availability per selected date
    ├── booking-form/            # Form with validation
    └── booking-list/            # List, cancellation, toggle
```

---

## Roadmap

- [ ] Replace LocalStorage with Node.js + Express REST API
- [ ] Add MongoDB persistence layer
- [ ] Admin panel for managing all bookings

---

## Author

**Joaquin Prados**  
Web Developer — Valencia, Spain  
[GitHub](https://github.com/joakiorlandoprados-sudo)
