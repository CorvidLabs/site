import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ZIndexManagerService {
  private zIndexCounter = 100; // Start with a base z-index

  /**
   * Returns a new z-index value that is higher than any previously issued value.
   */
  public getNextZIndex(): number {
    return ++this.zIndexCounter;
  }
}