import React from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] font-sans">
      {/* Navigation */}
      <nav className="w-full max-w-5xl mx-auto px-6 py-6 flex justify-between items-center border-b border-gray-200">
        <div className="font-extrabold text-xl tracking-tight text-[#4F46E5]">
          Amr Khaled Morcy
        </div>
        <div className="flex gap-6 text-sm font-medium text-gray-700">
          <a href="#about" className="hover:text-[#4F46E5] transition">About</a>
          <a href="#projects" className="hover:text-[#4F46E5] transition">Projects</a>
          <a href="#skills" className="hover:text-[#4F46E5] transition">Skills</a>
          <a href="#contact" className="hover:text-[#4F46E5] transition">Contact</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="w-full max-w-5xl mx-auto px-6 py-20">
        <div className="inline-block px-3 py-1 bg-indigo-50 text-[#4F46E5] rounded-full text-xs font-semibold tracking-wide uppercase mb-6">
          Full-Stack Web Developer & AI Engineering Intern
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#111827] leading-tight mb-6">
          I build thoughtful full-stack web applications that combine strong engineering with exceptional user experience.
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mb-8 leading-relaxed">
          Computer Science student at Ain Shams University. I build software that solves real problems, and I care as much about the engineering decisions behind the code as the code itself.
        </p>
        <div className="flex flex-wrap gap-4">
          <a
            href="https://linkedin.com/in/3mr5aled"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-[#4F46E5] text-white font-medium rounded-lg hover:bg-indigo-700 transition shadow-sm"
          >
            LinkedIn Profile
          </a>
          <a
            href="https://github.com/3mr-5aled"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-white border border-gray-300 text-[#111827] font-medium rounded-lg hover:bg-gray-50 transition shadow-sm"
          >
            GitHub Portfolio
          </a>
          <a
            href="mailto:contact@3mr5aled.com"
            className="px-6 py-3 bg-[#10B981] text-white font-medium rounded-lg hover:bg-emerald-600 transition shadow-sm"
          >
            Book a Call / Contact
          </a>
        </div>
      </section>

      {/* Projects / Case Studies */}
      <section id="projects" className="w-full max-w-5xl mx-auto px-6 py-16 border-t border-gray-200">
        <h2 className="text-2xl font-extrabold text-[#111827] mb-8">Featured Case Studies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Case Study 1 */}
          <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition">
            <span className="text-xs font-bold text-[#10B981] uppercase tracking-wider">AI Workflows</span>
            <h3 className="text-xl font-bold mt-2 text-[#111827]">FlyRank AI Internship</h3>
            <p className="text-sm text-gray-600 mt-3 leading-relaxed">
              Built structured prompt templates, evaluated MCP agent architectures, and created automated workflows to research, document, and debug complex applications while keeping human-in-the-loop oversight.
            </p>
            <div className="mt-4 flex gap-2 text-xs font-medium text-gray-500">
              <span className="bg-gray-100 px-2 py-1 rounded">MCP Protocol</span>
              <span className="bg-gray-100 px-2 py-1 rounded">Claude AI</span>
              <span className="bg-gray-100 px-2 py-1 rounded">Prompt Engineering</span>
            </div>
          </div>

          {/* Case Study 2 */}
          <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition">
            <span className="text-xs font-bold text-[#4F46E5] uppercase tracking-wider">Full-Stack Application</span>
            <h3 className="text-xl font-bold mt-2 text-[#111827]">Salamat Healthcare System</h3>
            <p className="text-sm text-gray-600 mt-3 leading-relaxed">
              Designed multi-role workflows for patients, doctors, and administrators including appointment scheduling, clinic management, validation rules, and consultation archiving.
            </p>
            <div className="mt-4 flex gap-2 text-xs font-medium text-gray-500">
              <span className="bg-gray-100 px-2 py-1 rounded">React</span>
              <span className="bg-gray-100 px-2 py-1 rounded">Node.js</span>
              <span className="bg-gray-100 px-2 py-1 rounded">REST API</span>
            </div>
          </div>

          {/* Case Study 3 */}
          <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition">
            <span className="text-xs font-bold text-[#4F46E5] uppercase tracking-wider">Next.js & Supabase</span>
            <h3 className="text-xl font-bold mt-2 text-[#111827]">Home Champion Platform</h3>
            <p className="text-sm text-gray-600 mt-3 leading-relaxed">
              Built a modern home service platform focusing on reusable UI components, responsive design, authentication, and clean state management using Next.js and Supabase.
            </p>
            <div className="mt-4 flex gap-2 text-xs font-medium text-gray-500">
              <span className="bg-gray-100 px-2 py-1 rounded">Next.js</span>
              <span className="bg-gray-100 px-2 py-1 rounded">TypeScript</span>
              <span className="bg-gray-100 px-2 py-1 rounded">Supabase</span>
            </div>
          </div>

          {/* Case Study 4 */}
          <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition">
            <span className="text-xs font-bold text-[#10B981] uppercase tracking-wider">Backend Architecture</span>
            <h3 className="text-xl font-bold mt-2 text-[#111827]">Hospital Management REST API</h3>
            <p className="text-sm text-gray-600 mt-3 leading-relaxed">
              Engineered a secure hospital API with JWT authentication, role-based access control (RBAC), protected routes, request validation, and modular architecture.
            </p>
            <div className="mt-4 flex gap-2 text-xs font-medium text-gray-500">
              <span className="bg-gray-100 px-2 py-1 rounded">Node.js</span>
              <span className="bg-gray-100 px-2 py-1 rounded">Express</span>
              <span className="bg-gray-100 px-2 py-1 rounded">JWT</span>
            </div>
          </div>
        </div>
      </section>

      {/* FlyRank Badge Placeholder */}
      <section className="w-full max-w-5xl mx-auto px-6 py-12">
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
      <footer id="contact" className="w-full border-t border-gray-200 bg-white py-12">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Amr Khaled Morcy. Built with Next.js & Tailwind CSS.</p>
          <div className="flex gap-6">
            <a href="https://linkedin.com/in/3mr5aled" className="hover:text-[#4F46E5]">LinkedIn</a>
            <a href="https://github.com/3mr-5aled" className="hover:text-[#4F46E5]">GitHub</a>
            <a href="mailto:contact@3mr5aled.com" className="hover:text-[#4F46E5]">Email</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
