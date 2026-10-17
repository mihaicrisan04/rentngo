"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/admin/shared/empty-state";
import { WalletDialog } from "@/components/admin/shared/wallet-dialog";
import { Users, Wallet } from "lucide-react";

/**
 * Customer lookup whose only action is the wallet dialog: an offline referral
 * is credited to a user who may never become an affiliate. Profile editing
 * still lives in Clerk.
 */
export function UsersManagement() {
  const [query, setQuery] = React.useState("");
  const [deferredQuery, setDeferredQuery] = React.useState("");
  const users = useQuery(api.users.searchUsers, { query: deferredQuery });
  const [viewingWallet, setViewingWallet] = React.useState<Id<"users"> | null>(
    null,
  );

  React.useEffect(() => {
    const timer = setTimeout(() => setDeferredQuery(query), 250);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">
          Search customers by name or email and manage their wallet credit
        </p>
      </div>

      <Input
        placeholder="Search by name or email..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-md"
      />

      {users === undefined ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : users.length === 0 ? (
        <EmptyState icon={Users} message="No users match that search." />
      ) : (
        <Table dense>
          <TableHeader sticky>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="text-muted-foreground">
                  {user.phone ?? "—"}
                </TableCell>
                <TableCell>
                  {user.role === "admin" && <Badge>admin</Badge>}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Open wallet"
                    onClick={() => setViewingWallet(user._id)}
                  >
                    <Wallet className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {viewingWallet && (
        <WalletDialog
          userId={viewingWallet}
          open
          onOpenChange={(open) => !open && setViewingWallet(null)}
        />
      )}
    </div>
  );
}
