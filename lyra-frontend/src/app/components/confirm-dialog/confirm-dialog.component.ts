import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export type ConfirmDialogData = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
};

@Component({
  selector: 'app-confirm-dialog',
  standalone: false,
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css'
})
export class ConfirmDialogComponent {
  constructor(
    private readonly dialogRef: MatDialogRef<ConfirmDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public readonly data: ConfirmDialogData
  ) {}

  cancelar(): void {
    this.dialogRef.close(false);
  }

  confirmar(): void {
    this.dialogRef.close(true);
  }
}
