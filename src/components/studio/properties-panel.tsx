"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sceneSchema, type SceneInput } from "@/lib/schemas";
import { uploadAsset } from "@/lib/upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Save, Image as ImageIcon, Music } from "lucide-react";
import { toast } from "sonner";
import type { Scene, SceneUpdatePayload } from "@/lib/types";

interface PropertiesPanelProps {
  scene: Scene | null;
  onSave: (sceneId: string, data: SceneUpdatePayload) => Promise<void>;
  onAssetUploaded: (assetId: string, url: string) => void;
}

export function PropertiesPanel({
  scene,
  onSave,
  onAssetUploaded,
}: PropertiesPanelProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<"image" | "audio" | null>(null);

  const form = useForm<SceneInput>({
    resolver: zodResolver(sceneSchema),
    defaultValues: {
      script_text: scene?.script_text ?? "",
      duration_seconds: scene?.duration_seconds ?? 5,
    },
  });

  useEffect(() => {
    if (scene) {
      form.reset({
        script_text: scene.script_text ?? "",
        duration_seconds: scene.duration_seconds,
      });
    }
  }, [scene, form]);

  if (!scene) {
    return (
      <div className="flex h-full items-center justify-center border-l text-muted-foreground p-4">
        <p className="text-sm text-center">
          Select a scene to edit its properties
        </p>
      </div>
    );
  }

  const handleSave = async (data: SceneInput) => {
    try {
      await onSave(scene.id, {
        script_text: data.script_text,
        duration_seconds: Number(data.duration_seconds),
      });
      toast.success("Scene saved");
    } catch {
      toast.error("Failed to save scene");
    }
  };

  const handleFileUpload = async (
    type: "image" | "audio",
    file: File | undefined
  ) => {
    if (!file) return;
    setUploading(type);
    try {
      const result = await uploadAsset(file);
      const key = type === "image" ? "image_asset_id" : "audio_asset_id";
      await onSave(scene.id, { [key]: result.asset_id });
      onAssetUploaded(result.asset_id, result.url);
      toast.success(`${type === "image" ? "Image" : "Audio"} uploaded`);
    } catch {
      toast.error(`Failed to upload ${type}`);
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="flex h-full flex-col border-l w-72">
      <div className="border-b px-3 py-2">
        <h2 className="text-sm font-semibold">Properties</h2>
      </div>

      <ScrollArea className="flex-1">
        <form
          onSubmit={form.handleSubmit(handleSave)}
          className="p-3 space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="script_text" className="text-xs">
              Script Text
            </Label>
            <Textarea
              id="script_text"
              className="min-h-[120px] text-sm"
              {...form.register("script_text")}
            />
            {form.formState.errors.script_text && (
              <p className="text-xs text-destructive">
                {form.formState.errors.script_text.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration_seconds" className="text-xs">
              Duration (seconds)
            </Label>
            <Input
              id="duration_seconds"
              type="number"
              step="0.5"
              min="0.1"
              max="120"
              className="text-sm"
              {...form.register("duration_seconds", { valueAsNumber: true })}
            />
            {form.formState.errors.duration_seconds && (
              <p className="text-xs text-destructive">
                {form.formState.errors.duration_seconds.message}
              </p>
            )}
          </div>

          <Button type="submit" size="sm" className="w-full">
            <Save className="mr-2 h-3.5 w-3.5" />
            Save
          </Button>

          <Separator />

          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-2 block">Scene Image</Label>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  handleFileUpload("image", e.target.files?.[0])
                }
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                disabled={uploading === "image"}
                onClick={() => imageInputRef.current?.click()}
              >
                {uploading === "image" ? (
                  "Uploading..."
                ) : (
                  <>
                    <ImageIcon className="mr-2 h-3.5 w-3.5" />
                    {scene.image_asset_id ? "Replace Image" : "Upload Image"}
                  </>
                )}
              </Button>
              {scene.image_asset_id && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  Asset: {scene.image_asset_id.slice(0, 8)}...
                </p>
              )}
            </div>

            <div>
              <Label className="text-xs mb-2 block">Scene Audio</Label>
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) =>
                  handleFileUpload("audio", e.target.files?.[0])
                }
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                disabled={uploading === "audio"}
                onClick={() => audioInputRef.current?.click()}
              >
                {uploading === "audio" ? (
                  "Uploading..."
                ) : (
                  <>
                    <Music className="mr-2 h-3.5 w-3.5" />
                    {scene.audio_asset_id ? "Replace Audio" : "Upload Audio"}
                  </>
                )}
              </Button>
              {scene.audio_asset_id && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  Asset: {scene.audio_asset_id.slice(0, 8)}...
                </p>
              )}
            </div>
          </div>
        </form>
      </ScrollArea>
    </div>
  );
}
