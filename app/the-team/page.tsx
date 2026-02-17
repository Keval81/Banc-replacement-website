import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Our Team | Banc Property Services",
  description: "Meet the dedicated team at Banc Property Group. Our experienced professionals are here to help you with all your property needs.",
};

const team = [
  {
    name: "Andrew Crump",
    role: "Director & Premier Homes Specialist",
    bio: "Andrew heads up Banc Premier Homes with vast experience in selling some of the finest homes locally. He offers bespoke exclusive marketing to tailor each prestigious home.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    phone: "020 1234 5678",
    email: "andrew@bancproperty.co.uk"
  },
  {
    name: "Sarah Mitchell",
    role: "Sales Manager",
    bio: "With over 15 years of local property experience, Sarah leads our sales team with passion and expertise, ensuring every client receives exceptional service.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    phone: "020 1234 5679",
    email: "sarah@bancproperty.co.uk"
  },
  {
    name: "James Wright",
    role: "Lettings Manager",
    bio: "James oversees our lettings department, bringing extensive knowledge of the rental market and a commitment to matching the right tenants with the right properties.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    phone: "020 1234 5680",
    email: "james@bancproperty.co.uk"
  },
  {
    name: "Emma Thompson",
    role: "Property Manager",
    bio: "Emma ensures our managed properties are maintained to the highest standards, building strong relationships with both landlords and tenants.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
    phone: "020 1234 5681",
    email: "emma@bancproperty.co.uk"
  }
];

export default function TeamPage() {
  return (
    <div className="bg-white text-[#111827]">
      <Header />
      
      {/* Hero */}
      <section className="relative bg-[#2C2F33] py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD] mb-4">Our People</p>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
              Meet the Team
            </h1>
            <p className="mt-6 text-lg text-white/70">
              Our experienced team is here to help you with all your property needs. 
              Get to know the people who make Banc Property Group exceptional.
            </p>
          </div>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <div key={member.name} className="rounded-2xl border border-[#E5E7EB] overflow-hidden">
                <div className="aspect-square relative">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold">{member.name}</h3>
                  <p className="text-[#1DBFDD] text-sm font-medium">{member.role}</p>
                  <p className="mt-3 text-sm text-[#6B7280]">{member.bio}</p>
                  <div className="mt-4 flex items-center gap-3 text-sm text-[#6B7280]">
                    <a href={`tel:${member.phone}`} className="flex items-center hover:text-[#1DBFDD]">
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </a>
                    <a href={`mailto:${member.email}`} className="flex items-center hover:text-[#1DBFDD]">
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join the Team */}
      <section className="bg-[#F9FAFB] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD]">Careers</p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Join Our Team</h2>
            <p className="mt-4 text-[#6B7280]">
              We are always looking for talented individuals to join our growing team. 
              If you are passionate about property and delivering exceptional service, 
              we would love to hear from you.
            </p>
            <Button className="mt-6 bg-[#1DBFDD] hover:bg-[#0E8CAB] text-white px-8 py-6">
              View Opportunities
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
