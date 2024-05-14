// card-upload.component.ts
import { Component } from '@angular/core';
import { FileUploadService } from '../../service/file-upload.service';

@Component({
  selector: 'app-card-upload',
  templateUrl: './card-upload.component.html',
  standalone: true,
  styleUrls: ['./card-upload.component.css']
})
export class CardUploadComponent {
  selectedFile!: File;

  constructor(private uploadService: FileUploadService) { }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  upload(): void {
    this.uploadService.uploadFile(this.selectedFile).subscribe({
      next: (response) => console.log('Upload success', response),
      error: (error) => console.error('Upload failed', error)
    });
  }
}
