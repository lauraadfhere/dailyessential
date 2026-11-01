import { redirect } from 'next/navigation';

/** Tickets live on the contact support form (Parse SupportTicket + Cloudinary attachments). */
export default function StudentTicketsPage() {
  redirect('/contact');
}
