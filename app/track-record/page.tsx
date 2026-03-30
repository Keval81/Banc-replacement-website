import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Home, Clock, PoundSterling, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Track Record | Banc Property Services",
  description: "See our impressive track record of property sales and lettings. Banc Property Group has helped hundreds of clients achieve their property goals.",
};

const stats = [
  { icon: Home, value: "500+", label: "Properties Sold", description: "Successfully sold in the last 12 months" },
  { icon: PoundSterling, value: "£450M", label: "Property Value", description: "Total value of properties sold" },
  { icon: Clock, value: "28", label: "Days Average", description: "Average time to sell a property" },
  { icon: Star, value: "98%", label: "Client Satisfaction", description: "Of clients would recommend us" }
];

const recentSales = [
  {
    address: "The Laurels, Hadley Wood",
    price: "£2,450,000",
    originalPrice: "£2,395,000",
    daysOnMarket: 14,
    status: "Sold Above Asking"
  },
  {
    address: "Mayfair Penthouse, Mount Street",
    price: "£3,900,000",
    originalPrice: "£3,750,000",
    daysOnMarket: 21,
    status: "Sold Above Asking"
  },
  {
    address: "Cuffley House, Cuffley",
    price: "£1,350,000",
    originalPrice: "£1,350,000",
    daysOnMarket: 18,
    status: "Sold At Asking"
  },
  {
    address: "Woodland Manor, Brookmans Park",
    price: "£1,850,000",
    originalPrice: "£1,795,000",
    daysOnMarket: 12,
    status: "Sold Above Asking"
  }
];

export default function TrackRecordPage() {
  return (
    <div className="bg-white text-[#2C2A27]">
      <Header />
      
      {/* Hero */}
      <section className="relative bg-[#1A1917] py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.3em] text-[#4AC8E8] mb-4">Results</p>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
              Impressive Track Record
            </h1>
            <p className="mt-6 text-lg text-white/70">
              We have an impressive track record of achieving exceptional results for our clients. 
              Our statistics speak for themselves.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center p-6 rounded-2xl border border-[#E0DFDC]">
                <stat.icon className="h-10 w-10 text-[#4AC8E8] mx-auto" />
                <p className="mt-4 text-4xl font-bold text-[#4AC8E8]">{stat.value}</p>
                <p className="mt-2 font-semibold">{stat.label}</p>
                <p className="mt-1 text-sm text-[#8A8880]">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Sales */}
      <section className="bg-[#F4F3F1] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.3em] text-[#4AC8E8]">Recent Success</p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Recent Sales</h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            {recentSales.map((sale) => (
              <div key={sale.address} className="rounded-2xl border border-[#E0DFDC] bg-white p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-lg font-semibold">{sale.address}</p>
                    <div className="mt-2 flex items-center gap-4">
                      <span className="text-2xl font-bold text-[#4AC8E8]">{sale.price}</span>
                      {sale.price !== sale.originalPrice && (
                        <span className="text-sm text-[#8A8880] line-through">{sale.originalPrice}</span>
                      )}
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                    {sale.status}
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t border-[#E0DFDC] flex justify-between text-sm text-[#8A8880]">
                  <span>Days on market: {sale.daysOnMarket}</span>
                  <span>{Math.round(((parseInt(sale.price.replace(/[^0-9]/g, '')) - parseInt(sale.originalPrice.replace(/[^0-9]/g, ''))) / parseInt(sale.originalPrice.replace(/[^0-9]/g, ''))) * 100)}% of asking</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button variant="outline" className="border-[#4AC8E8] text-[#4AC8E8] hover:bg-[#4AC8E8] hover:text-white">
              View All Sold Properties
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-10 text-center">
          <div className="text-6xl text-[#4AC8E8] opacity-30">"</div>
          <blockquote className="text-2xl font-medium text-[#2C2A27] -mt-8">
            Banc achieved a record price for our property within two weeks of listing. 
            Their marketing was exceptional and their communication throughout the process 
            was outstanding. We could not recommend them highly enough.
          </blockquote>
          <div className="mt-6">
            <p className="font-semibold">James Whittaker</p>
            <p className="text-[#8A8880]">Hadley Wood</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#4AC8E8] py-16">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-10">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">
            Ready to achieve exceptional results?
          </h2>
          <p className="mt-4 text-lg text-white/90">
            Let us put our track record to work for you.
          </p>
          <Button className="mt-8 bg-white text-[#4AC8E8] hover:bg-white/90 px-8 py-6 text-base">
            Book Your Valuation
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
