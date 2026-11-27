import React from "react";
import { Outlet } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";

const AdminLayout = () => {
  return (
    <div className="al-root min-h-screen bg-black text-white">
      <style>{`
        .al-root {
          /* page scale: same breakpoints and edges as the navbar */
          --al-max: 1400px;
          --al-px: 0.875rem;
          --al-py: 1rem;
          --al-gap: 0.75rem;        /* gap between cards, sections, grid items */
          --al-card-pad: 0.875rem;  /* inner padding of cards and panels */
          --al-radius: 0.75rem;
          --al-title: 1.25rem;      /* page title size */
          --al-text: 0.85rem;       /* body and table text */
          --al-ctl: 2.5rem;         /* input and button height */

          min-height: 100vh;
          min-height: 100dvh;
          font-family: 'Manrope', 'Inter', system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          overflow-x: clip;
        }

        .al-main {
          width: 100%;
          max-width: var(--al-max);
          margin: 0 auto;
          min-width: 0;
          padding:
            var(--al-py)
            max(var(--al-px), env(safe-area-inset-right))
            max(var(--al-py), env(safe-area-inset-bottom))
            max(var(--al-px), env(safe-area-inset-left));
        }

        /* stops wide children (tables, grids) from forcing sideways scroll */
        .al-main > * { min-width: 0; }

        @media (min-width: 400px) {
          .al-root { --al-px: 1rem; --al-card-pad: 1rem; --al-text: 0.875rem; }
        }
        @media (min-width: 480px) {
          .al-root { --al-py: 1.125rem; --al-title: 1.4rem; }
        }
        @media (min-width: 640px) {
          .al-root {
            --al-px: 1.5rem; --al-py: 1.5rem; --al-gap: 1rem;
            --al-card-pad: 1.125rem; --al-title: 1.6rem;
          }
        }
        @media (min-width: 768px) {
          .al-root { --al-ctl: 2.6rem; --al-radius: 0.875rem; }
        }
        @media (min-width: 1024px) {
          .al-root {
            --al-px: 2rem; --al-py: 1.75rem; --al-gap: 1.25rem;
            --al-card-pad: 1.25rem; --al-title: 1.8rem; --al-text: 0.9rem;
          }
        }
        @media (min-width: 1280px) {
          .al-root { --al-py: 2rem; --al-gap: 1.5rem; --al-card-pad: 1.5rem; --al-title: 2rem; }
        }
        @media (min-width: 1536px) {
          .al-root {
            --al-max: 1680px; --al-px: 2.5rem; --al-py: 2.25rem;
            --al-gap: 1.75rem; --al-card-pad: 1.75rem; --al-title: 2.15rem;
            --al-text: 0.95rem; --al-ctl: 2.75rem;
          }
        }
        @media (min-width: 1920px) {
          .al-root { --al-max: 1840px; --al-text: 1rem; }
        }
      `}</style>

      <AdminNavbar />

      <main className="al-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;