import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { createMutationHookFromTemplate } from 'erpez-shared-lib';
import { acceptInvitationRequest } from '~/features/tenant-member/handlers/acceptInvitationRequest';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '~/components/ui/card';
import { ShieldCheck, Loader2, ArrowRight, CheckCircle2, AlertCircle, LogOut, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useClerkAuth } from '~/providers/ClerkAuthProvider';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { getDashboardUrl } from '~/config/env';

export function meta() {
  return [
    { title: 'Accept Workspace Invitation - ERPEZ' },
    { name: 'description', content: 'Accept your invitation to join an ERPEZ workspace' },
  ];
}

const useAcceptInvitation = createMutationHookFromTemplate(acceptInvitationRequest);

export default function AcceptInvitationRoute() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, isInitialized, user, logout } = useClerkAuth();

  const tokenFromUrl = searchParams.get('token') || '';
  const [token, setToken] = useState(() => {
    if (tokenFromUrl) return tokenFromUrl;
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('pending_invitation_token') || '';
    }
    return '';
  });

  const [authMode, setAuthMode] = useState<'sign-up' | 'sign-in'>('sign-up');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const acceptMutation = useAcceptInvitation();
  const autoAcceptAttempted = useRef(false);

  useEffect(() => {
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      try {
        sessionStorage.setItem('pending_invitation_token', tokenFromUrl);
      } catch {
        // Ignore storage errors
      }
    }
  }, [tokenFromUrl]);

  const executeAccept = async (tokenToUse: string) => {
    const effectiveToken = tokenToUse.trim() || 'auto';

    setErrorMessage(null);
    try {
      await acceptMutation.mutateAsync({
        pathParams: {},
        payload: { invitationToken: effectiveToken },
      });
      setIsSuccess(true);
      try {
        sessionStorage.removeItem('pending_invitation_token');
      } catch {
        // Ignore storage errors
      }
      await queryClient.invalidateQueries();
      toast.success('Invitation accepted! Taking you to your ERP workspace...');
      const dashboardUrl = getDashboardUrl();
      setTimeout(() => {
        window.location.href = `${dashboardUrl}/v2/overview`;
      }, 1200);
    } catch (err: unknown) {
      let msg = 'Failed to accept invitation. The token may be expired or invalid.';
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response;
        if (response?.data?.message) {
          msg = response.data.message;
        }
      }
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  // Seamless Auto-Accept: Once the user is authenticated, auto-accept immediately!
  useEffect(() => {
    if (
      isInitialized &&
      isAuthenticated &&
      (token.trim() || user?.email) &&
      !isSuccess &&
      !errorMessage &&
      !acceptMutation.isPending &&
      !autoAcceptAttempted.current
    ) {
      autoAcceptAttempted.current = true;
      executeAccept(token.trim() || 'auto');
    }
  }, [isInitialized, isAuthenticated, token, user?.email, isSuccess, errorMessage, acceptMutation.isPending]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="flex flex-col items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          Verifying invitation...
        </div>
      </div>
    );
  }

  // State 1: Authenticated & Successfully Accepted
  if (isSuccess) {
    const dashboardUrl = getDashboardUrl();
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <Card className="w-full max-w-md shadow-xl border-slate-200 dark:border-slate-800 text-center p-6">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Welcome to the Workspace!
          </CardTitle>
          <CardDescription className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Your invitation was successfully accepted. Redirecting you directly to the ERP Workspace Dashboard...
          </CardDescription>
          <div className="mt-6 flex flex-col items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <a
              href={`${dashboardUrl}/v2/overview`}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Click here if not redirected automatically
            </a>
          </div>
        </Card>
      </div>
    );
  }

  // State 2: Authenticated & Processing Auto-Accept
  if (isAuthenticated && acceptMutation.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <Card className="w-full max-w-md shadow-xl border-slate-200 dark:border-slate-800 text-center p-6">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
          <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Joining Workspace...
          </CardTitle>
          <CardDescription className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Connecting your account (<strong>{user?.email}</strong>) to the organization. Please wait a moment...
          </CardDescription>
        </Card>
      </div>
    );
  }

  // State 3: Authenticated with Error (e.g. Email mismatch or expired token)
  if (isAuthenticated && errorMessage) {
    const isAccountMismatch = errorMessage.toLowerCase().includes('does not match') ||
                              errorMessage.toLowerCase().includes('already a member') ||
                              errorMessage.toLowerCase().includes('already an active member');
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <Card className="w-full max-w-md shadow-xl border-slate-200 dark:border-slate-800">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <AlertCircle className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-bold">
              {isAccountMismatch ? 'Account Mismatch' : 'Invitation Notice'}
            </CardTitle>
            <CardDescription className="mt-1 text-sm">
              {errorMessage}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-2">
            {isAccountMismatch ? (
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
                onClick={() => {
                  autoAcceptAttempted.current = false;
                  setErrorMessage(null);
                  logout();
                }}
              >
                <LogOut className="h-4 w-4" />
                Sign Out & Switch Account
              </Button>
            ) : (
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  autoAcceptAttempted.current = false;
                  executeAccept(token);
                }}
              >
                Retry Acceptance
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground"
              onClick={() => navigate('/overview')}
            >
              Continue to Overview
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // State 4: Authenticated, but no token detected in URL or storage
  if (isAuthenticated && !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <Card className="w-full max-w-md shadow-xl border-slate-200 dark:border-slate-800">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Building2 className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-bold">Enter Invitation Token</CardTitle>
            <CardDescription>
              Authenticated as <strong>{user?.email}</strong>. Please enter the invitation token to join.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="manual-token" className="text-xs font-semibold">Invitation Token</Label>
              <Input
                id="manual-token"
                placeholder="Paste invitation token (e.g. inv_...)"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!token.trim() || acceptMutation.isPending}
              onClick={() => executeAccept(token.trim())}
            >
              Accept Invitation
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // State 5: Unauthenticated — Embed Clerk Sign-In / Sign-Up directly on this page!
  // The user NEVER leaves localhost:5173, avoiding all Clerk hosted developer redirect screens.
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center space-y-1">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 shadow-inner dark:bg-blue-950/60 dark:text-blue-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Join ERPEZ Workspace
          </h1>
          <p className="text-xs text-muted-foreground">
            You've been invited to collaborate. Sign in or register below to automatically enter your workspace.
          </p>
        </div>

        {/* Tab switch between Sign Up and Sign In */}
        <div className="flex rounded-lg bg-slate-200/70 p-1 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setAuthMode('sign-up')}
            className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
              authMode === 'sign-up'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Create New Account
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('sign-in')}
            className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
              authMode === 'sign-in'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            I Already Have an Account
          </button>
        </div>

        {/* Embedded Clerk Component directly on localhost:5173 */}
        <div className="flex justify-center pt-2">
          {authMode === 'sign-up' ? (
            <SignUp
              routing="hash"
              fallbackRedirectUrl={token ? `/accept-invitation?token=${encodeURIComponent(token)}` : '/accept-invitation'}
              forceRedirectUrl={token ? `/accept-invitation?token=${encodeURIComponent(token)}` : '/accept-invitation'}
            />
          ) : (
            <SignIn
              routing="hash"
              fallbackRedirectUrl={token ? `/accept-invitation?token=${encodeURIComponent(token)}` : '/accept-invitation'}
              forceRedirectUrl={token ? `/accept-invitation?token=${encodeURIComponent(token)}` : '/accept-invitation'}
            />
          )}
        </div>
      </div>
    </div>
  );
}
