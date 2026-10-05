import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { createMutationHookFromTemplate } from 'erpez-shared-lib';
import { acceptInvitationRequest } from '~/features/tenant-member/handlers/acceptInvitationRequest';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '~/components/ui/card';
import { ShieldCheck, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

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
  const tokenFromUrl = searchParams.get('token') || '';
  const [token, setToken] = useState(tokenFromUrl);
  const [isSuccess, setIsSuccess] = useState(false);

  const acceptMutation = useAcceptInvitation();

  useEffect(() => {
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const handleAccept = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!token.trim()) {
      toast.error('Invitation token is required.');
      return;
    }

    try {
      await acceptMutation.mutateAsync({
        pathParams: {},
        payload: { invitationToken: token.trim() },
      });
      setIsSuccess(true);
      toast.success('Invitation accepted successfully! Redirecting...');
      setTimeout(() => {
        window.location.href = '/overview';
      }, 1500);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to accept invitation. The token may be expired or invalid.';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <Card className="w-full max-w-md shadow-xl border-slate-200 dark:border-slate-800">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600">
            {isSuccess ? <CheckCircle2 className="h-6 w-6 text-emerald-600" /> : <ShieldCheck className="h-6 w-6" />}
          </div>
          <CardTitle className="text-xl font-bold">
            {isSuccess ? 'Invitation Accepted!' : 'Join Workspace'}
          </CardTitle>
          <CardDescription>
            {isSuccess
              ? 'Your account has been bound to the workspace. Taking you to your workspace now...'
              : 'Accept your invitation to join this organization and access authorized ERP workflows.'}
          </CardDescription>
        </CardHeader>

        {!isSuccess && (
          <form onSubmit={handleAccept}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token" className="text-xs font-semibold">
                  Invitation Token
                </Label>
                <Input
                  id="token"
                  placeholder="Paste your 32-byte invitation token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="font-mono text-xs"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-medium"
                disabled={acceptMutation.isPending || !token.trim()}
              >
                {acceptMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Accepting Invitation...
                  </>
                ) : (
                  <>
                    Accept Invitation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground"
                onClick={() => navigate('/overview')}
              >
                Go to Overview
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
