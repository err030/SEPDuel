// file-upload.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {Global} from "../global";
import {Card} from "../model/card.model";


@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  constructor(private http: HttpClient) { }

  uploadFile(file: File): Observable<Card[]> {
    const formData: FormData = new FormData();
    formData.append('file', file);

    return this.http.post<any>(Global.backendUrl+ "/admin/cards/upload", formData).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    return throwError(
      'Something bad happened; please try again later.');
  }

  deleteCard(cardId: number): Observable<void> {
    const url = `${Global.backendUrl}/admin/deleteCard/${cardId}`;
    return this.http.delete<void>(url).pipe(catchError(this.handleError));
  }
}
