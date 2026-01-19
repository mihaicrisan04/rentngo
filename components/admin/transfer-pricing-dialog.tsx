"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, X, Check, RefreshCw } from "lucide-react";

const tierSchema = z.object({
  minExtraKm: z.coerce.number().min(0, "Min KM must be 0 or greater"),
  maxExtraKm: z.coerce.number().optional(),
  pricePerKm: z.coerce.number().min(0.01, "Price must be greater than 0"),
});

type TierFormData = z.infer<typeof tierSchema>;

interface TransferPricingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransferPricingDialog({
  open,
  onOpenChange,
}: TransferPricingDialogProps) {
  const tiers = useQuery(api.transferPricing.listTiers, { activeOnly: false });
  const createTier = useMutation(api.transferPricing.createTier);
  const updateTier = useMutation(api.transferPricing.updateTier);
  const deleteTier = useMutation(api.transferPricing.deleteTier);
  const seedTiers = useMutation(api.transferPricing.seedDefaultTiers);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<Id<"transferPricingTiers"> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TierFormData>({
    resolver: zodResolver(tierSchema),
    defaultValues: {
      minExtraKm: 0,
      maxExtraKm: undefined,
      pricePerKm: 1.0,
    },
  });

  const editForm = useForm<TierFormData>({
    resolver: zodResolver(tierSchema),
  });

  const handleAdd = async (values: TierFormData) => {
    setIsSubmitting(true);
    try {
      await createTier({
        minExtraKm: values.minExtraKm,
        maxExtraKm: values.maxExtraKm || undefined,
        pricePerKm: values.pricePerKm,
        isActive: true,
      });
      toast.success("Pricing tier added");
      form.reset();
      setIsAdding(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add tier");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (id: Id<"transferPricingTiers">, values: TierFormData) => {
    setIsSubmitting(true);
    try {
      await updateTier({
        id,
        minExtraKm: values.minExtraKm,
        maxExtraKm: values.maxExtraKm || undefined,
        pricePerKm: values.pricePerKm,
      });
      toast.success("Pricing tier updated");
      setEditingId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update tier");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (id: Id<"transferPricingTiers">, isActive: boolean) => {
    try {
      await updateTier({ id, isActive });
      toast.success(isActive ? "Tier activated" : "Tier deactivated");
    } catch (error) {
      toast.error("Failed to update tier status");
    }
  };

  const handleDelete = async (id: Id<"transferPricingTiers">) => {
    if (!confirm("Are you sure you want to delete this pricing tier?")) return;

    try {
      await deleteTier({ id });
      toast.success("Pricing tier deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete tier");
    }
  };

  const handleSeedDefaults = async () => {
    if (!confirm("This will seed default pricing tiers. Existing tiers must be deleted first. Continue?")) return;

    try {
      await seedTiers({});
      toast.success("Default pricing tiers created");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to seed tiers");
    }
  };

  const startEditing = (tier: NonNullable<typeof tiers>[number]) => {
    setEditingId(tier._id);
    editForm.reset({
      minExtraKm: tier.minExtraKm,
      maxExtraKm: tier.maxExtraKm,
      pricePerKm: tier.pricePerKm,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transfer Pricing Tiers</DialogTitle>
          <DialogDescription>
            Configure km-range pricing tiers for transfer services. The price per km applies
            to extra kilometers beyond the first 15km (included in base fare).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdding(true)}
              disabled={isAdding}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Tier
            </Button>
            {(!tiers || tiers.length === 0) && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSeedDefaults}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Seed Defaults
              </Button>
            )}
          </div>

          {/* Add Form */}
          {isAdding && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAdd)} className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="minExtraKm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Min Extra KM</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="maxExtraKm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Extra KM</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              placeholder="Unlimited"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pricePerKm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price/KM (EUR)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0.01"
                              step="0.01"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsAdding(false);
                        form.reset();
                      }}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" disabled={isSubmitting}>
                      {isSubmitting ? "Adding..." : "Add Tier"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}

          {/* Tiers Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Extra KM Range</TableHead>
                  <TableHead>Price/KM</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-28">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tiers === undefined ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : tiers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No pricing tiers configured. Add a tier or seed defaults.
                    </TableCell>
                  </TableRow>
                ) : (
                  tiers.map((tier) => (
                    <TableRow key={tier._id}>
                      {editingId === tier._id ? (
                        <>
                          <TableCell colSpan={2}>
                            <Form {...editForm}>
                              <form
                                onSubmit={editForm.handleSubmit((values) => handleEdit(tier._id, values))}
                                className="flex gap-2 items-end"
                              >
                                <FormField
                                  control={editForm.control}
                                  name="minExtraKm"
                                  render={({ field }) => (
                                    <FormItem className="flex-1">
                                      <FormControl>
                                        <Input
                                          type="number"
                                          min="0"
                                          step="1"
                                          {...field}
                                          disabled={isSubmitting}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                                <span className="text-muted-foreground">-</span>
                                <FormField
                                  control={editForm.control}
                                  name="maxExtraKm"
                                  render={({ field }) => (
                                    <FormItem className="flex-1">
                                      <FormControl>
                                        <Input
                                          type="number"
                                          min="0"
                                          step="1"
                                          placeholder="∞"
                                          {...field}
                                          value={field.value ?? ""}
                                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                          disabled={isSubmitting}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                                <span className="text-muted-foreground">km</span>
                                <FormField
                                  control={editForm.control}
                                  name="pricePerKm"
                                  render={({ field }) => (
                                    <FormItem className="flex-1">
                                      <FormControl>
                                        <Input
                                          type="number"
                                          min="0.01"
                                          step="0.01"
                                          {...field}
                                          disabled={isSubmitting}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                                <span className="text-muted-foreground">EUR</span>
                                <Button
                                  type="submit"
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8"
                                  disabled={isSubmitting}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8"
                                  onClick={() => setEditingId(null)}
                                  disabled={isSubmitting}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </form>
                            </Form>
                          </TableCell>
                          <TableCell />
                          <TableCell />
                        </>
                      ) : (
                        <>
                          <TableCell className="font-medium">
                            {tier.minExtraKm} - {tier.maxExtraKm ?? "∞"} km
                          </TableCell>
                          <TableCell>€{tier.pricePerKm.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={tier.isActive}
                                onCheckedChange={(checked) => handleToggleActive(tier._id, checked)}
                              />
                              <Badge variant={tier.isActive ? "default" : "secondary"}>
                                {tier.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => startEditing(tier)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-red-600 hover:text-red-700"
                                onClick={() => handleDelete(tier._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Info section */}
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg space-y-1">
            <p><strong>Formula:</strong> total = base_fare + (extra_km × tier_price × class_multiplier)</p>
            <p><strong>Base fare:</strong> Covers first 15km (configured per vehicle class)</p>
            <p><strong>Extra KM:</strong> Total distance minus 15km</p>
            <p><strong>Class multiplier:</strong> Applied on top of tier pricing (configured per vehicle class)</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
