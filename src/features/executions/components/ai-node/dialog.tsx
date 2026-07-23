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
import { AI_PROVIDER_CREDENTIAL_TYPE, type AiProviderConfig } from "@/config/ai-providers";
import { useCredentialsByType } from "@/features/credentials/hooks/use-credentials";

const NO_CREDENTIAL = "__none__";

const formSchema = z.object({
  model: z.string().min(1, { message: "Select a model" }),
  prompt: z.string().min(1, { message: "Enter a prompt" }),
  credentialId: z.string().optional(),
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
  const credentialType = AI_PROVIDER_CREDENTIAL_TYPE[provider.id];
  const credentials = useCredentialsByType(credentialType);

  const form = useForm<AiNodeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      model: defaultValues.model || provider.defaultModel,
      prompt: defaultValues.prompt || "",
      credentialId: defaultValues.credentialId,
    },
  });

  // Reseta o form com os valores atuais sempre que o dialog for reaberto
  useEffect(() => {
    if (open) {
      form.reset({
        model: defaultValues.model || provider.defaultModel,
        prompt: defaultValues.prompt || "",
        credentialId: defaultValues.credentialId,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultValues, form, provider.defaultModel]);

  const handleSubmit = (values: AiNodeFormValues) => {
    onSubmit({
      ...values,
      credentialId:
        values.credentialId === NO_CREDENTIAL ? undefined : values.credentialId,
    });
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="credentialId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Credential</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || NO_CREDENTIAL}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a credential" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NO_CREDENTIAL}>
                        None (use {provider.apiKeyEnvVar})
                      </SelectItem>
                      {credentials.data?.items.map((credential) => (
                        <SelectItem key={credential.id} value={credential.id}>
                          {credential.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Pick a saved {provider.label} credential, or leave it on
                    &quot;None&quot; to keep using the{" "}
                    <code>{provider.apiKeyEnvVar}</code> environment variable.{" "}
                    Manage credentials from the Credentials page.
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
