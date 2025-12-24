import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Users,
  FileText,
  ShoppingCart,
  BarChart3,
  Package,
  FileCheck,
  CreditCard,
  Settings,
  Building2,
  Send,
  ClipboardList,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";

const buyerMenuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Fornecedores",
    url: "/suppliers",
    icon: Users,
  },
  {
    title: "RFCIs",
    url: "/rfcis",
    icon: FileText,
    badge: "3",
  },
  {
    title: "Pedidos de Compra",
    url: "/purchase-orders",
    icon: ShoppingCart,
    comingSoon: true,
  },
  {
    title: "Produtos",
    url: "/products",
    icon: Package,
    comingSoon: true,
  },
];

const buyerSecondaryItems = [
  {
    title: "Notas Fiscais",
    url: "/invoices",
    icon: FileCheck,
    comingSoon: true,
  },
  {
    title: "Pagamentos",
    url: "/payments",
    icon: CreditCard,
    comingSoon: true,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
    comingSoon: true,
  },
];

const supplierMenuItems = [
  {
    title: "Meu Painel",
    url: "/supplier",
    icon: LayoutDashboard,
  },
  {
    title: "Cotações Pendentes",
    url: "/supplier/quotations",
    icon: ClipboardList,
    badge: "2",
  },
  {
    title: "Minhas Propostas",
    url: "/supplier/my-quotations",
    icon: Send,
  },
  {
    title: "Minha Empresa",
    url: "/supplier/company",
    icon: Building2,
    comingSoon: true,
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();
  
  const isSupplier = user?.role === "SUPPLIER";
  const menuItems = isSupplier ? supplierMenuItems : buyerMenuItems;
  const secondaryItems = isSupplier ? [] : buyerSecondaryItems;

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
            eP
          </div>
          <div>
            <h1 className="font-semibold text-lg leading-tight">e-Proc</h1>
            <p className="text-xs text-muted-foreground">
              {isSupplier ? t('sidebar.supplierPortal') : "Procurement B2B"}
            </p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {isSupplier ? t('sidebar.myPortal') : t('sidebar.procurement')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location === item.url || 
                  (item.url !== "/" && location.startsWith(item.url));
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      disabled={item.comingSoon}
                      className={item.comingSoon ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      <Link href={item.comingSoon ? "#" : item.url} data-testid={`nav-${item.url.replace(/\//g, "-")}`}>
                        <item.icon className="h-4 w-4" />
                        <span className="flex-1">{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                        {item.comingSoon && (
                          <Badge variant="outline" className="text-xs">
                            {t('nav.comingSoon')}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {secondaryItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Financeiro</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {secondaryItems.map((item) => {
                  const isActive = location === item.url;
                  
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        disabled={item.comingSoon}
                        className={item.comingSoon ? "opacity-50 cursor-not-allowed" : ""}
                      >
                        <Link href={item.comingSoon ? "#" : item.url}>
                          <item.icon className="h-4 w-4" />
                          <span className="flex-1">{item.title}</span>
                          {item.comingSoon && (
                            <Badge variant="outline" className="text-xs">
                              {t('nav.comingSoon')}
                            </Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="opacity-50 cursor-not-allowed">
              <span>
                <Settings className="h-4 w-4" />
                <span>{t('nav.settings')}</span>
                <Badge variant="outline" className="text-xs">{t('nav.comingSoon')}</Badge>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
