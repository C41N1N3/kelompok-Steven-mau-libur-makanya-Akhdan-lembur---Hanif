import { AuthLayout } from "../components/auth/AuthLayout.tsx"
import RegisterForm from "../components/auth/RegisterForm.tsx"

export default function Register() {
  return (
    <AuthLayout title="Create your account" subtitle="Start your BrainWave journey for free">
      <RegisterForm />
    </AuthLayout>
  )
}
