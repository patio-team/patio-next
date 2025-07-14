import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  // Check if user is authenticated
  try {
    const session = await auth.api.getSession({
      headers: new Headers(),
    });

    if (session?.user) {
      // User is authenticated, redirect to dashboard or main app
      redirect("/manage-group");
    }
  } catch (error) {
    // User is not authenticated, show landing page
  }

  // If not authenticated, redirect to login
  redirect("/login");
}
