# TA Scheduler - Development Guide

## Project Overview
TA scheduling app for Tufts CS department. Frontend built with Vite + React + Tailwind CSS. Backend handled separately.

## Tech Stack
- **Vite 7.3.1** + **React 19.2** + **Tailwind CSS v4** (via `@tailwindcss/vite` plugin)
- **React Router DOM** for client-side routing
- **React Context** (`AuthContext` + `ScheduleContext`) for state management
- Desktop only (1440px+ target)

## Quick Start
```bash
npm install
npm run dev    # Start dev server at http://localhost:5173
npm run build  # Production build
```

## Project Structure
```
src/frontend/
  main.jsx                          # Entry: BrowserRouter + AuthProvider + ScheduleProvider
  App.jsx                           # Route definitions (9 routes)
  index.css                         # Tailwind import + custom theme colors

  contexts/
    AuthContext.jsx                  # User role, utln, name, classCode, isAuthenticated
    ScheduleContext.jsx              # Availability grid, schedule, config, templateSlots

  services/
    api.js                          # All API stubs (TODO comments for backend team)

  components/
    layout/
      LoginLayout.jsx               # Split screen: green gradient left + white right
      AppLayout.jsx                 # Sidebar + main panel for post-login pages
      Sidebar.jsx                   # Green sidebar shell with logo
    shared/
      Logo.jsx                      # App logo
      Button.jsx                    # Primary/secondary/outline/green variants + loading
      RoleToggle.jsx                # Two-option toggle (Preferred/General, OH/Lab)
      EmojiCodeInput.jsx            # 5-slot + 9-emoji-button code input
      ScheduleGrid.jsx              # When2meet grid (4 modes: builder, ta-viewer, tf-config, tf-viewer)
      ShiftCard.jsx                 # Shift card for sidebar lists
      ChipInput.jsx                 # Tag/chip input for TF utln list
      TimeSlotTooltip.jsx           # Hover tooltip for grid cells

  pages/
    login/
      LoginRolePicker.jsx           # /          - Role selection (TA or TF)
      TAJoin.jsx                    # /login/ta  - TA utln + emoji code
      TFChoice.jsx                  # /login/tf  - TF create or enter code
      TFGenerate.jsx                # /login/tf/generate - Generated emoji code display
      TFJoin.jsx                    # /login/tf/join - TF utln + emoji code
    ta/
      ScheduleBuilder.jsx           # /builder   - TA availability grid + form
      TAViewer.jsx                  # /viewer    - TA read-only schedule view
    tf/
      ScheduleConfig.jsx            # /config    - TF schedule configuration
      TFViewer.jsx                  # /tf/viewer - TF schedule view + management
```

## Routes
| Path | Component | Description |
|------|-----------|-------------|
| `/` | LoginRolePicker | Landing page - pick TA or TF |
| `/login/ta` | TAJoin | TA enters utln + emoji code |
| `/login/tf` | TFChoice | TF picks create or join class |
| `/login/tf/generate` | TFGenerate | Shows generated class code |
| `/login/tf/join` | TFJoin | TF enters utln + emoji code |
| `/builder` | ScheduleBuilder | TA sets availability (when2meet grid) |
| `/viewer` | TAViewer | TA views their schedule |
| `/config` | ScheduleConfig | TF configures schedule parameters |
| `/tf/viewer` | TFViewer | TF views/manages full schedule |

## Key Design Decisions
- **Emoji codes**: 5 emojis from a set of 9, mapping to digits 1-9. Set defined in `EmojiCodeInput.jsx`.
- **Availability grid**: Click cycles `empty -> preferred -> general -> empty`. Mon-Sun columns, 30-min default slots.
- **Preferred vs General**: Two-tier availability. Backend uses these for auto-scheduling; TF never sees raw availability.
- **OH/Lab toggles**: Switches editing mode on config page; filters view on viewer pages.
- **Single ScheduleGrid component**: 4 modes (`builder`, `ta-viewer`, `tf-config`, `tf-viewer`) controlled via `mode` prop.
- **API stubs**: All API calls in `services/api.js` return empty `{}` after 500ms. Every function has TODO comments describing expected request/response shapes.

## Backend Integration Guide
All API functions live in `src/frontend/services/api.js`. Each function has:
- A descriptive comment with the expected HTTP method and endpoint
- Parameter descriptions
- Expected response shape

To connect to the real backend, replace the `setTimeout` stubs with actual `fetch()` calls. The function signatures and return types should stay the same.

### API Functions
- `loginTA(utln, classCode)` - TA authentication
- `loginTF(utln, classCode)` - TF authentication
- `generateClassCode()` - Generate new class emoji code
- `submitAvailability(utln, availability, preferences)` - Submit TA availability
- `getTASchedule(utln)` - Fetch TA's schedule
- `generateTemplate(config)` - Generate schedule template from TF config
- `publishSchedule(templateSlots)` - Publish finalized schedule
- `getTFSchedule()` - Fetch full schedule for TF view

## Custom Tailwind Colors
Defined in `src/frontend/index.css` under `@theme`:
- `mint-*` (50-600): Green gradient for sidebars/backgrounds
- `preferred`: Blue for preferred availability
- `general`: Violet for general availability
- `oh-shift`: Green for office hours shifts
- `lab-shift`: Orange for lab shifts
- `other-shift`: Gray for other shifts

## TODOs
- [ ] Replace placeholder illustration in `LoginLayout.jsx` with actual design asset
- [ ] Confirm exact 9-emoji set (currently using approximation from Figma)
- [ ] Implement "Copy as Text" format (stub in `api.js`)
- [ ] Connect all API stubs to real backend endpoints
- [ ] Populate viewer grids with real schedule data from backend responses
