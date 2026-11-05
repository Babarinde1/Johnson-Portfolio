# Johnson Pedia — Personal Portfolio

<p align="center">
  <strong>A digital space for engineering, artificial intelligence, and innovation.</strong>
</p>

<p align="center">
  A modern, interactive portfolio showcasing my work in AI/ML engineering, software development, and African language technology.
</p>

---

## Overview

**Johnson Pedia** is my personal developer portfolio, designed to showcase my technical expertise, engineering projects, professional experience, and ongoing work in artificial intelligence and machine learning.

More than a traditional portfolio website, it is a full-stack application featuring a dynamic project management system, private administrative dashboard, content management capabilities, and an interactive user experience.

The platform combines modern frontend engineering, backend integration, database security, and motion design to create a responsive and engaging digital presence.

## Features

### Public Portfolio

- **Interactive Homepage:** Modern hero section with animated backgrounds, interactive particle effects, and smooth motion.
- **Project Showcase:** Dynamic project gallery with individual project pages and detailed case studies.
- **About Page:** Professional background, technical interests, and experience.
- **Skills Section:** Animated skill indicators and technology categories.
- **Resume Integration:** Upload and download a PDF resume.
- **Contact Form:** Allows visitors to send messages directly through the website.
- **Responsive Design:** Optimized layouts for desktop, tablet, and mobile devices.
- **Motion Design:** Animated transitions, interactive elements, ambient lighting, and hover effects.
- **SEO Support:** Search engine metadata, sitemap, and structured page information.

### Administrative Dashboard

A private admin interface provides control over portfolio content without requiring direct database edits.

Capabilities include:

- Create, edit, publish, and archive projects.
- Upload project images.
- Manage project descriptions and technology stacks.
- Manage homepage and About page content.
- Update skills and proficiency indicators.
- Upload and replace the resume PDF.
- Manage contact messages.
- Read and delete received messages.
- View basic website analytics.

### Interactive Visual Experience

The portfolio uses an immersive technology-inspired visual direction, including:

- Interactive particle effects responding to mouse movement and direction.
- Animated gradients and ambient lighting.
- Futuristic grid-inspired backgrounds.
- Glass-inspired interface elements.
- Smooth page transitions and micro-interactions.
- Accessibility-conscious reduced-motion support.

## Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, TypeScript |
| Build Tool | Vite |
| Styling | CSS |
| Motion | Motion / Framer Motion |
| Backend Services | Supabase |
| Database | PostgreSQL |
| Authentication | Supabase Auth |
| File Storage | Supabase Storage |
| Icons | Lucide React |
| Deployment | Netlify / compatible static hosting |

## Architecture

The application follows a frontend-and-backend-services architecture.

```text
                    VISITOR
                       |
                       v
              REACT PORTFOLIO
                       |
          +------------+------------+
          |            |            |
          v            v            v
      Homepage      Projects      Contact
          |            |            |
          +------------+------------+
                       |
                       v
                   SUPABASE
                       |
          +------------+------------+
          |            |            |
          v            v            v
       Database   Authentication   Storage
          |            |            |
          v            v            v
      Projects      Admin Users   Images/Resume
      Messages
      Site Content
      Analytics
```

The public website retrieves published content, while authenticated administrative operations are protected through Supabase authentication and database access policies.

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js (LTS recommended)
- npm
- Git
- A Supabase account

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/johnson-pedia-portfolio.git
```

### 2. Navigate into the project

```bash
cd johnson-pedia-portfolio
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the project root.

