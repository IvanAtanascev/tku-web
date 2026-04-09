# TKU

TKU is a full-stack flashcard application designed to help users learn and retain information using spaced repetition principles.

It is currently focused on language learning and features typing practice

**Note:** This project is currently a Work In Progress (WIP).

## Tech Stack

**Frontend**
* React (Vite)
* TypeScript

**Backend**
* Fastify
* TypeScript
* SQLite (plans to add PostgreSQL support)
* Prisma
* **Validation:** Zod (via `fastify-type-provider-zod`)
* **Authentication:** JWT + Secure `HttpOnly` Cookies (`@fastify/jwt`, `@fastify/cookie`)

## Current Features
* **Secure Authentication:** User signup, login, and logout using `HttpOnly` cookies
* **Deck Management:** Create, read, and manage custom flashcard decks.
* **Favorites System:** Easily toggle favorite status on decks using many-to-many database relations.
* **Flashcard Editor:** Add, update, and describe individual flashcards within decks.
* **Smart Study Mode:** Dynamically fetches flashcards based on spaced repetition limits, pulling due cards first and backfilling with uninitialized new cards.
* **Paginated APIs:** Efficient data fetching with built-in pagination for decks and cards.

---

## TODO

* finish backend (almost done)
* finish frontend (currently only basic for the development of backend)
* documentation
