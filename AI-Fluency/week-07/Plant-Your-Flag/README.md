# Week 7: Plant Your Flag — Domain, Analytics & Graduate Badge

**Live Domain URL:** [https://3mr5aled.vercel.app](https://3mr5aled.vercel.app)  
**Author:** Amr Morcy (`3mr5aled`)  
**Track:** General AI Fluency — Week 7  

---

## 1. Custom Domain & Security Protocol

* **Domain Address:** `https://3mr5aled.vercel.app`
* **HTTPS / SSL Status:** Active (`TLS v1.3`, Let's Encrypt / Vercel Edge Network SSL Certificate).
* **Domain Type:** Clean free subdomain on Vercel (Production-grade fallback with custom CNAME/A record readiness).

---

## 2. Web Analytics Integration Setup

* **Status:** **INSTALLED & VERIFIED LIVE** (`hasVercelAnalytics: true`).
* **Implementation:** Installed `@vercel/analytics` and attached `<Analytics />` in `app/layout.tsx`.

### Layout Integration (`app/layout.tsx`)
```tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        {/* Vercel Analytics Tracker */}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## 3. Launch Hygiene Verification Checklist

| Hygiene Item | Verification Detail | Result |
| :--- | :--- | :--- |
| **HTTPS / SSL** | Valid SSL Certificate on `https://3mr5aled.vercel.app` | **PASS** |
| **Favicon** | `/favicon.ico` (16x16, 32x32) + Apple Touch Icons (180x180) | **PASS** |
| **Page Title** | `3mr5aled Portfolio - Full-Stack Developer` | **PASS** |
| **Meta Description** | Fully detailed bio & skills description | **PASS** |
| **Social Share Preview (OG)** | `og:image` -> `https://3mr5aled.vercel.app/opengraph-image?a6729975fe648a89` | **PASS** |
| **Twitter Card** | `summary_large_image` with `@3mr5aled` handle | **PASS** |
| **Mobile Responsiveness** | Verified on 375px & 414px mobile viewports | **PASS** |
| **Web Analytics** | Vercel Insights script verified active on live site | **PASS** |

---

## 4. FlyRank Graduate Badge Installation

The FlyRank graduate badge template is ready for footer installation once badge verification link is received.

### Badge Component Code (`components/Footer.tsx`)
```tsx
export function Footer() {
  return (
    <footer className="py-8 border-t border-border bg-background/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Copyright info */}
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} 3mr5aled · Built with Next.js, Tailwind CSS & Framer Motion
        </p>

        {/* FlyRank Graduate Badge */}
        <div className="flex items-center gap-2">
          <a
            href="https://flyrank.ai/verify/3mr5aled"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 transition-all shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>FlyRank Certified AI Graduate</span>
          </a>
        </div>

      </div>
    </footer>
  );
}
```

---

## 5. Final Checklist & Deliverable Confirmation

- [x] HTTPS Live Site URL: `https://3mr5aled.vercel.app`
- [x] Analytics installed and verified live on production build.
- [x] Favicon, Title, Description, and OG Social Previews verified.
- [x] Mobile Viewport verified.
- [x] FlyRank Graduate Badge component code written and ready for final badge URL.
