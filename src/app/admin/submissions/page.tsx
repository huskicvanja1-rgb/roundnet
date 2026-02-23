'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, Eye, Clock, Search,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Submission {
  id: string;
  clubName: string;
  countryCode: string;
  city: string;
  clubType: string;
  website: string | null;
  email: string | null;
  description: string | null;
  submitterName: string;
  submitterEmail: string;
  submitterRole: string | null;
  notes: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [search, setSearch] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
      });
      if (filter !== 'ALL') params.set('status', filter);
      if (search) params.set('search', search);

      const response = await fetch(`/api/admin/submissions?${params}`);
      const data = await response.json();
      setSubmissions(data.submissions || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubmissions();
  }, [filter, page]);

  const handleApprove = async (id: string) => {
    setProcessing(id);
    try {
      const response = await fetch(`/api/admin/submissions/${id}/approve`, {
        method: 'POST',
      });
      if (response.ok) {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: 'APPROVED' as const } : s))
        );
        setSelectedSubmission(null);
      }
    } catch (error) {
      console.error('Failed to approve:', error);
    }
    setProcessing(null);
  };

  const handleReject = async (id: string, reason?: string) => {
    setProcessing(id);
    try {
      const response = await fetch(`/api/admin/submissions/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (response.ok) {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: 'REJECTED' as const } : s))
        );
        setSelectedSubmission(null);
      }
    } catch (error) {
      console.error('Failed to reject:', error);
    }
    setProcessing(null);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Club Submissions</h1>
        <p className="text-muted-foreground">
          Review and moderate club submissions from users
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search submissions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            onKeyDown={(e) => e.key === 'Enter' && fetchSubmissions()}
          />
        </div>
        <div className="flex gap-2">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setFilter(status);
                setPage(1);
              }}
            >
              {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Submissions Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No submissions found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium">Club Name</th>
                    <th className="text-left p-4 font-medium">Location</th>
                    <th className="text-left p-4 font-medium">Type</th>
                    <th className="text-left p-4 font-medium">Submitted By</th>
                    <th className="text-left p-4 font-medium">Date</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-right p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr key={submission.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <span className="font-medium">{submission.clubName}</span>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {submission.city}, {submission.countryCode}
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">{submission.clubType}</Badge>
                      </td>
                      <td className="p-4 text-sm">
                        <div>{submission.submitterName}</div>
                        <div className="text-muted-foreground">
                          {submission.submitterEmail}
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[submission.status]}`}>
                          {submission.status === 'PENDING' && <Clock className="h-3 w-3 mr-1" />}
                          {submission.status === 'APPROVED' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {submission.status === 'REJECTED' && <XCircle className="h-3 w-3 mr-1" />}
                          {submission.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedSubmission(submission)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {submission.status === 'PENDING' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => handleApprove(submission.id)}
                                disabled={processing === submission.id}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleReject(submission.id)}
                                disabled={processing === submission.id}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedSubmission.clubName}</CardTitle>
                  <CardDescription>
                    Submitted on {new Date(selectedSubmission.submittedAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge className={statusColors[selectedSubmission.status]}>
                  {selectedSubmission.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Location
                  </h4>
                  <p>{selectedSubmission.city}, {selectedSubmission.countryCode}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Club Type
                  </h4>
                  <p>{selectedSubmission.clubType}</p>
                </div>
                {selectedSubmission.website && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Website
                    </h4>
                    <a 
                      href={selectedSubmission.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {selectedSubmission.website}
                    </a>
                  </div>
                )}
                {selectedSubmission.email && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Club Email
                    </h4>
                    <p>{selectedSubmission.email}</p>
                  </div>
                )}
              </div>

              {selectedSubmission.description && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Description
                  </h4>
                  <p className="text-sm">{selectedSubmission.description}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  Submitter Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>{' '}
                    {selectedSubmission.submitterName}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>{' '}
                    {selectedSubmission.submitterEmail}
                  </div>
                  {selectedSubmission.submitterRole && (
                    <div>
                      <span className="text-muted-foreground">Role:</span>{' '}
                      {selectedSubmission.submitterRole}
                    </div>
                  )}
                </div>
                {selectedSubmission.notes && (
                  <div className="mt-2">
                    <span className="text-muted-foreground">Notes:</span>
                    <p className="mt-1 text-sm">{selectedSubmission.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setSelectedSubmission(null)}
                >
                  Close
                </Button>
                {selectedSubmission.status === 'PENDING' && (
                  <>
                    <Button
                      variant="destructive"
                      onClick={() => handleReject(selectedSubmission.id)}
                      disabled={processing === selectedSubmission.id}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleApprove(selectedSubmission.id)}
                      disabled={processing === selectedSubmission.id}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
