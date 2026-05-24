import { Link, Outlet, useLocation } from 'react-router-dom'
import { Briefcase } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
} from '../features/shared/ui/sidebar'
import { TooltipProvider } from '../features/shared/ui/tooltip'

export default function AppLayout() {
  const { pathname } = useLocation()
  const { t } = useTranslation()
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
              <SidebarGroupLabel>{t('navigation.navigationLabel')}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem></SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isInvestigationCase} tooltip={t('navigation.myCases')}>
                      <Link to="/affaires">
                        <Briefcase className="size-4" />
                        <span className="group-data-[collapsible=icon]:hidden">{t('navigation.myCases')}</span>
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
