import Link from 'next/link';
import { 
  Building2, Calendar, FileText, Users, 
  TrendingUp, Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// TODO: Replace with actual database queries when Prisma is set up
async function getDashboardStats() {
  // Mock data for development
  return {
    totalClubs: 0,
    pendingSubmissions: 0,
    activeEvents: 0,
    totalUsers: 0,
    recentSubmissions: [] as Array<{
      id: string;
      clubName: string;
      status: string;
      submittedAt: Date;
      submitterEmail: string;
    }>,
    recentClubs: [] as Array<{
      id: string;
      name: string;
      createdAt: Date;
      country: { flagEmoji: string; code: string };
    }>,
  };
}

const statCards = [
  { 
    title: 'Total Clubs', 
    key: 'totalClubs' as const,
    icon: Building2, 
    href: '/admin/clubs',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  { 
    title: 'Pending Submissions', 
    key: 'pendingSubmissions' as const,
    icon: Clock, 
    href: '/admin/submissions',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  { 
    title: 'Active Events', 
    key: 'activeEvents' as const,
    icon: Calendar, 
    href: '/admin/events',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  { 
    title: 'Total Users', 
    key: 'totalUsers' as const,
    icon: Users, 
    href: '/admin/users',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
];

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Welcome to the Roundnet Directory admin panel
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Link key={stat.key} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold mt-1">
                      {stats[stat.key]}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Submissions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Submissions</CardTitle>
                <CardDescription>Clubs awaiting review</CardDescription>
              </div>
              <Link 
                href="/admin/submissions"
                className="text-sm text-primary hover:underline"
              >
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentSubmissions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No pending submissions
              </p>
            ) : (
              <div className="space-y-4">
                {stats.recentSubmissions.map((submission) => (
                  <div 
                    key={submission.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">{submission.clubName}</p>
                      <p className="text-sm text-muted-foreground">
                        {submission.submitterEmail}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {submission.status === 'PENDING' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </span>
                      ) : submission.status === 'APPROVED' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Rejected
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Clubs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recently Added Clubs</CardTitle>
                <CardDescription>Latest clubs in the directory</CardDescription>
              </div>
              <Link 
                href="/admin/clubs"
                className="text-sm text-primary hover:underline"
              >
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentClubs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No clubs added yet
              </p>
            ) : (
              <div className="space-y-4">
                {stats.recentClubs.map((club) => (
                  <div 
                    key={club.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">{club.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {club.country.flagEmoji} {club.country.code}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(club.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/admin/submissions"
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Clock className="h-8 w-8 text-orange-500 mb-2" />
              <span className="text-sm font-medium">Review Submissions</span>
            </Link>
            <Link
              href="/admin/clubs/new"
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Building2 className="h-8 w-8 text-blue-500 mb-2" />
              <span className="text-sm font-medium">Add Club</span>
            </Link>
            <Link
              href="/admin/events/new"
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Calendar className="h-8 w-8 text-green-500 mb-2" />
              <span className="text-sm font-medium">Create Event</span>
            </Link>
            <Link
              href="/admin/blog/new"
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="h-8 w-8 text-purple-500 mb-2" />
              <span className="text-sm font-medium">Write Post</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
