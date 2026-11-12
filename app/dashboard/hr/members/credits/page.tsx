'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TrendingUp, Award, Target, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MemberCredit {
  id: string;
  userId: string;
  totalCredits: number;
  creditsJson?: string;
  tasksCompleted: number;
  tasksApproved: number;
  tasksRejected: number;
  approvalRate: number;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface CreditTransaction {
  amount: number;
  reason: string;
  timestamp: string;
}

export default function MemberCreditsPage() {
  const { data: session } = useSession();
  const [members, setMembers] = useState<MemberCredit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<MemberCredit | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchCredits();
    }
  }, [session]);

  const fetchCredits = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/members/credits');
      if (res.ok) {
        const data = await res.json();
        setMembers(data.credits || []);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setLoading(false);
    }
  };

  const getApprovalRateBadge = (rate: number) => {
    if (rate >= 90) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (rate >= 75) return <Badge className="bg-blue-100 text-blue-800">Good</Badge>;
    if (rate >= 50) return <Badge className="bg-yellow-100 text-yellow-800">Fair</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>;
  };

  const sortedMembers = [...members].sort((a, b) => b.totalCredits - a.totalCredits);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  const topPerformers = sortedMembers.slice(0, 3);
  const totalCreditsDistributed = members.reduce((acc, m) => acc + m.totalCredits, 0);
  const avgApprovalRate =
    members.length > 0
      ? members.reduce((acc, m) => acc + m.approvalRate, 0) / members.length
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Member points
          </h1>
          <p className="text-lg text-slate-600">
            Track team member achievements and task completion rates
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Members</p>
                <p className="text-3xl font-bold text-amber-600 mt-2">{members.length}</p>
              </div>
              <Target className="w-10 h-10 text-amber-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total points awarded</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {Math.round(totalCreditsDistributed)}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avg Approval Rate</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {Math.round(avgApprovalRate)}%
                </p>
              </div>
              <BarChart3 className="w-10 h-10 text-purple-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Top Performer</p>
                <p className="text-xl font-bold text-green-600 mt-2">
                  {topPerformers[0]?.user.name || 'N/A'}
                </p>
              </div>
              <Award className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Top Performers */}
        {topPerformers.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              🏆 Top Performers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topPerformers.map((member, index) => (
                <Card
                  key={member.id}
                  className={`p-6 border-2 ${
                    index === 0
                      ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-white'
                      : index === 1
                      ? 'border-gray-300 bg-gradient-to-br from-gray-50 to-white'
                      : 'border-orange-300 bg-gradient-to-br from-orange-50 to-white'
                  }`}
                >
                  <div className="text-center mb-4">
                    <p className="text-4xl font-bold">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </p>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 text-center">
                    {member.user.name}
                  </h3>
                  <p className="text-sm text-slate-600 text-center mb-4">
                    {member.user.email}
                  </p>
                  <div className="space-y-2 text-center">
                    <div>
                      <p className="text-3xl font-bold text-amber-600">
                        {Math.round(member.totalCredits)}
                      </p>
                      <p className="text-xs text-slate-600">Points</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {member.tasksApproved}
                      </p>
                      <p className="text-xs text-slate-600">Tasks Approved</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* All Members Table */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            All Members
          </h2>
          <Card className="overflow-hidden border-2 border-slate-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 border-b-2 border-slate-200">
                  <TableHead className="font-bold text-slate-900">Member</TableHead>
                  <TableHead className="text-right font-bold text-slate-900">
                    Total points
                  </TableHead>
                  <TableHead className="text-center font-bold text-slate-900">
                    Tasks Completed
                  </TableHead>
                  <TableHead className="text-center font-bold text-slate-900">
                    Tasks Approved
                  </TableHead>
                  <TableHead className="text-center font-bold text-slate-900">
                    Approval Rate
                  </TableHead>
                  <TableHead className="text-center font-bold text-slate-900">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedMembers.map((member) => (
                  <TableRow
                    key={member.id}
                    className="hover:bg-slate-50 border-b border-slate-100"
                  >
                    <TableCell>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {member.user.name}
                        </p>
                        <p className="text-sm text-slate-600">
                          {member.user.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <p className="text-xl font-bold text-amber-600">
                        {Math.round(member.totalCredits)}
                      </p>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">
                        {member.tasksCompleted}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-green-100 text-green-800">
                        {member.tasksApproved}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <p className="font-semibold text-slate-900 mb-1">
                          {Math.round(member.approvalRate)}%
                        </p>
                        {getApprovalRateBadge(member.approvalRate)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedMember(member)}
                          >
                            View Details
                          </Button>
                        </DialogTrigger>
                        {selectedMember?.id === member.id && (
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{member.user.name}</DialogTitle>
                              <DialogDescription>
                                {member.user.email}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6 py-4">
                              {/* Summary Stats */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                                  <p className="text-sm text-slate-600">Total points</p>
                                  <p className="text-2xl font-bold text-amber-600 mt-2">
                                    {Math.round(member.totalCredits)}
                                  </p>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                  <p className="text-sm text-slate-600">Approval Rate</p>
                                  <p className="text-2xl font-bold text-green-600 mt-2">
                                    {Math.round(member.approvalRate)}%
                                  </p>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                  <p className="text-sm text-slate-600">Tasks Approved</p>
                                  <p className="text-2xl font-bold text-blue-600 mt-2">
                                    {member.tasksApproved}
                                  </p>
                                </div>
                                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                                  <p className="text-sm text-slate-600">Tasks Rejected</p>
                                  <p className="text-2xl font-bold text-red-600 mt-2">
                                    {member.tasksRejected}
                                  </p>
                                </div>
                              </div>

                              {/* Credit History */}
                              {member.creditsJson && (
                                <div>
                                  <h4 className="font-bold text-slate-900 mb-3">
                                    Points history
                                  </h4>
                                  <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {JSON.parse(member.creditsJson).map(
                                      (transaction: CreditTransaction, idx: number) => (
                                        <div
                                          key={idx}
                                          className="flex justify-between items-start p-3 bg-slate-50 rounded border border-slate-200"
                                        >
                                          <div>
                                            <p className="font-medium text-slate-900">
                                              +{transaction.amount} points
                                            </p>
                                            <p className="text-sm text-slate-600">
                                              {transaction.reason}
                                            </p>
                                          </div>
                                          <p className="text-xs text-slate-500">
                                            {new Date(
                                              transaction.timestamp
                                            ).toLocaleDateString()}
                                          </p>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        )}
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </section>
      </div>
    </div>
  );
}
