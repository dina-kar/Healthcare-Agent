"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Heart, 
  Home, 
  MessageSquare, 
  Settings as SettingsIcon, 
  LogOut,
  Sparkles
} from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "AI Chat", href: "/chat", icon: MessageSquare },
  { name: "Settings", href: "/settings", icon: SettingsIcon },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  const user = session?.user;

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r shadow-sm z-40">
      {/* Logo */}
      <div className="h-16 px-5 flex items-center border-b">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Heart className="h-7 w-7 text-red-500" />
            <Sparkles className="h-3 w-3 text-yellow-500 absolute -top-1 -right-1" />
          </div>
          <span className="text-lg font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            HealthCare AI
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} className="block">
              <Button
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start gap-2 ${isActive ? "bg-blue-600 text-white hover:bg-blue-600" : ""}`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User Menu */}
      <div className="absolute bottom-0 left-0 right-0 border-t p-4 bg-white">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-9 w-9 ring-2 ring-blue-200">
              <AvatarImage src={user?.image || undefined} alt={user?.name || "User"} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="truncate">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name || "User"}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleLogout}
            className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}