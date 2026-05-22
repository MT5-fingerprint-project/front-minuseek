import { Link, Outlet, useLocation } from 'react-router-dom'
import { Briefcase } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '../components/ui/sidebar'
import { TooltipProvider } from '../components/ui/tooltip'

export default function AppLayout() {
  const { pathname } = useLocation()
  const isInvestigationCase = pathname.startsWith('/affaire')

  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar collapsible="icon" className="bg-primary text-white py-3">
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2">
              <Link to="/" className="flex items-center justify-center gap-2 text-xl font-bold">
                <span className="group-data-[collapsible=icon]:hidden">Minuseek</span>
              </Link>
              <SidebarTrigger className="ml-auto group-data-[collapsible=icon]:-ml-4" />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem></SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isInvestigationCase} tooltip="Mes affaires">
                      <Link to="/affaires">
                        <Briefcase className="size-4" />
                        <span className="group-data-[collapsible=icon]:hidden">Mes affaires</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <div className="p-4">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
