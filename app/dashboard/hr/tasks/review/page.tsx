'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CheckCircle2, XCircle, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TaskAssignment {
  id: string;
  status: string;
  approvalStatus: string;
  submittedAt?: string;
  approvedAt?: string;
  creditsAwarded: number;
  task: {
    id: string;
    title: string;
    description?: string;
    priority: string;
    dueDate?: string;
    team: {
      name: string;
    };
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
  approver?: {
    name: string;
  };
}

export default function TaskReviewPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<TaskAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [filterStatus, setFilterStatus] = useState('SUBMITTED');

  useEffect(() => {
    if (session?.user) {
      fetchTasks();
    }
  }, [session, filterStatus]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/teams/tasks?status=${filterStatus}`
      );
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tasks',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (assignmentId: string) => {
    try {
      setReviewingId(assignmentId);
      const res = await fetch(`/api/teams/tasks/${assignmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          comment: reviewComment,
        }),
      });

      if (res.ok) {
        toast({
          title: 'Success',
          description: 'Task approved and credits awarded!',
        });
        setReviewComment('');
        fetchTasks();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to approve task',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error approving task:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve task',
        variant: 'destructive',
      });
    } finally {
      setReviewingId(null);
    }
  };

  const handleReject = async (assignmentId: string) => {
    try {
      setReviewingId(assignmentId);
      const res = await fetch(`/api/teams/tasks/${assignmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          comment: reviewComment,
        }),
      });

      if (res.ok) {
        toast({
          title: 'Success',
          description: 'Task rejected and feedback sent',
        });
        setReviewComment('');
        fetchTasks();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to reject task',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error rejecting task:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject task',
        variant: 'destructive',
      });
    } finally {
      setReviewingId(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const submittedTasks = tasks.filter((t) => t.status === 'SUBMITTED');
  const reviewTasks = tasks.filter((t) => t.status === 'REVIEW');
  const approvedTasks = tasks.filter((t) => t.approvalStatus === 'APPROVED');
  const rejectedTasks = tasks.filter((t) => t.approvalStatus === 'REJECTED');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Task Review Dashboard
          </h1>
          <p className="text-lg text-slate-600">
            Review and approve team member submissions
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 text-center bg-gradient-to-br from-blue-50 to-white border-blue-200">
            <p className="text-3xl font-bold text-blue-600">{submittedTasks.length}</p>
            <p className="text-xs text-slate-600 mt-1">Pending Review</p>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-br from-purple-50 to-white border-purple-200">
            <p className="text-3xl font-bold text-purple-600">{reviewTasks.length}</p>
            <p className="text-xs text-slate-600 mt-1">In Review</p>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-white border-green-200">
            <p className="text-3xl font-bold text-green-600">{approvedTasks.length}</p>
            <p className="text-xs text-slate-600 mt-1">Approved</p>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-br from-red-50 to-white border-red-200">
            <p className="text-3xl font-bold text-red-600">{rejectedTasks.length}</p>
            <p className="text-xs text-slate-600 mt-1">Rejected</p>
          </Card>
        </div>

        {/* Pending Review Section */}
        {submittedTasks.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Pending Review
            </h2>
            <div className="space-y-4">
              {submittedTasks.map((assignment) => (
                <Card
                  key={assignment.id}
                  className="p-6 border-2 border-blue-200 bg-blue-50 hover:shadow-lg transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {assignment.task.title}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        Submitted by{' '}
                        <span className="font-medium">{assignment.user.name}</span> ({assignment.user.email})
                      </p>
                      <p className="text-sm text-slate-600">
                        Team: <span className="font-medium">{assignment.task.team.name}</span>
                      </p>
                    </div>
                    <Badge className={getPriorityColor(assignment.task.priority)}>
                      {assignment.task.priority}
                    </Badge>
                  </div>

                  {assignment.task.description && (
                    <p className="text-slate-700 mb-4 p-3 bg-white rounded border border-blue-100">
                      {assignment.task.description}
                    </p>
                  )}

                  <p className="text-sm text-slate-600 mb-4">
                    Submitted:{' '}
                    {formatDistanceToNow(new Date(assignment.submittedAt || ''), {
                      addSuffix: true,
                    })}
                  </p>

                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="flex gap-2">
                        <Button className="flex-1 bg-green-500 hover:bg-green-600">
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button variant="destructive" className="flex-1">
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Review Task Submission</DialogTitle>
                        <DialogDescription>
                          {assignment.task.title} - submitted by {assignment.user.name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <label className="text-sm font-medium text-slate-900">
                            <MessageSquare className="w-4 h-4 inline mr-2" />
                            Feedback (optional)
                          </label>
                          <Textarea
                            placeholder="Provide feedback for the team member..."
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            className="mt-2"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(assignment.id)}
                          disabled={reviewingId === assignment.id}
                          className="flex-1 bg-green-500 hover:bg-green-600"
                        >
                          {reviewingId === assignment.id ? 'Approving...' : 'Approve'}
                        </Button>
                        <Button
                          onClick={() => handleReject(assignment.id)}
                          disabled={reviewingId === assignment.id}
                          variant="destructive"
                          className="flex-1"
                        >
                          {reviewingId === assignment.id ? 'Rejecting...' : 'Reject'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Approved Tasks */}
        {approvedTasks.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Approved Tasks
            </h2>
            <div className="space-y-4">
              {approvedTasks.map((assignment) => (
                <Card
                  key={assignment.id}
                  className="p-6 border-2 border-green-200 bg-green-50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        {assignment.task.title}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {assignment.user.name} • Approved{' '}
                        {formatDistanceToNow(new Date(assignment.approvedAt || ''), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        +{assignment.creditsAwarded}
                      </p>
                      <p className="text-xs text-slate-600">Credits</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Rejected Tasks */}
        {rejectedTasks.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Rejected Tasks
            </h2>
            <div className="space-y-4">
              {rejectedTasks.map((assignment) => (
                <Card
                  key={assignment.id}
                  className="p-6 border-2 border-red-200 bg-red-50"
                >
                  <div className="flex justify-start items-start gap-4">
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {assignment.task.title}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {assignment.user.name} • Rejected
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {tasks.length === 0 && (
          <Alert>
            <AlertDescription>
              No tasks to review currently. All tasks are either pending assignment or completed.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
