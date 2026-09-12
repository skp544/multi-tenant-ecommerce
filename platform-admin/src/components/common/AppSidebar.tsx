import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SIDEBAR_NAV } from "@/constants/sidebar-nav";
import { useAppDispatch, useAppSelector } from "@/hooks/use-store";
import { cn } from "cn";
import { useLocation, useNavigate } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { LogOut } from "lucide-react";
import { logoutUser } from "@/store/auth/auth.slice";

const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.auth.user);

  const avatarName = `${user?.fullName?.split(" ")[0][0] ?? ""}${user?.fullName?.split(" ")[1][0] ?? ""}`;

  const handleLogout = async () => {
    await dispatch(logoutUser());
  };

  return (
    <Sidebar className="bg-muted-foreground">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex items-center gap-3 p-4">
            <img
              src="/logos/platform-logo.png"
              alt="Platform Admin logo"
              className="size-11 rounded-xl shadow-lg shadow-black/20"
            />
            <span className="text-base font-bold text-white">
              Platform Admin
            </span>
          </div>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="">
              {SIDEBAR_NAV.map((item, index) => {
                const isActive = item.href === location.pathname;
                return (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.href)}
                      className={cn(
                        "text-accent hover:bg-white/10 hover:text-white px-2 py-3 h-10 hover:cursor-pointer",
                        isActive && "bg-sidebar-active/15 text-sidebar-active",
                      )}
                    >
                      <item.Icon className="size-5" />
                      {item.label}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-1.5 rounded-md bg-white/6 px-1 py-3">
          <div className="flex flex-1 items-center gap-2.5 ">
            {/* {image or name} => SKP */}
            <div>
              <Avatar>
                <AvatarImage src={user?.profileImage} />
                <AvatarFallback>{avatarName}</AvatarFallback>
              </Avatar>
            </div>

            {/* full name */}
            <div className="min-w-0 flex-1 flex flex-col">
              <span className="truncate text-sm font-semibold text-white">
                {user?.fullName}
              </span>
              <span className="truncate text-xs text-accent">
                {user?.email}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 rounded-md text-accent hover:bg-white/10 hover:text-white cursor-pointer px-1 py-2"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
