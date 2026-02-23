import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { 
  LayoutDashboard, Building2, Calendar, FileText, 
  Users, Settings, ChevronRight 
} from 'lucide-react';
import { auth } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  robots: { index: false, follow: false },
};

const adminNavItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/submissions', label: 'Club Submissions', icon: Building2 },
  { href: '/admin/clubs', label: 'Manage Clubs', icon: Building2 },
  { href: '/admin/events', label: 'Events', icon: Calendar },
  { href: '/admin/blog', label: 'Blog Posts', icon: FileText },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication and admin role
  const session = await auth();

  if (!session?.user) {
    redirect('/api/auth/signin?callbackUrl=/admin');
  }

  // Check for admin or moderator role
  const userRole = (session.user as { role?: string }).role;
  if (!userRole || !['ADMIN', 'MODERATOR'].includes(userRole)) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              ← Back to Site
            </Link>
            <span className="text-muted-foreground">/</span>
            <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {session.user.email}
            </span>
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
              {session.user.name?.[0]?.toUpperCase() || 'A'}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="p-4 space-y-1">
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <item.icon className="h-5 w-5 mr-3 text-gray-400" />
                {item.label}
                <ChevronRight className="h-4 w-4 ml-auto text-gray-300" />
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
