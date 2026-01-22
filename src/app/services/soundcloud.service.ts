import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { UtilsService } from "./general/utils.service";
import { Observable } from "rxjs";

// Use camelCase and remap it?
export interface SoundCloudRequestParams {
  playlist_urn?: string;
  secret_token?: string;
  access?: string;
  show_tracks?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class SoundcloudService {
  private url = 'https://api.soundcloud.com';

  constructor(private httpClient: HttpClient) {}

  public getPlaylist(playlistId: string): Observable<any> {
    const soundCloudRequest = {
      playlist_urn: `soundcloud:playlists:${playlistId}`,
      show_tracks: true,
      access: 'playable'
    } as SoundCloudRequestParams;
    
    const params = UtilsService.mapObjToParams(soundCloudRequest);

    return this.httpClient.get<any>(`${this.url}/playlists/`, { params });
  }
}