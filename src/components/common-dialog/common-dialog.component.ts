import { Component, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-common-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, FormsModule],
  templateUrl: './common-dialog.component.html',
  styleUrls: ['./common-dialog.component.css']
})
export class CommonDialogComponent {
  @Input() title: string = '';
  @Input() fields: Array<{ label: string; value: string; type?: string }> = [];

  constructor(
    public dialogRef: MatDialogRef<CommonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onOk(): void {
    this.dialogRef.close(this.data.fields);
  }
}
