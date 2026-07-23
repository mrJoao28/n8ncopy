"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { AiProviderConfig } from "@/config/ai-providers";

const formSchema = z.object({
  model: z.string().min(1, { message: "Select a model" }),
  prompt: z.string().min(1, { message: "Enter a prompt" }),
});

export type AiNodeFormValues = z.infer<typeof formSchema>;

interface Props {
  provider: AiProviderConfig;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AiNodeFormValues) => void;
  defaultValues?: Partial<AiNodeFormValues>;
}

export const AiNodeDialog = ({
  provider,
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<AiNodeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      model: defaultValues.model || provider.defaultModel,
      prompt: defaultValues.prompt || "",
    },
  });

  // Reseta o form com os valores atuais sempre que o dialog for reaberto
  useEffect(() => {
    if (open) {
      form.reset({
        model: defaultValues.model || provider.defaultModel,
        prompt: defaultValues.prompt || "",
      });
    }
  }, [open, defaultValues, form, provider.defaultModel]);

  const handleSubmit = (values: AiNodeFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{provider.label}</DialogTitle>
          <DialogDescription>
            Sends a prompt to {provider.label} and returns the generated text.{" "}
            {provider.pricingNote}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8 mt-4"
          >
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {provider.models.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Uses the <code>{provider.apiKeyEnvVar}</code> environment
                    variable for authentication.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Summarize {{httpResponse.data}}"
                      className="min-h-32 font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Supports Handlebars templating using data from earlier
                    nodes, e.g. {"{{formResponse.responses.Email}}"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};