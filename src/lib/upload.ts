import { api } from "./api";
import type { AssetInitResponse, AssetCompleteResponse } from "./types";

export async function uploadAsset(file: File): Promise<AssetCompleteResponse> {
  const init = await api.post<AssetInitResponse>("/studio/assets/init-upload", {
    filename: file.name,
    content_type: file.type,
  });

  await api.upload(init.upload_url, file);

  const complete = await api.post<AssetCompleteResponse>(
    "/studio/assets/complete-upload",
    { asset_id: init.asset_id }
  );

  return complete;
}
