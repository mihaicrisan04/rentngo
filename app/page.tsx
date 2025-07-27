import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect to Romanian (default locale) homepage
  redirect('/ro');
} 