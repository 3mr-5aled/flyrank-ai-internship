# Three Roads: Choose Your Stack with AI

## My Constraints

### 1. Budget

- Free tools only.
- Free hosting and deployment.

### 2. Current Skill Level

I am comfortable with HTML, CSS, JavaScript, TypeScript, React, Next.js, Tailwind CSS, Git, and basic backend development with Node.js and Express. I am still improving my backend skills, so I prefer minimizing unnecessary complexity.

### 3. What My Portfolio Needs

My portfolio should include:

- Hero section introducing me
- About section
- Skills
- Featured Projects
- Project case studies
- Live demo links
- GitHub repository links
- Image galleries/screenshots
- Contact section
- Resume download

Content includes:

- Project descriptions
- Technologies used
- Challenges and solutions
- Screenshots
- Demo videos or embedded demos where applicable
- Links to GitHub repositories
- External links to deployed projects

### 4. How My Work Must Be Displayed

The portfolio should support:

- Image galleries
- Embedded live demos when possible
- GitHub repository links
- Long-form project write-ups
- Responsive design for desktop and mobile

### Dynamic Requirements

At this stage, nothing needs to be dynamic. I do not need authentication, dashboards, databases, or a CMS. Static content is sufficient and easier to maintain.

---

# Three Stack Options

## Option 1 — Static Next.js Portfolio (Simplest)

### Stack

- Next.js
- Tailwind CSS
- Markdown/JSON for project data

### Hosting

- Vercel (Free)

### Backend

No backend required.

### Advantages

- Fast development
- Excellent SEO
- Very low maintenance
- Free deployment
- Easy to update

### Trade-offs

- Content updates require redeployment.
- No admin dashboard.
- Limited dynamic functionality.

---

## Option 2 — Next.js + Headless CMS

### Stack

- Next.js
- Tailwind CSS
- Sanity or Contentful Free Tier

### Hosting

- Vercel (Frontend)
- Free CMS hosting

### Backend

No custom backend is needed because the CMS provides content management.

### Advantages

- Easy content editing
- No code changes for adding projects
- Better for frequent updates

### Trade-offs

- More setup
- Additional service to maintain
- Slightly higher complexity

---

## Option 3 — Full MERN Portfolio (Most Powerful)

### Stack

- Next.js
- Express.js
- MongoDB
- Node.js
- Tailwind CSS

### Hosting

- Vercel (Frontend)
- Render or Railway (Backend)
- MongoDB Atlas Free Tier

### Backend

Yes.

### Advantages

- Dynamic content
- Authentication
- Admin dashboard
- Database-driven projects
- Easily expandable

### Trade-offs

- Highest complexity
- More deployment steps
- More maintenance
- Longer development time

---

# Pressure Testing My Front-Runner

### What breaks if I choose the simplest option?

Very little. The only limitation is that adding or editing projects requires updating the code and redeploying the site. Since I do not update my portfolio daily, this is acceptable.

### What must I maintain if I choose the most powerful option?

I would need to maintain the frontend, backend, database, authentication, APIs, hosting, and deployment pipeline. That increases both development time and maintenance effort.

### Can I finish it in two weeks?

Yes.

The static Next.js portfolio is realistic to complete in under two weeks while maintaining high quality. The full MERN version would likely take significantly longer.

### Does it display my work properly?

Yes.

A static Next.js portfolio fully supports:

- Project galleries
- Case studies
- Embedded demos
- GitHub repositories
- Responsive layouts
- Resume download
- Contact information

I do not currently need dynamic functionality to showcase my work effectively.

---

# Final Decision

I chose **Next.js + Tailwind CSS with Vercel hosting**.

I considered both a Headless CMS solution and a full MERN stack, but they introduce additional complexity that my portfolio does not currently require. Since the website mainly showcases projects rather than managing user data, a backend would provide little practical value today.

This solution is completely free, matches my current skill set, can be finished within the assignment timeline, and presents my work professionally through image galleries, embedded demos, project write-ups, and GitHub links.

Most importantly, **I can maintain this stack easily.** Future updates only require editing project data and redeploying the site, making it sustainable while I continue improving my backend skills. If my portfolio later needs features such as an admin dashboard or dynamic content management, I can extend it incrementally instead of starting with unnecessary complexity.
