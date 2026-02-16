import Layout from "@/components/Layout";
import MetaHelmet from "@/components/MetaHelmet";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home, Search, Anchor } from "lucide-react";

const NotFound = () => {
  return (
    <Layout>
      <MetaHelmet
        title="Page Not Found - DockNow"
        description="The page you're looking for doesn't exist. Return to DockNow to discover and book marina slips worldwide."
        noindex={true}
      />
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-gradient-to-br from-ocean-500 to-wave-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <Anchor className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-ocean-600 to-wave-600 bg-clip-text text-transparent">
            404
          </h1>

          <h2 className="text-2xl font-semibold mb-4">Lost at Sea?</h2>

          <p className="text-muted-foreground mb-8">
            The page you're looking for seems to have drifted away. Let's get
            you back to safe harbor.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              className="bg-gradient-to-r from-ocean-500 to-wave-500 hover:from-ocean-600 hover:to-wave-600 text-white"
              asChild
            >
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>

            <Button
              variant="outline"
              className="border-ocean-200 text-ocean-700 hover:bg-ocean-50 dark:border-ocean-800 dark:text-ocean-300 dark:hover:bg-ocean-950"
              asChild
            >
              <Link to="/discover">
                <Search className="w-4 h-4 mr-2" />
                Discover Ports
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
