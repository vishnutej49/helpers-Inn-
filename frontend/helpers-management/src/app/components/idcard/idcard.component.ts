import { JsonPipe } from '@angular/common';
import { Component, Inject, ElementRef, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { QRCodeModule } from 'angularx-qrcode';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-idcard',
  standalone: true,
  imports: [QRCodeModule, JsonPipe],
  templateUrl: './idcard.component.html',
  styleUrl: './idcard.component.scss'
})
export class IdcardComponent {
  @ViewChild('dialogContent', { static: false }) dialogContentRef!: ElementRef;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  downloadDialog() {
    html2canvas(this.dialogContentRef.nativeElement).then(canvas => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `${this.data.fullName || 'helper'}-details.png`;
      link.click();
    });
  }

  getImageURL(fullName: string): string{
    return `https://ui-avatars.com/api/?name=${fullName}&background=random&color=fff&rounded=true&length=2`
  }
}
