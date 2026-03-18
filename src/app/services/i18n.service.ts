import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type LanguageCode = 'en' | 'pt' | 'fr' | 'es';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private readonly storageKey = 'myproperty.language';
  private readonly defaultLanguage: LanguageCode = 'en';
  private initialized = false;

  private readonly translations: Record<LanguageCode, Record<string, string>> = {
    en: {
      'nav.home': 'Home',
      'nav.dashboard': 'Dashboard',
      'nav.properties': 'Properties',
      'nav.invoices': 'Invoices',
      'nav.chat': 'Chat',
      'nav.login': 'Login',
      'nav.signup': 'Sign Up',
      'nav.logout': 'Logout',
      'nav.language': 'Language',
      'lang.en': 'English',
      'lang.pt': 'Portuguese',
      'lang.fr': 'French',
      'lang.es': 'Spanish',
      'landing.badge': 'Smart Property Management',
      'landing.title': 'Operate your real estate business with confidence',
      'landing.subtitle': 'MyProperty centralizes portfolio management, billing, and tenant communication into one secure platform so your team can move faster and stay in control.',
      'landing.metrics.properties': 'Properties managed',
      'landing.metrics.availability': 'Platform availability',
      'landing.metrics.collaboration': 'Team collaboration',
      'landing.card.title': 'Portfolio Overview',
      'landing.card.live': 'Live',
      'landing.card.occupancy': 'Occupancy',
      'landing.card.openInvoices': 'Open invoices',
      'landing.card.pendingTickets': 'Pending tickets',
      'landing.card.responseTime': 'Message response time',
      'landing.card.responseTimeValue': 'Under 2 hours',
      'landing.card.cashFlow': 'Cash flow',
      'landing.feature.operations.title': 'Property Operations',
      'landing.feature.operations.desc': 'Organize portfolios, monitor occupancy, and keep all property records in one system.',
      'landing.feature.billing.title': 'Billing and Invoices',
      'landing.feature.billing.desc': 'Track invoicing status and cash flow with clear financial visibility across properties.',
      'landing.feature.communication.title': 'Tenant Communication',
      'landing.feature.communication.desc': 'Respond faster with integrated messaging and keep a full conversation history.',
      'signup.title': 'Create your account',
      'signup.subtitle': 'Register with MyProperty to access property operations, invoicing and tenant communication tools.',
      'signup.firstName': 'First name',
      'signup.lastName': 'Last name',
      'signup.username': 'Username (optional)',
      'signup.email': 'Email',
      'signup.phone': 'Phone (optional)',
      'signup.password': 'Password',
      'signup.confirmPassword': 'Confirm password',
      'signup.error.email': 'Valid email is required.',
      'signup.error.password': 'Password must have at least 8 characters.',
      'signup.error.passwordMismatch': 'Passwords do not match.',
      'signup.submit': 'Create account',
      'signup.submitting': 'Creating account...',
      'signup.backHome': 'Back to home',
      'signup.success': 'Account created successfully. You can now login.',
      'signup.error.generic': 'Could not create account. Please try again.'
    },
    pt: {
      'nav.home': 'Inicio',
      'nav.dashboard': 'Painel',
      'nav.properties': 'Propriedades',
      'nav.invoices': 'Faturas',
      'nav.chat': 'Chat',
      'nav.login': 'Entrar',
      'nav.signup': 'Criar conta',
      'nav.logout': 'Sair',
      'nav.language': 'Idioma',
      'lang.en': 'Ingles',
      'lang.pt': 'Portugues',
      'lang.fr': 'Frances',
      'lang.es': 'Espanhol',
      'landing.badge': 'Gestao inteligente de propriedades',
      'landing.title': 'Gerencie seu negocio imobiliario com confianca',
      'landing.subtitle': 'MyProperty centraliza carteira de propriedades, faturamento e comunicacao com inquilinos em uma plataforma segura para acelerar seu time.',
      'landing.metrics.properties': 'Propriedades gerenciadas',
      'landing.metrics.availability': 'Disponibilidade da plataforma',
      'landing.metrics.collaboration': 'Colaboracao da equipe',
      'landing.card.title': 'Visao geral do portfolio',
      'landing.card.live': 'Ao vivo',
      'landing.card.occupancy': 'Ocupacao',
      'landing.card.openInvoices': 'Faturas abertas',
      'landing.card.pendingTickets': 'Chamados pendentes',
      'landing.card.responseTime': 'Tempo de resposta',
      'landing.card.responseTimeValue': 'Menos de 2 horas',
      'landing.card.cashFlow': 'Fluxo de caixa',
      'landing.feature.operations.title': 'Operacoes de propriedades',
      'landing.feature.operations.desc': 'Organize o portfolio, acompanhe ocupacao e mantenha os registros em um unico sistema.',
      'landing.feature.billing.title': 'Cobranca e faturas',
      'landing.feature.billing.desc': 'Acompanhe status das faturas e fluxo de caixa com visibilidade financeira clara.',
      'landing.feature.communication.title': 'Comunicacao com inquilinos',
      'landing.feature.communication.desc': 'Responda mais rapido com mensagens integradas e historico completo.',
      'signup.title': 'Crie sua conta',
      'signup.subtitle': 'Cadastre-se no MyProperty para acessar operacoes de propriedades, faturamento e comunicacao.',
      'signup.firstName': 'Nome',
      'signup.lastName': 'Sobrenome',
      'signup.username': 'Usuario (opcional)',
      'signup.email': 'Email',
      'signup.phone': 'Telefone (opcional)',
      'signup.password': 'Senha',
      'signup.confirmPassword': 'Confirmar senha',
      'signup.error.email': 'Email valido e obrigatorio.',
      'signup.error.password': 'A senha deve ter pelo menos 8 caracteres.',
      'signup.error.passwordMismatch': 'As senhas nao conferem.',
      'signup.submit': 'Criar conta',
      'signup.submitting': 'Criando conta...',
      'signup.backHome': 'Voltar para inicio',
      'signup.success': 'Conta criada com sucesso. Voce ja pode entrar.',
      'signup.error.generic': 'Nao foi possivel criar a conta. Tente novamente.'
    },
    fr: {
      'nav.home': 'Accueil',
      'nav.dashboard': 'Tableau de bord',
      'nav.properties': 'Biens',
      'nav.invoices': 'Factures',
      'nav.chat': 'Chat',
      'nav.login': 'Connexion',
      'nav.signup': 'Inscription',
      'nav.logout': 'Se deconnecter',
      'nav.language': 'Langue',
      'lang.en': 'Anglais',
      'lang.pt': 'Portugais',
      'lang.fr': 'Francais',
      'lang.es': 'Espagnol',
      'landing.badge': 'Gestion immobiliere intelligente',
      'landing.title': 'Gerez votre activite immobiliere en toute confiance',
      'landing.subtitle': 'MyProperty centralise portefeuille, facturation et communication avec les locataires dans une plateforme securisee.',
      'landing.metrics.properties': 'Biens geres',
      'landing.metrics.availability': 'Disponibilite de la plateforme',
      'landing.metrics.collaboration': 'Collaboration equipe',
      'landing.card.title': 'Vue du portefeuille',
      'landing.card.live': 'En direct',
      'landing.card.occupancy': 'Occupation',
      'landing.card.openInvoices': 'Factures ouvertes',
      'landing.card.pendingTickets': 'Tickets en attente',
      'landing.card.responseTime': 'Temps de reponse',
      'landing.card.responseTimeValue': 'Moins de 2 heures',
      'landing.card.cashFlow': 'Tresorerie',
      'landing.feature.operations.title': 'Operations immobilieres',
      'landing.feature.operations.desc': 'Organisez le portefeuille, suivez l occupation et gardez tous les dossiers centralises.',
      'landing.feature.billing.title': 'Facturation',
      'landing.feature.billing.desc': 'Suivez les factures et les flux financiers avec une vision claire.',
      'landing.feature.communication.title': 'Communication locataires',
      'landing.feature.communication.desc': 'Repondez plus vite avec une messagerie integree et un historique complet.',
      'signup.title': 'Creez votre compte',
      'signup.subtitle': 'Inscrivez-vous sur MyProperty pour acceder aux operations, a la facturation et a la communication.',
      'signup.firstName': 'Prenom',
      'signup.lastName': 'Nom',
      'signup.username': 'Nom d utilisateur (optionnel)',
      'signup.email': 'Email',
      'signup.phone': 'Telephone (optionnel)',
      'signup.password': 'Mot de passe',
      'signup.confirmPassword': 'Confirmer le mot de passe',
      'signup.error.email': 'Un email valide est requis.',
      'signup.error.password': 'Le mot de passe doit contenir au moins 8 caracteres.',
      'signup.error.passwordMismatch': 'Les mots de passe ne correspondent pas.',
      'signup.submit': 'Creer un compte',
      'signup.submitting': 'Creation du compte...',
      'signup.backHome': 'Retour a l accueil',
      'signup.success': 'Compte cree avec succes. Vous pouvez vous connecter.',
      'signup.error.generic': 'Impossible de creer le compte. Veuillez reessayer.'
    },
    es: {
      'nav.home': 'Inicio',
      'nav.dashboard': 'Panel',
      'nav.properties': 'Propiedades',
      'nav.invoices': 'Facturas',
      'nav.chat': 'Chat',
      'nav.login': 'Iniciar sesion',
      'nav.signup': 'Registrarse',
      'nav.logout': 'Cerrar sesion',
      'nav.language': 'Idioma',
      'lang.en': 'Ingles',
      'lang.pt': 'Portugues',
      'lang.fr': 'Frances',
      'lang.es': 'Espanol',
      'landing.badge': 'Gestion inteligente de propiedades',
      'landing.title': 'Gestiona tu negocio inmobiliario con confianza',
      'landing.subtitle': 'MyProperty centraliza cartera de propiedades, facturacion y comunicacion con inquilinos en una plataforma segura.',
      'landing.metrics.properties': 'Propiedades gestionadas',
      'landing.metrics.availability': 'Disponibilidad de la plataforma',
      'landing.metrics.collaboration': 'Colaboracion del equipo',
      'landing.card.title': 'Resumen de cartera',
      'landing.card.live': 'En vivo',
      'landing.card.occupancy': 'Ocupacion',
      'landing.card.openInvoices': 'Facturas abiertas',
      'landing.card.pendingTickets': 'Tickets pendientes',
      'landing.card.responseTime': 'Tiempo de respuesta',
      'landing.card.responseTimeValue': 'Menos de 2 horas',
      'landing.card.cashFlow': 'Flujo de caja',
      'landing.feature.operations.title': 'Operaciones de propiedades',
      'landing.feature.operations.desc': 'Organiza la cartera, monitorea ocupacion y conserva los registros en un solo sistema.',
      'landing.feature.billing.title': 'Cobranza y facturas',
      'landing.feature.billing.desc': 'Controla facturas y flujo financiero con visibilidad clara.',
      'landing.feature.communication.title': 'Comunicacion con inquilinos',
      'landing.feature.communication.desc': 'Responde mas rapido con mensajeria integrada e historial completo.',
      'signup.title': 'Crea tu cuenta',
      'signup.subtitle': 'Registrate en MyProperty para acceder a operaciones, facturacion y comunicacion.',
      'signup.firstName': 'Nombre',
      'signup.lastName': 'Apellido',
      'signup.username': 'Usuario (opcional)',
      'signup.email': 'Email',
      'signup.phone': 'Telefono (opcional)',
      'signup.password': 'Contrasena',
      'signup.confirmPassword': 'Confirmar contrasena',
      'signup.error.email': 'Se requiere un email valido.',
      'signup.error.password': 'La contrasena debe tener al menos 8 caracteres.',
      'signup.error.passwordMismatch': 'Las contrasenas no coinciden.',
      'signup.submit': 'Crear cuenta',
      'signup.submitting': 'Creando cuenta...',
      'signup.backHome': 'Volver al inicio',
      'signup.success': 'Cuenta creada con exito. Ya puedes iniciar sesion.',
      'signup.error.generic': 'No se pudo crear la cuenta. Intentalo nuevamente.'
    }
  };

  readonly supportedLanguages: LanguageCode[] = ['en', 'pt', 'fr', 'es'];
  readonly language$ = new BehaviorSubject<LanguageCode>(this.defaultLanguage);

  init(): void {
    if (this.initialized) {
      return;
    }

    const stored = localStorage.getItem(this.storageKey);
    const browser = navigator.language?.toLowerCase().slice(0, 2) as LanguageCode;
    const initial = this.resolveLanguage(stored) ?? this.resolveLanguage(browser) ?? this.defaultLanguage;

    this.setLanguage(initial);
    this.initialized = true;
  }

  get currentLanguage(): LanguageCode {
    return this.language$.value;
  }

  setLanguage(language: LanguageCode): void {
    const resolved = this.resolveLanguage(language) ?? this.defaultLanguage;
    if (resolved !== this.language$.value) {
      this.language$.next(resolved);
    }

    localStorage.setItem(this.storageKey, resolved);
    document.documentElement.lang = resolved;
  }

  translate(key: string): string {
    const current = this.translations[this.currentLanguage]?.[key];
    if (current) {
      return current;
    }

    return this.translations[this.defaultLanguage][key] ?? key;
  }

  private resolveLanguage(value: string | null | undefined): LanguageCode | null {
    if (!value) {
      return null;
    }

    return this.supportedLanguages.includes(value as LanguageCode) ? (value as LanguageCode) : null;
  }
}


