// card-upload.component.ts
import { Component } from '@angular/core';
import { FileUploadService } from '../../service/file-upload.service';
import {NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import { Card } from '../../model/card.model';
import {Global} from "../../global";

@Component({
  selector: 'app-card-upload',
  templateUrl: './card-upload.component.html',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    NgOptimizedImage
  ],
  styleUrls: ['./card-upload.component.css']
})
export class CardUploadComponent {
  selectedFile!: File;
  cards: Card[] = []

  constructor(private uploadService: FileUploadService) { }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  upload(): void {
    this.uploadService.uploadFile(this.selectedFile).subscribe(
      (cards) => this.cards = cards,
      (error) => console.error('Upload failed: ' + error))
      // next: (response) => console.log('Upload success', response),

      // error: (error) => console.error('Upload failed', error)

  }

  // protected readonly Card = Card;

  deleteCard(cardId: number) {
    this.uploadService.deleteCard(cardId).subscribe(
      () => {
        this.cards = this.cards.filter(card => card.id !== cardId);
      },
      error => console.error('Delete failed: ' + error)
    )
  }

  protected readonly Global = Global;
}
