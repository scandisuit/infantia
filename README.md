# Infantia

> Privacy-first child health tracker — self-hostable, GDPR-compliant.

Track your children's health data in one place: birth metrics, vaccines,
childhood diseases, and daycare/school injury logs. Web + iOS/Android.

## Features (MVP)

- 📏 Birth metrics (weight, height, head circumference)
- 💉 Vaccine tracking (type, date, reminders)
- 🦠 Childhood disease logging (measles, chickenpox, etc.)
- 🩹 Injury/incident tracking (daycare, preschool, school)
- 🔒 End-to-end encryption, GDPR-compliant consent & data export
- 🏠 Self-hostable via Docker

## Tech Stack

- **Backend**: FastAPI + PostgreSQL + SQLAlchemy
- **Mobile**: React Native (iOS/Android)
- **Web**: React
- **Self-hosting**: Docker Compose

## Quick Start

```bash
# Backend
pip install -r requirements.txt
uvicorn infantia.main:app --reload --port 8001

# Docker
docker-compose up -d
```

## Project Status

🚧 **In Progress** — Approved by AI Knowledge Council, core prototype underway.

## License

Proprietary — Scandisuit ApS
