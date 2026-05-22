import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AdminLoginPage() {
  async function handleLogin(formData: FormData) {
    'use server'
    
    // .trim() handles accidental trailing spaces from copy-pasting or mobile keyboards
    const email = (formData.get('email') as string)?.trim().toLowerCase()
    const password = (formData.get('password') as string)?.trim()

    // DEBUG LOG: Look at your VS Code/terminal window when you hit submit!
    console.log(`[Login Attempt] Captured Email: "${email}" | Captured Password: "${password}"`)

    // Matches your exact request, covering both capitalization styles for the password
    if (
      email === 'admin@mess.com' && 
      (password === 'admin@123' || password === 'Admin@123')
    ) {
      redirect('/admin/dashboard')
    }
    
    console.log("--> Status: Invalid local credentials entered.")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Admin Portal Login</CardTitle>
          <CardDescription>Mess Food Ordering System</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleLogin} className="space-y-4">
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input
                type="email"
                name="email"
                placeholder="admin@mess.com"
                required
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                name="password"
                placeholder="••••••••"
                required
                className="bg-background"
              />
            </div>

            <Button type="submit" className="w-full mt-2">
              Login to Dashboard
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}