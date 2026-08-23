import React from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] font-sans antialiased selection:bg-indigo-100 selection:text-[#4F46E5]">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-[#F9FAFB]/90 backdrop-blur-md border-b border-gray-200">
        <nav className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap justify-between items-center gap-4">
          <a href="#" className="font-extrabold text-xl tracking-tight text-[#4F46E5] min-h-[44px] flex items-center">
            Amr Khaled Morcy
          </a>
          <div className="flex flex-wrap gap-4 sm:gap-6 text-sm font-semibold text-gray-700">
            <a href="#about" className="hover:text-[#4F46E5] py-2 px-1 min-h-[44px] flex items-center transition">About</a>
            <a href="#projects" className="hover:text-[#4F46E5] py-2 px-1 min-h-[44px] flex items-center transition">Projects</a>
            <a href="#skills" className="hover:text-[#4F46E5] py-2 px-1 min-h-[44px] flex items-center transition">Skills</a>
            <a href="#contact" className="hover:text-[#4F46E5] py-2 px-1 min-h-[44px] flex items-center transition">Contact</a>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="about" className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="inline-block px-3.5 py-1.5 bg-indigo-100 text-[#4F46E5] rounded-full text-xs sm:text-sm font-bold tracking-wide uppercase mb-6">
          Full-Stack Web Developer & AI Engineering Intern
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#111827] leading-tight tracking-tight mb-6">
          I build thoughtful full-stack web applications that combine strong engineering with exceptional user experience.
        </h1>
        <p className="text-base sm:text-xl text-gray-700 max-w-3xl mb-8 leading-relaxed">
          Computer Science student at Ain Shams University. I build software that solves real problems, prioritizing architectural maintainability, responsive UI design, and effective AI workflows.
        </p>
        <div className="flex flex-col sm:flex-row flex-wrap gap-4">
          <a
            href="https://linkedin.com/in/3mr5aled"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 bg-[#4F46E5] text-white font-semibold rounded-lg hover:bg-indigo-700 transition shadow-sm text-center min-h-[44px] flex items-center justify-center"
          >
            LinkedIn Profile
          </a>
          <a
            href="https://github.com/3mr-5aled"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 bg-white border border-gray-300 text-[#111827] font-semibold rounded-lg hover:bg-gray-50 transition shadow-sm text-center min-h-[44px] flex items-center justify-center"
          >
            GitHub Portfolio
          </a>
          <a
            href="#contact"
            className="w-full sm:w-auto px-6 py-3.5 bg-[#10B981] text-white font-semibold rounded-lg hover:bg-emerald-600 transition shadow-sm text-center min-h-[44px] flex items-center justify-center"
          >
            Send a Message
          </a>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">Featured Case Studies</h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Real-world applications engineered for reliability and user experience.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Case Study 1 */}
          <article className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <span className="text-xs font-extrabold text-[#10B981] uppercase tracking-wider">AI Workflows</span>
              <h3 className="text-xl font-bold mt-2 text-[#111827]">FlyRank AI Internship</h3>
              <p className="text-sm text-gray-700 mt-3 leading-relaxed">
                Built structured prompt templates, evaluated MCP agent architectures, and created automated Evaluator-Optimizer workflows to research, document, and audit complex codebases.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-gray-600">
              <span className="bg-gray-100 px-2.5 py-1 rounded">MCP Protocol</span>
              <span className="bg-gray-100 px-2.5 py-1 rounded">Claude AI</span>
              <span className="bg-gray-100 px-2.5 py-1 rounded">Node.js</span>
            </div>
          </article>

          {/* Case Study 2 */}
          <article className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <span className="text-xs font-extrabold text-[#4F46E5] uppercase tracking-wider">Full-Stack Application</span>
              <h3 className="text-xl font-bold mt-2 text-[#111827]">Salamat Healthcare System</h3>
              <p className="text-sm text-gray-700 mt-3 leading-relaxed">
                Designed multi-role workflows for patients, doctors, and administrators including appointment scheduling, consultation archiving, validation rules, and clinic management.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-gray-600">
              <span className="bg-gray-100 px-2.5 py-1 rounded">React</span>
              <span className="bg-gray-100 px-2.5 py-1 rounded">Node.js</span>
              <span className="bg-gray-100 px-2.5 py-1 rounded">REST API</span>
            </div>
          </article>

          {/* Case Study 3 */}
          <article className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <span className="text-xs font-extrabold text-[#4F46E5] uppercase tracking-wider">Next.js & Supabase</span>
              <h3 className="text-xl font-bold mt-2 text-[#111827]">Home Champion Platform</h3>
              <p className="text-sm text-gray-700 mt-3 leading-relaxed">
                Built a modern home service web application featuring reusable UI components, responsive layout systems, Supabase authentication, and clean state management.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-gray-600">
              <span className="bg-gray-100 px-2.5 py-1 rounded">Next.js</span>
              <span className="bg-gray-100 px-2.5 py-1 rounded">TypeScript</span>
              <span className="bg-gray-100 px-2.5 py-1 rounded">Supabase</span>
            </div>
          </article>

          {/* Case Study 4 */}
          <article className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <span className="text-xs font-extrabold text-[#10B981] uppercase tracking-wider">Backend Architecture</span>
              <h3 className="text-xl font-bold mt-2 text-[#111827]">Hospital Management REST API</h3>
              <p className="text-sm text-gray-700 mt-3 leading-relaxed">
                Engineered a secure healthcare REST API with JWT authentication, role-based access control (RBAC), protected routes, request input validation, and modular backend routing.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-gray-600">
              <span className="bg-gray-100 px-2.5 py-1 rounded">Node.js</span>
              <span className="bg-gray-100 px-2.5 py-1 rounded">Express</span>
              <span className="bg-gray-100 px-2.5 py-1 rounded">JWT</span>
            </div>
          </article>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 border-t border-gray-200">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] mb-6">Technical Skills & Toolkit</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white border border-gray-200 rounded-lg text-center font-bold text-gray-800 text-sm sm:text-base">JavaScript / TypeScript</div>
          <div className="p-4 bg-white border border-gray-200 rounded-lg text-center font-bold text-gray-800 text-sm sm:text-base">React / Next.js</div>
          <div className="p-4 bg-white border border-gray-200 rounded-lg text-center font-bold text-gray-800 text-sm sm:text-base">Tailwind CSS</div>
          <div className="p-4 bg-white border border-gray-200 rounded-lg text-center font-bold text-gray-800 text-sm sm:text-base">Node.js / Express</div>
          <div className="p-4 bg-white border border-gray-200 rounded-lg text-center font-bold text-gray-800 text-sm sm:text-base">REST APIs & JWT</div>
          <div className="p-4 bg-white border border-gray-200 rounded-lg text-center font-bold text-gray-800 text-sm sm:text-base">MongoDB & Supabase</div>
          <div className="p-4 bg-white border border-gray-200 rounded-lg text-center font-bold text-gray-800 text-sm sm:text-base">Model Context Protocol (MCP)</div>
          <div className="p-4 bg-white border border-gray-200 rounded-lg text-center font-bold text-gray-800 text-sm sm:text-base">Git & Vercel/Netlify</div>
        </div>
      </section>

      {/* Dynamic Working Feature: Netlify / Formspree Contact Form */}
      <section id="contact" className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 border-t border-gray-200">
        <div className="max-w-2xl mx-auto bg-white p-6 sm:p-10 border border-gray-200 rounded-2xl shadow-sm">
          <div className="mb-6">
            <span className="text-xs font-extrabold text-[#4F46E5] uppercase tracking-wider">Live Portfolio Feature</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] mt-1">Get in Touch</h2>
            <p className="text-sm sm:text-base text-gray-600 mt-2 leading-relaxed">
              Have a project, internship opportunity, or question? Send a message directly to my inbox using this working contact form.
            </p>
          </div>

          <form
            name="contact"
            method="POST"
            data-netlify="true"
            action="/#contact-success"
            className="flex flex-col gap-4 sm:gap-5"
          >
            {/* Hidden input for Netlify Form detection */}
            <input type="hidden" name="form-name" value="contact" />

            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-1.5">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="e.g. Alex Reed"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent outline-none text-base min-h-[44px]"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-1.5">
                Your Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="alex@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent outline-none text-base min-h-[44px]"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-gray-800 mb-1.5">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                placeholder="What project or opportunity would you like to discuss?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent outline-none text-base"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3.5 bg-[#4F46E5] text-white font-bold text-base rounded-lg hover:bg-indigo-700 transition shadow-sm min-h-[44px] flex items-center justify-center cursor-pointer"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* FlyRank Badge Placeholder */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between flex-wrap gap-4">
          <div>
            <h4 className="font-bold text-[#111827]">FlyRank AI Internship Program</h4>
            <p className="text-sm text-gray-600 mt-1">Official Completion Badge will be displayed here upon capstone approval.</p>
          </div>
          <span className="px-4 py-2 bg-indigo-100 text-[#4F46E5] font-semibold text-xs rounded-lg">
            Verification Pending Capstone
          </span>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200 bg-white py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600">
          <p>© {new Date().getFullYear()} Amr Khaled Morcy. Built with Next.js & Tailwind CSS.</p>
          <div className="flex gap-6 font-medium">
            <a href="https://linkedin.com/in/3mr5aled" target="_blank" rel="noopener noreferrer" className="hover:text-[#4F46E5]">LinkedIn</a>
            <a href="https://github.com/3mr-5aled" target="_blank" rel="noopener noreferrer" className="hover:text-[#4F46E5]">GitHub</a>
            <a href="mailto:3mr5aled.dev@gmail.com" className="hover:text-[#4F46E5]">Email</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
