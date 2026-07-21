# Independence Club

Empowering students to become independent learners through interactive classroom models, real-time progress tracking, and engaging educational activities.

## Features

* **10-10-10 Learning Model** - Structured lesson framework that gradually builds student independence
* **Support Ladder System** - Five-step support framework that encourages students to solve problems before requesting teacher assistance
* **Silent Expression Cards** - Green, Yellow, and Red cards that allow students to communicate understanding levels without speaking
* **Beautiful Mistakes Board** - Encourages students to embrace mistakes as learning opportunities
* **Student Dashboard** - Track student participation and engagement across all activities
* **Teacher Analytics** - Monitor student progress and independence development
* **Role-Based Access Control** - Separate experiences for students, teachers, and administrators
* **Real-Time Updates** - Live synchronization of student statistics and activity data
* **Interactive Activities** - Dedicated interactive versions of each educational model
* **Responsive Design** - Optimized for desktop, tablet, and mobile devices

## Educational Models

### 10-10-10 Model

A structured classroom strategy that divides lesson time into three balanced phases, encouraging students to take responsibility for their own learning before seeking assistance.

### Support Ladder

A five-step support process designed to reduce immediate dependence on teachers and promote problem-solving skills.

### Silent Cards

A non-verbal communication system that helps shy or quiet students express their understanding and participation levels.

### Beautiful Mistakes

A classroom culture initiative that celebrates learning through mistakes and transforms errors into opportunities for growth.

## Tech Stack

### Frontend

* Next.js 16 (App Router)
* TypeScript
* React 19
* Framer Motion
* Tailwind CSS
* React Icons

### Backend & Services

* Supabase
* PostgreSQL (via Supabase)
* Supabase Authentication
* Supabase Realtime

### Development Tools

* ESLint
* TypeScript
* PNPM

## Project Structure

```text
Independence-Club/
├── app/
│   ├── (main)/
│   │   ├── home/
│   │   ├── about/
│   │   ├── model-10-10-10/
│   │   ├── support-ladder/
│   │   ├── silent-cards/
│   │   └── beautiful-mistakes/
│   ├── auth/
│   ├── dashboard/
│   └── profile/
├── components/
├── hooks/
├── lib/
├── public/
└── types/
```

## Core Pages

| Route                 | Description                      |
| --------------------- | -------------------------------- |
| `/`                   | Landing page                     |
| `/home`               | Main educational models overview |
| `/about`              | Project vision and objectives    |
| `/model-10-10-10`     | 10-10-10 learning model          |
| `/support-ladder`     | Five-step support ladder         |
| `/silent-cards`       | Silent expression cards          |
| `/beautiful-mistakes` | Beautiful mistakes board         |
| `/dashboard`          | Teacher dashboard and analytics  |
| `/profile`            | User profile                     |
| `/auth/login`         | User login                       |
| `/auth/register`      | User registration                |

## Getting Started

### Install Dependencies

```bash
pnpm install
```

### Run Development Server

```bash
pnpm dev
```

### Build for Production

```bash
pnpm build
```

### Start Production Server

```bash
pnpm start
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Goals

* Increase student independence and self-learning skills
* Reduce direct reliance on teachers
* Encourage participation from quiet students
* Foster a positive learning environment
* Transform mistakes into learning opportunities
* Provide measurable educational insights for teachers

## Developed For

The Independence Club initiative was designed to support modern classroom environments by combining educational methodologies with digital tools to create more confident, engaged, and independent learners.
