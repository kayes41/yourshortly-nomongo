import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import NextLink from "next/link";

export default async function StatsPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <NextLink href="/dashboard" className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </NextLink>
        <div>
          <h1 className="text-2xl font-bold">Stats for {slug}</h1>
          <p className="text-sm text-muted-foreground block">
            Detailed analytics are currently disabled.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-muted-foreground">
              Analytics have been temporarily disabled. Click tracking and country/device tracking are offline.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