Use the environment variable names expected by your project's Supabase client configuration. For example:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_or_anon_key
```

Use the actual variable names referenced in the source code if they differ.

**Security note:** Never expose a Supabase service-role key, database password, or other private credentials in frontend environment variables or GitHub.

### 5. Configure Supabase

Create a Supabase project and configure:

- PostgreSQL database tables.
- Row Level Security (RLS) policies.
- Authentication for the administrator.
- Storage buckets and access policies.
- Project content and contact message permissions.

Apply the SQL migrations included in the repository in their documented order. Check the migration instructions before running them, and do not rerun migrations that have already been applied unless they are explicitly safe to repeat.

Create the administrator account through Supabase Authentication. Public administrator registration should remain disabled.

### 6. Start the development server

```bash
npm run dev
```

Open the local URL printed in your terminal.

### 7. Build for production

```bash
npm run build
```

If the project includes the corresponding scripts, run:

```bash
npm run typecheck
npm run security-check
npm run launch-check
```

## Project Structure

The exact directory names may evolve as the application develops. The project is organized around the following responsibilities:

```text
johnson-pedia-portfolio/
│
├── public/
│   ├── images/
│   └── assets/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── admin/
│   ├── hooks/
│   ├── services/
│   ├── styles/
│   ├── lib/
│   └── assets/
│
├── supabase/
│   └── migrations/
│
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Featured Projects

The portfolio showcases projects across artificial intelligence, natural language processing, and software engineering.

### Odùduwà AI

An African language AI platform focused on Yorùbá conversational AI, tone-mark restoration, and Yorùbá–English translation.

### READLY AI

An AI-powered document interaction application designed to make information retrieval and document understanding more accessible through retrieval-augmented generation.

### Automated OMR Evaluation System

A web-based automated optical mark recognition evaluation system combining object detection and image processing techniques.

### Yorùbá Tone Restoration

A natural language processing project focused on restoring missing tone marks and diacritics in Yorùbá text.

### Jarvis — Windows Voice Assistant

A Windows voice assistant architecture combining local speech recognition, wake-word detection, desktop commands, and AI-powered conversational fallback.

## Security

Security is an important part of the application architecture.

The project incorporates:

- Supabase Authentication for administrative access.
- PostgreSQL Row Level Security.
- Restricted administrative database operations.
- Protected contact message management.
- Supabase Storage access policies.
- Environment-based configuration.
- Contact form validation and spam prevention measures.

**Important:** The admin route being hidden or difficult to discover is not a security boundary. Authorization must be enforced through Supabase policies and appropriate backend controls.

Never commit:

- `.env` files containing credentials.
- Supabase service-role keys.
- Database passwords.
- Private datasets or personal records.
- Authentication tokens.

## Deployment

The application can be deployed using Netlify or another hosting provider that supports Vite applications.

General deployment process:

1. Push the project to GitHub.
2. Connect the repository to your hosting provider.
3. Configure the required environment variables.
4. Set the build command to `npm run build`.
5. Set the publish directory to `dist`.
6. Configure SPA routing and redirects.
7. Configure the production website URL and Supabase authentication settings.
8. Test public pages, administrator access, uploads, and contact submissions.

Review the deployment configuration and production checklist before publishing.

## Roadmap

The project will continue to evolve through improvements such as:

- Further performance optimization.
- Stronger server-side contact form protection.
- Improved analytics and reporting.
- Enhanced accessibility.
- More advanced project case studies.
- Additional interactive experiences.
- Continued security and deployment improvements.

## Author

**Babarinde Johnson Omotayo (Johnson Pedia)**

AI/ML Developer | Software Engineer | African Language Technology Enthusiast

- **Portfolio:** [Add your deployed portfolio URL]
- **LinkedIn:** [Babarinde Johnson](https://www.linkedin.com/in/babarinde-johnson-152371234)
- **GitHub:** [Babarinde1](https://github.com/Babarinde1)

## License

This project is maintained as a personal portfolio and software showcase.

Unless otherwise specified in a separate license file, all rights to original content, branding, and personal assets are reserved by the author.

---

<p align="center">
  <strong>Building intelligent systems. Engineering meaningful experiences.</strong>
  <br />
  <em>Johnson Pedia — Intelligence, creativity, and innovation.</em>
</p>
