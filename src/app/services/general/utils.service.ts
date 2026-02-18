import { HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {MatDialog} from '@angular/material/dialog';
import { Observable, of } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class UtilsService {

  constructor(
    private dialog: MatDialog
  ) { }

  public static mapObjToParams(obj: any): HttpParams {
    let params = new HttpParams();

    Object.keys(obj).forEach(key => {
      if (obj[key] !== undefined && obj[key] !== null) {
        obj[key] = String(obj[key]);
        params = params.set(key, obj[key]);
      }
    });

    return params;
  }

  public static mapToSnakeCase(obj: any): any {
    const result: any = {};

    Object.keys(obj).forEach(key => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      result[snakeKey] = obj[key];
    });

    return result;
  }

  public static sortByStr(a: string, b: string): number {
    return a.localeCompare(b);
  }

  /**
   * Returns an observable of the list if it exists, otherwise returns the provided observable.
   * @param list The list of items to return.
   * @param obs The observable to return if the list does not exist.
   * @returns An observable of the list or the provided observable.
   */
  public static storageOrObs<T>(list: T[] | null, obs: Observable<T[]>): Observable<T[]> {
    return list ? of(list) : obs;
  }

  /**
   * Save obj json encoded to localstorage
   * @param key The key to save the object under.
   * @param obj The object to save.
   */
  public static saveObjToLocalStorage<T>(key: string, obj: T): void {
    localStorage.setItem(key, JSON.stringify(obj));
  }

  /**
   * Recover obj from localstorage and parse it
   * @param key The key to recover the object from.
   * @returns The recovered object or null if not found.
   */
  public static recoverObjFromLocalStorage<T>(key: string): T | null {
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) as T : null;
  }

  /**
   * Check if a key exists in localStorage
   * @param key The key to check.
   * @returns True if the key exists, false otherwise.
   */
  public static hasLocalStorageItem(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  /**
   * Remove an item from localStorage
   * @param key The key to remove.
   */
  public static removeFromLocalStorage(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Clear gallery-related cache
   */
  public static clearGalleryCache(): void {
    localStorage.removeItem('galleryWindowData');
  }
}