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
import { cn } from "cn";
import { useLocation, useNavigate } from "react-router";

const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
      <SidebarFooter />
    </Sidebar>
  );
};

export default AppSidebar;
