import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/admin/admin-dashboard'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // For now, we'll allow access if password was verified
  // In production, check user metadata or a sessions table

  return <AdminDashboard />
}
