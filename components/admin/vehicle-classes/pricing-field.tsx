"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Check } from "lucide-react";
import { toast } from "sonner";

interface PricingFieldProps {
  label: string;
  description: string;
  unit: string;
  value: string;
  onChange: (value: string) => void;
  min: string;
  step: string;
  placeholder?: string;
  parseValue: (raw: string) => number | null;
  invalidMessage: string;
  successMessage: string;
  errorMessage: string;
  save: (value: number) => Promise<unknown>;
}

export function PricingField({
  label,
  description,
  unit,
  value,
  onChange,
  min,
  step,
  placeholder,
  parseValue,
  invalidMessage,
  successMessage,
  errorMessage,
  save,
}: PricingFieldProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const parsed = parseValue(value);
    if (parsed === null) {
      toast.error(invalidMessage);
      return;
    }

    setIsSaving(true);
    try {
      await save(parsed);
      toast.success(successMessage);
    } catch {
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
      <div className="flex-1">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24"
          placeholder={placeholder}
        />
        <span className="text-sm text-muted-foreground">{unit}</span>
        <Button
          size="icon"
          variant="outline"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
