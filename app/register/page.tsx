import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { EnhancedAuthForms } from "@/components/enhanced-auth-forms"

interface RegisterPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function RegisterContent({ searchParams }: RegisterPageProps) {
  const user = await getCurrentUser()
  const params = await searchParams

  if (user) {
    redirect("/dashboard")
  }

  const message = params.message as string
  const error = params.error as string

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">Crie sua conta</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Ou{" "}
            <a href="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
              entre na sua conta existente
            </a>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registro</CardTitle>
            <CardDescription>Crie uma nova conta com email e senha ou use o Google</CardDescription>
          </CardHeader>
          <CardContent>
            <EnhancedAuthForms mode="register" message={message} error={error} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function RegisterSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto mt-2" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function RegisterPage(props: RegisterPageProps) {
  return (
    <Suspense fallback={<RegisterSkeleton />}>
      <RegisterContent {...props} />
    </Suspense>
  )
}
