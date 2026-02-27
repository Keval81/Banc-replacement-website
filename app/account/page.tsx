import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccountSidebar from "@/app/account/components/AccountSidebar";
import AccountOverview from "@/app/account/components/AccountOverview";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/account");
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-[#2C2F33] via-[#1a1d21] to-[#0f1113] pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-4">
            <AccountSidebar user={session.user} />
            <div className="lg:col-span-3">
              <AccountOverview user={session.user} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
