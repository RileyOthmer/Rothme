import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { toast, Toaster } from "sonner";
import {
  FileText,
  ImageIcon,
  Loader2,
  Palette,
  Plus,
  Trash2,
  Type,
  Upload,
  X,
} from "lucide-react";

import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  getBrandAssets,
  saveBrandAssets,
  removeBrandFile,
  type BrandAssetsPayload,
  type BrandColor,
  type BrandFont,
} from "@/lib/brand/brand-assets.functions";

export const Route = createFileRoute("/_authenticated/settings/brand")({
  head: () => ({
    meta: [
      { title: "Brand Assets — ROTHME" },
      { name: "robots", content: "noindex" },
      {
        name: "description",
        content:
          "Upload your logo, brand colors, fonts, images, and guidelines. Rothme AI uses them to keep every generated post on-brand.",
      },
    ],
  }),
  component: BrandAssetsPage,
});

const BUCKET = "brand-assets";

function BrandAssetsPage() {
  const qc = useQueryClient();
  const fetchFn = useServerFn(getBrandAssets);
  const saveFn = useServerFn(saveBrandAssets);
  const removeFn = useServerFn(removeBrandFile);

  const { data, isLoading } = useQuery({
    queryKey: ["brand-assets"],
    queryFn: () => fetchFn() as Promise<BrandAssetsPayload>,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["brand-assets"] });

  type SavePatch = {
    logo_path?: string | null;
    guidelines_path?: string | null;
    image_paths?: string[];
    colors?: BrandColor[];
    fonts?: BrandFont[];
    notes?: string | null;
  };

  const save = useMutation({
    mutationFn: (patch: SavePatch) => saveFn({ data: patch }),
    onSuccess: () => {
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Could not save"),
  });

  const remove = useMutation({
    mutationFn: (path: string) => removeFn({ data: { path } }),
    onError: (e: Error) => toast.error(e.message || "Could not delete file"),
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto max-w-3xl space-y-10 px-4 py-10 sm:px-6">
        <header>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Brand assets
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Your brand, in one place.
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Upload your logo, colors, fonts, and images. Rothme AI uses them
            to keep every post, ad, and update on-brand — you can update any
            of this at any time.
          </p>
        </header>

        {isLoading || !data ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading brand assets…
          </div>
        ) : (
          <div className="space-y-10">
            <LogoSection
              data={data}
              onChange={(logo_path) => save.mutate({ logo_path })}
              onDelete={(path) => {
                remove.mutate(path);
                save.mutate({ logo_path: null });
              }}
              saving={save.isPending}
            />
            <ColorsSection
              value={data.colors}
              onSave={(colors) => save.mutate({ colors })}
              saving={save.isPending}
            />
            <FontsSection
              value={data.fonts}
              onSave={(fonts) => save.mutate({ fonts })}
              saving={save.isPending}
            />
            <ImagesSection
              data={data}
              onChange={(image_paths) => save.mutate({ image_paths })}
              onDelete={(path) => {
                const next = data.images.map((i) => i.path).filter((p) => p !== path);
                remove.mutate(path);
                save.mutate({ image_paths: next });
              }}
              saving={save.isPending}
            />
            <GuidelinesSection
              data={data}
              onChange={(guidelines_path) => save.mutate({ guidelines_path })}
              onDelete={(path) => {
                remove.mutate(path);
                save.mutate({ guidelines_path: null });
              }}
              saving={save.isPending}
            />
            <NotesSection
              value={data.notes ?? ""}
              onSave={(notes) => save.mutate({ notes: notes || null })}
              saving={save.isPending}
            />
          </div>
        )}
      </main>
      <Toaster position="bottom-right" />
    </div>
  );
}

// ---------- Sections -------------------------------------------------------

function SectionHeader({
  icon,
  title,
  hint,
  optional,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
  optional?: boolean;
}) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-md border border-border bg-surface">
            {icon}
          </span>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          {optional && (
            <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              Optional
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}

function LogoSection({
  data,
  onChange,
  onDelete,
  saving,
}: {
  data: BrandAssetsPayload;
  onChange: (path: string) => void;
  onDelete: (path: string) => void;
  saving: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const path = await uploadFile(data.orgId, "logo", file);
      onChange(path);
      toast.success("Logo uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section>
      <SectionHeader
        icon={<ImageIcon className="h-3.5 w-3.5" />}
        title="Logo"
        hint="Your primary logo. PNG or SVG on a transparent background works best."
      />
      <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
        <div className="grid h-20 w-20 place-items-center rounded-lg border border-dashed border-border bg-background">
          {data.logo.url ? (
            <img
              src={data.logo.url}
              alt="Brand logo"
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm text-foreground">
            {data.logo.path ? "Uploaded" : "No logo yet"}
          </p>
          <p className="text-xs text-muted-foreground">
            {data.logo.path
              ? "Replace or remove any time — the AI will use the latest version."
              : "PNG, JPG, WEBP, or SVG · max 5 MB"}
          </p>
        </div>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
              e.target.value = "";
            }}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading || saving}
          >
            {uploading ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="mr-1.5 h-3.5 w-3.5" />
            )}
            {data.logo.path ? "Replace" : "Upload"}
          </Button>
          {data.logo.path && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(data.logo.path!)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

function ColorsSection({
  value,
  onSave,
  saving,
}: {
  value: BrandColor[];
  onSave: (colors: BrandColor[]) => void;
  saving: boolean;
}) {
  const [colors, setColors] = useState<BrandColor[]>(value);
  useEffect(() => setColors(value), [value]);

  const dirty = JSON.stringify(colors) !== JSON.stringify(value);

  const update = (i: number, patch: Partial<BrandColor>) =>
    setColors((c) => c.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));

  const isValid = colors.every((c) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(c.hex));

  return (
    <section>
      <SectionHeader
        icon={<Palette className="h-3.5 w-3.5" />}
        title="Brand colors"
        hint="Your palette. Add hex values — the AI will match imagery and copy tone to them."
      />
      <div className="space-y-2 rounded-xl border border-border bg-surface p-4">
        {colors.length === 0 && (
          <p className="text-xs text-muted-foreground">No colors added yet.</p>
        )}
        {colors.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <label className="relative h-9 w-9 shrink-0 rounded-md border border-border overflow-hidden">
              <input
                type="color"
                value={/^#[0-9a-fA-F]{6}$/.test(c.hex) ? c.hex : "#000000"}
                onChange={(e) => update(i, { hex: e.target.value })}
                className="absolute inset-0 h-full w-full cursor-pointer border-0 bg-transparent p-0"
                aria-label="Pick color"
              />
            </label>
            <Input
              value={c.name}
              onChange={(e) => update(i, { name: e.target.value })}
              placeholder="Name (e.g. Primary)"
              className="max-w-[180px]"
            />
            <Input
              value={c.hex}
              onChange={(e) => update(i, { hex: e.target.value })}
              placeholder="#000000"
              className="max-w-[140px] font-mono"
              aria-invalid={!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(c.hex)}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setColors((cs) => cs.filter((_, idx) => idx !== i))}
              aria-label="Remove color"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setColors((c) => [...c, { name: "", hex: "#000000" }])
            }
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Add color
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onSave(colors);
              toast.success("Colors saved");
            }}
            disabled={!dirty || !isValid || saving}
          >
            Save colors
          </Button>
        </div>
      </div>
    </section>
  );
}

function FontsSection({
  value,
  onSave,
  saving,
}: {
  value: BrandFont[];
  onSave: (fonts: BrandFont[]) => void;
  saving: boolean;
}) {
  const [fonts, setFonts] = useState<BrandFont[]>(value);
  useEffect(() => setFonts(value), [value]);
  const dirty = JSON.stringify(fonts) !== JSON.stringify(value);
  const update = (i: number, patch: Partial<BrandFont>) =>
    setFonts((f) => f.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));

  return (
    <section>
      <SectionHeader
        icon={<Type className="h-3.5 w-3.5" />}
        title="Fonts"
        hint="Which typefaces should Rothme mention when it suggests visuals?"
        optional
      />
      <div className="space-y-2 rounded-xl border border-border bg-surface p-4">
        {fonts.length === 0 && (
          <p className="text-xs text-muted-foreground">No fonts added yet.</p>
        )}
        {fonts.map((f, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={f.name}
              onChange={(e) => update(i, { name: e.target.value })}
              placeholder="Font name (e.g. Inter)"
              className="max-w-[240px]"
            />
            <Input
              value={f.role ?? ""}
              onChange={(e) => update(i, { role: e.target.value })}
              placeholder="Role (e.g. Headings)"
              className="max-w-[200px]"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setFonts((fs) => fs.filter((_, idx) => idx !== i))}
              aria-label="Remove font"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFonts((f) => [...f, { name: "", role: "" }])}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Add font
          </Button>
          <Button
            size="sm"
            onClick={() => {
              const cleaned = fonts.filter((f) => f.name.trim().length > 0);
              onSave(cleaned);
              toast.success("Fonts saved");
            }}
            disabled={!dirty || saving}
          >
            Save fonts
          </Button>
        </div>
      </div>
    </section>
  );
}

function ImagesSection({
  data,
  onChange,
  onDelete,
  saving,
}: {
  data: BrandAssetsPayload;
  onChange: (paths: string[]) => void;
  onDelete: (path: string) => void;
  saving: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList) => {
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const path = await uploadFile(data.orgId, "images", file);
        uploaded.push(path);
      }
      onChange([...(data.images.map((i) => i.path)), ...uploaded]);
      toast.success(`Uploaded ${uploaded.length} image${uploaded.length === 1 ? "" : "s"}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section>
      <SectionHeader
        icon={<ImageIcon className="h-3.5 w-3.5" />}
        title="Images"
        hint="Product shots, team photos, backgrounds — anything the AI can pull from when composing posts."
      />
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {data.images.map((img) => (
            <div
              key={img.path}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-background"
            >
              {img.url ? (
                <img
                  src={img.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-muted-foreground">
                  <ImageIcon className="h-5 w-5" />
                </div>
              )}
              <button
                type="button"
                onClick={() => onDelete(img.path)}
                className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-md bg-background/80 text-foreground opacity-0 shadow-sm backdrop-blur transition-opacity hover:bg-background group-hover:opacity-100"
                aria-label="Remove image"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading || saving}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-background text-xs text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? "Uploading…" : "Add images"}
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) void handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
    </section>
  );
}

function GuidelinesSection({
  data,
  onChange,
  onDelete,
  saving,
}: {
  data: BrandAssetsPayload;
  onChange: (path: string) => void;
  onDelete: (path: string) => void;
  saving: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const path = await uploadFile(data.orgId, "guidelines", file);
      onChange(path);
      toast.success("Guidelines uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const filename = data.guidelines.path?.split("/").pop() ?? null;

  return (
    <section>
      <SectionHeader
        icon={<FileText className="h-3.5 w-3.5" />}
        title="Brand guidelines"
        hint="Upload your brand book, style guide, or tone document (PDF preferred)."
        optional
      />
      <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
        <div className="grid h-12 w-12 place-items-center rounded-lg border border-border bg-background text-muted-foreground">
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-foreground">
            {filename ?? "No guidelines uploaded"}
          </p>
          <p className="text-xs text-muted-foreground">
            PDF, DOCX, or TXT · max 20 MB
          </p>
        </div>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
              e.target.value = "";
            }}
          />
          {data.guidelines.url && (
            <Button variant="ghost" size="sm" asChild>
              <a href={data.guidelines.url} target="_blank" rel="noreferrer">
                View
              </a>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading || saving}
          >
            {uploading ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="mr-1.5 h-3.5 w-3.5" />
            )}
            {data.guidelines.path ? "Replace" : "Upload"}
          </Button>
          {data.guidelines.path && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(data.guidelines.path!)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

function NotesSection({
  value,
  onSave,
  saving,
}: {
  value: string;
  onSave: (notes: string) => void;
  saving: boolean;
}) {
  const [notes, setNotes] = useState(value);
  useEffect(() => setNotes(value), [value]);
  const dirty = notes !== value;

  return (
    <section>
      <SectionHeader
        icon={<Type className="h-3.5 w-3.5" />}
        title="Voice & notes"
        hint="Anything the AI should know about tone, words to avoid, or how to talk about your brand."
        optional
      />
      <div className="space-y-2 rounded-xl border border-border bg-surface p-4">
        <Label htmlFor="brand-notes" className="sr-only">
          Brand notes
        </Label>
        <Textarea
          id="brand-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Warm and direct. Never sound corporate. Never use the word 'solutions'."
          rows={5}
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            disabled={!dirty || saving}
            onClick={() => {
              onSave(notes.trim());
              toast.success("Notes saved");
            }}
          >
            Save notes
          </Button>
        </div>
      </div>
    </section>
  );
}

// ---------- Upload helper --------------------------------------------------

/**
 * Uploads directly to Supabase Storage from the browser using the user's
 * session. The `brand-assets` bucket is private and RLS-scoped by org —
 * every path starts with `{orgId}/`.
 */
async function uploadFile(
  orgId: string,
  folder: "logo" | "images" | "guidelines",
  file: File,
): Promise<string> {
  const cleanName = file.name.replace(/[^\w.\-]+/g, "_").slice(0, 120);
  const path = `${orgId}/${folder}/${Date.now()}-${cleanName}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: false,
    cacheControl: "3600",
    contentType: file.type || undefined,
  });
  if (error) throw new Error(error.message);
  return path;
}
