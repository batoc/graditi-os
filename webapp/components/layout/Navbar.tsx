'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3">
              <img 
                src="https://graditi.com.co/wp-content/uploads/2023/10/Recurso-26.png" 
                alt="Graditi Group" 
                className="h-12 w-auto object-contain"
              />
              <span className="text-lg font-bold text-gray-900">Control de Inventario</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/" active={pathname === '/'}>
              <HomeIcon />
              Dashboard
            </NavLink>
            <NavLink href="/inventario" active={isActive('/inventario')}>
              <ArchiveIcon />
              Inventario
            </NavLink>
            <NavLink href="/prestamos" active={isActive('/prestamos')}>
              <TruckIcon />
              Préstamos
            </NavLink>
            <NavLink href="/colaboradores" active={isActive('/colaboradores')}>
              <UsersIcon />
              Colaboradores
            </NavLink>
            <NavLink href="/obras" active={isActive('/obras')}>
              <BuildingIcon />
              Obras
            </NavLink>
            <NavLink href="/scanner" active={isActive('/scanner')}>
              <QRIcon />
              Escáner
            </NavLink>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
              <BellIcon />
            </button>
            <div className="w-9 h-9 bg-red-800 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              AD
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200 bg-white">
        <div className="grid grid-cols-4 gap-1 p-2">
          <MobileNavLink href="/" active={pathname === '/'}>
            <HomeIcon />
            <span>Inicio</span>
          </MobileNavLink>
          <MobileNavLink href="/inventario" active={isActive('/inventario')}>
            <ArchiveIcon />
            <span>Inventario</span>
          </MobileNavLink>
          <MobileNavLink href="/movimientos" active={isActive('/movimientos')}>
            <TruckIcon />
            <span>Movimientos</span>
          </MobileNavLink>
          <MobileNavLink href="/scanner" active={isActive('/scanner')}>
            <QRIcon />
            <span>Escáner</span>
          </MobileNavLink>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
        active
          ? 'bg-red-50 text-red-800'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-xs font-medium transition ${
        active
          ? 'bg-red-50 text-red-800'
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      {children}
    </Link>
  );
}

// Icons
const HomeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const ArchiveIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
  </svg>
);

const TruckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const QRIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const BuildingIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const BellIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);
