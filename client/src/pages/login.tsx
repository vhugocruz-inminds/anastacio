import { useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Building2, User } from "lucide-react";
import { LanguageSelector } from "@/components/language-selector";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const { login, switchUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(email, password);

    if (success) {
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao e-Proc.",
      });
      setLocation("/");
    } else {
      toast({
        title: "Erro ao fazer login",
        description: "Email ou senha inválidos.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleDemoLogin = (role: "buyer" | "supplier") => {
    switchUser(role);
    toast({
      title: "Login de demonstração",
      description:
        role === "buyer"
          ? "Você está logado como Comprador."
          : "Você está logado como Fornecedor.",
    });
    setLocation(role === "supplier" ? "/supplier" : "/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <img
            src="/anastacio-logo.png"
            alt="Anastacio"
            className="h-16 w-auto mx-auto"
          />
          <h1 className="text-3xl font-semibold">e-Proc</h1>
          <p className="text-muted-foreground">E-Procurement B2B Platform</p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">{t("auth.login")}</CardTitle>
            <CardDescription>{t("auth.selectProfile")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="input-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="input-password"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("auth.login")}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  {t("auth.demoMode")}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => handleDemoLogin("buyer")}
                className="gap-2"
                data-testid="button-demo-buyer"
              >
                <User className="h-4 w-4" />
                {t("auth.enterAsBuyer")}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDemoLogin("supplier")}
                className="gap-2"
                data-testid="button-demo-supplier"
              >
                <Building2 className="h-4 w-4" />
                {t("auth.enterAsSupplier")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Quimica Anastacio - e-Procurement Platform
        </p>
      </div>
    </div>
  );
}
