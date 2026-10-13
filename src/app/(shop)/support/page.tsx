import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/misc";
import { Clock, Mail, MessageCircle, Phone } from "lucide-react";
import { ContactForm, FaqList, ReviewsSection } from "@/components/shop/support";

export const metadata: Metadata = { title: "Reviews & support" };

const contactChannels = [
  { icon: MessageCircle, title: "Live chat", body: "Avg. reply in 2 min", note: "Simulated" },
  { icon: Phone, title: "Call us", body: "+91 00000 00000", note: "Fictional number" },
  { icon: Mail, title: "Email", body: "help@spicy.test", note: "Not monitored" },
  { icon: Clock, title: "Hours", body: "11 AM – 2 AM daily", note: "Demo hours" },
];

export default function SupportPage() {
  return (
    <>
      <PageHeader
        eyebrow="Reviews & support"
        title={
          <>
            Too hot? Too slow? <span className="italic text-chili">Tell us.</span>
          </>
        }
        body="Read what people think, leave your own review, or get help with an order."
      />
      <div className="container-x space-y-24">
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {contactChannels.map((c) => (
            <li key={c.title} className="rounded-[1.5rem] bg-white p-5 shadow-[var(--shadow-soft)]">
              <c.icon className="h-5 w-5 text-chili" aria-hidden />
              <p className="mt-3 font-semibold">{c.title}</p>
              <p className="text-sm">{c.body}</p>
              <p className="mt-1 text-xs text-ash">{c.note}</p>
            </li>
          ))}
        </ul>
        <ReviewsSection />
        <div className="grid gap-12 lg:grid-cols-2">
          <FaqList />
          <section aria-labelledby="contact-h" id="contact" className="scroll-mt-28">
            <h2 id="contact-h" className="mb-6 text-4xl font-medium">Contact support</h2>
            <ContactForm />
          </section>
        </div>
      </div>
    </>
  );
}
