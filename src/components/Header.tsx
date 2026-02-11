import { ShoppingBag, Settings } from "lucide-react";
import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-primary">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-primary-foreground">
          <ShoppingBag className="h-7 w-7" />
          <span className="text-xl font-bold tracking-tight">ThaiDeals</span>
        </Link>
        <Link
          to="/admin"
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-primary-foreground/80 transition-colors hover:text-primary-foreground hover:bg-primary-foreground/10"
        >
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Admin</span>
        </Link>
      </div>
    </header>
  );
}
