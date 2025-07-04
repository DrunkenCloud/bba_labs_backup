"use client";

import { useAuth0 } from '@auth0/auth0-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LogIn, LogOut, User, Loader, CheckCircle, XCircle } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export function AuthCard() {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name[0];
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="text-primary" />
          Authentication
        </CardTitle>
        <CardDescription>
          Manage your session using Auth0.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-center items-center gap-4">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4 w-full">
            <Loader className="animate-spin text-primary" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        ) : isAuthenticated && user ? (
          <div className="text-center space-y-4">
            <Avatar className="h-20 w-20 mx-auto border-2 border-primary shadow-md">
              <AvatarImage src={user.picture} alt={user.name} />
              <AvatarFallback className="text-2xl bg-muted">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className='space-y-1'>
              <h3 className="text-xl font-semibold">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
              <CheckCircle className="mr-1 h-3 w-3" /> Authenticated
            </Badge>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <div className="mx-auto bg-muted rounded-full p-4 w-fit">
               <XCircle className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">You are not authenticated.</p>
          </div>
        )}
      </CardContent>
      <div className="p-6 pt-0 mt-auto">
        {isLoading ? (
            <Button disabled className="w-full">
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Initializing...
            </Button>
        ) : isAuthenticated ? (
          <Button variant="destructive" className="w-full" onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
            <LogOut className="mr-2" />
            Logout
          </Button>
        ) : (
          <Button className="w-full" onClick={() => loginWithRedirect()}>
            <LogIn className="mr-2" />
            Login with Auth0
          </Button>
        )}
      </div>
    </Card>
  );
}
