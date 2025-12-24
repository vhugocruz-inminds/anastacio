import { User, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";

export function UserNav() {
  const { user, logout, switchUser } = useAuth();

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const roleLabels: Record<string, string> = {
    BUYER: "Comprador",
    BUYER_MANAGER: "Gestor de Compras",
    SUPPLIER: "Fornecedor",
    ADMIN: "Administrador",
  };

  const isSupplier = user.role === "SUPPLIER";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 gap-2 px-2" data-testid="button-user-menu">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-medium">{user.name}</span>
            <span className="text-xs text-muted-foreground">
              {roleLabels[user.role] || user.role}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Trocar Persona (Demo)
        </DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => switchUser("buyer")}
          className="gap-2"
          data-testid="switch-to-buyer"
        >
          <User className="h-4 w-4" />
          <span>Comprador</span>
          {!isSupplier && <Badge variant="secondary" className="ml-auto text-xs">Atual</Badge>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => switchUser("supplier")}
          className="gap-2"
          data-testid="switch-to-supplier"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Fornecedor</span>
          {isSupplier && <Badge variant="secondary" className="ml-auto text-xs">Atual</Badge>}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="gap-2 text-destructive" data-testid="button-logout">
          <LogOut className="h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
