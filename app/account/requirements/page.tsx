import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccountSidebar from "@/app/account/components/AccountSidebar";

export default async function RequirementsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/account/requirements");
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-[#2C2F33] via-[#1a1d21] to-[#0f1113] pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-4">
            <AccountSidebar user={session.user} />
            <div className="lg:col-span-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
                <h1 className="text-2xl font-bold text-white mb-2">
                  Property Requirements
                </h1>
                <p className="text-white/60 mb-8">
                  Update your property search preferences
                </p>
                
                <div className="rounded-xl border border-[#1DBFDD]/30 bg-[#1DBFDD]/5 p-6">
                  <p className="text-white/80">
                    Your requirements were saved during registration. 
                    Advanced requirement editing will be available soon.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
