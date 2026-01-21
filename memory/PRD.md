# The Barbour Connection - Family Tree Reunion App

## Original Problem Statement
Build family tree family reunion app with event calendar page. The background will have an oak tree design. There will be a members profile page and ability to add new member, edit, photo album and bio.

## User Customizations
- **Title**: The Barbour Connection
- **Site Admin**: Samantha Smith
- **Developer**: Derrick Mitchell
- **Theme**: Oak tree/wood textures with warm earthy colors

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Shadcn/UI components
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Authentication**: JWT-based

## Core Features Implemented
- [x] Landing page with oak tree hero background
- [x] User registration and login (JWT auth)
- [x] Dashboard with family overview and stats
- [x] Family Members CRUD (Create, Read, Update, Delete)
- [x] Member profile pages with bio
- [x] Photo album per member (add/delete photos)
- [x] Event Calendar with full CRUD
- [x] Wood texture backgrounds
- [x] Responsive design

## User Personas
1. **Site Admin (Samantha Smith)** - Manages family member data and events
2. **Family Members** - View profiles, photos, and upcoming events

## API Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET/POST /api/members` - List/Create members
- `GET/PUT/DELETE /api/members/{id}` - Get/Update/Delete member
- `POST/DELETE /api/members/{id}/photos` - Add/Delete photos
- `GET/POST /api/events` - List/Create events
- `GET/PUT/DELETE /api/events/{id}` - Get/Update/Delete event

## Key Files
- `/app/backend/server.py` - FastAPI backend
- `/app/frontend/src/pages/` - All React pages
- `/app/frontend/src/components/Layout.js` - Main layout
- `/app/frontend/src/contexts/AuthContext.js` - Auth state

## Prioritized Backlog
### P0 (Completed)
- Core CRUD for members, events, photos
- Authentication
- Calendar functionality

### P1 (Future)
- Family tree visualization diagram
- RSVP for events
- Search across all members

### P2 (Enhancement)
- File upload for photos (instead of URL)
- Email notifications for events
- Invite family members via email

## Date
- Initial Implementation: January 2026
