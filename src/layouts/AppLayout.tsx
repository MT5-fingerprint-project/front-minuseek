import { Link, Outlet, useLocation } from 'react-router-dom'
import { Briefcase, type LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ParseKeys } from 'i18next'
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

type NavItem = {
  path: string
  labelKey: ParseKeys
  icon: LucideIcon
}

const NAV_ITEMS: readonly NavItem[] = [
  { path: '/affaires', labelKey: 'navigation.myCases', icon: Briefcase },
] as const

export default function AppLayout() {
  const { pathname } = useLocation()
  const { t } = useTranslation()

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
                  {NAV_ITEMS.map((item) => {
                    const label = t(item.labelKey)
                    const isActive = pathname.startsWith(item.path)

                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton asChild isActive={isActive} tooltip={label}>
                          <Link to={item.path}>
                            <item.icon className="size-4" />
                            <span className="group-data-[collapsible=icon]:hidden">{label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
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
