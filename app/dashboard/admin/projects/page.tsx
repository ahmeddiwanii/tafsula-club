import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../lib/auth"
import { prisma } from "../../../../lib/db"
import { UserRole } from "../../../../types/user"
import { AdminLayout } from "../../../../components/layout/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/table"
import { format } from "date-fns"

export default async function AdminProjectsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "SUPERADMIN") {
    return <div>Unauthorized</div>
  }

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      organization: true,
      createdBy: true,
      _count: {
        select: { tasks: true, teams: true }
      }
    }
  })

  const userRole = (session.user.role || "SUPERADMIN") as UserRole

  return (
    <AdminLayout role={userRole}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>All Projects</h1>
        </div>

        <Card className="bg-[#0a0a0f] border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Platform Projects</CardTitle>
            <CardDescription className="text-white/40">Overview of all projects created across the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-4 text-white/40">No projects found.</div>
            ) : (
              <div className="rounded-xl border border-white/5 overflow-hidden">
                <Table>
                  <TableHeader className="bg-white/[0.02]">
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-white/40 uppercase tracking-widest text-xs font-bold">Title</TableHead>
                      <TableHead className="text-white/40 uppercase tracking-widest text-xs font-bold">Organization</TableHead>
                      <TableHead className="text-white/40 uppercase tracking-widest text-xs font-bold">Type</TableHead>
                      <TableHead className="text-white/40 uppercase tracking-widest text-xs font-bold">Tasks</TableHead>
                      <TableHead className="text-white/40 uppercase tracking-widest text-xs font-bold">Teams</TableHead>
                      <TableHead className="text-white/40 uppercase tracking-widest text-xs font-bold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-white/5">
                    {projects.map((project) => (
                      <TableRow key={project.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                        <TableCell className="font-bold text-white/90">{project.title}</TableCell>
                        <TableCell className="text-white/70">{project.organization.name}</TableCell>
                        <TableCell className="capitalize text-white/70">{project.type}</TableCell>
                        <TableCell className="text-white/70">{project._count.tasks}</TableCell>
                        <TableCell className="text-white/70">{project._count.teams}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/5 text-white/40 border border-white/10`}>
                            {project.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
