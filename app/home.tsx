import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  // Check if user is authenticated
  try {
    const session = await auth.api.getSession({
      headers: new Headers(),
    });

    if (session?.user) {
      // User is authenticated, redirect to dashboard
      redirect('/manage-group');
    }
  } catch {
    // User is not authenticated, continue to show landing page
  }

  // If not authenticated, redirect to login
  redirect('/login');
}
