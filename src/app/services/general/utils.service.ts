import { HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {MatDialog} from '@angular/material/dialog';

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
}