import { getUser } from "@/lib/get-user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search } from "lucide-react";

export default async function DiscoverPage() {
  const user = await getUser();

  return (
    <div className="section-container space-y-8">
      <div>
        <h1 className="text-3xl">Discover Talent</h1>
        <p className="mt-1 text-muted-foreground">
          Welcome, {user.fullName}. Browse student portfolios and find the right
          candidates.
        </p>
      </div>

      <Card>
        <CardHeader className="items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <Search className="size-6 text-muted-foreground" />
          </div>
          <CardTitle className="mt-4">No portfolios yet</CardTitle>
          <CardDescription>
            Student portfolios will appear here once they&apos;re published.
            Check back soon!
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  );
}
