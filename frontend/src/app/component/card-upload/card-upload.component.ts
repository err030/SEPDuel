// card-upload.component.ts
import {Component, OnInit} from '@angular/core';
import { FileUploadService } from '../../service/file-upload.service';
import {NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import { Card } from '../../model/card.model';
import {Global} from "../../global";
import {CardService} from "../../service/card.service";
import {HttpClient} from "@angular/common/http";

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
export class CardUploadComponent implements OnInit{
  selectedFile!: File;
  cards: Card[] = []
  uniqueCards: Card[] = []

  constructor(private uploadService: FileUploadService, private http: HttpClient) { }

  ngOnInit() {
    this.getAllCards()
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  upload(): void {
    this.uploadService.uploadFile(this.selectedFile).subscribe(
      (cards) => {
        this.getAllCards()
        console.log('Upload success')
      },
      (error) => console.error('Upload failed: ' + error))
      // next: (response) => console.log('Upload success', response),

      // error: (error) => console.error('Upload failed', error)

  }

  getAllCards(): void {
    this.http.get(Global.backendUrl + "/admin/getAllCards").subscribe(
      (card:any) => {
        this.cards = this.uniqueCardsByName(card)
      },
      error => console.log("error", error)
    )
  }

  uniqueCardsByName(cards: Card[]): Card[] {
    const names = new Set();
    return cards.filter(card => {
      if (!names.has(card.name)) {
        names.add(card.name);
        return true;
      }
      return false;
    });
  }

  // protected readonly Card = Card;

  deleteCard(name: string) {
    this.uploadService.deleteCard(name).subscribe(
      () => {
        this.cards = this.cards.filter(card => card.name !== name);
      },
      error => console.error('Delete failed: ' + error)
    )
  }

  protected readonly Global = Global;
}
