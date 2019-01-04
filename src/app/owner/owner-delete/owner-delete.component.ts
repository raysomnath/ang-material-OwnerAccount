import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { MatDialog, MatDialogRef } from '@angular/material';

import { ErrorHandlerService } from './../../shared/error-handler.service';
import { Owner } from './../../_interface/owner.model';
import { RepositoryService } from 'src/app/shared/repository.service';
import { ConfirmationDialogComponent } from './../../shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import { SuccessDialogComponent } from '../../shared/dialogs/success-dialog/success-dialog.component';

@Component({
  selector: 'app-owner-delete',
  templateUrl: './owner-delete.component.html',
  styleUrls: ['./owner-delete.component.css']
})
export class OwnerDeleteComponent implements OnInit {

  public owner: Owner;
  dialogRef: MatDialogRef<ConfirmationDialogComponent>;
  private dialogConfig;

  constructor(
    private repository: RepositoryService,
    private activeRoute: ActivatedRoute,
    private location: Location,
    public dialog: MatDialog,
    private errorService: ErrorHandlerService) { }

  ngOnInit() {

    this.dialogConfig = {
      height: '200px',
      width: '400px',
      disableClose: true,
      data: {}
    };

    this.getOwnerById();
  }

  public onCancel = () => {
    this.location.back();
  }


  private getOwnerById = () => {
    const id: string = this.activeRoute.snapshot.params['id'];
    const apiUrl = `api/owner/${id}/account`;

    this.repository.getData(apiUrl)
      .subscribe(res => {
        this.owner = res as Owner;
      },
        (error => {
          this.errorService.dialogConfig = { ...this.dialogConfig };
          this.errorService.handleError(error);
        })
      );
  }

  public deleteOwner() {
    // this.executeOwnerDelete(this.owner.id);
    this.dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });
    this.dialogRef.componentInstance.confirmMessage = `Are you sure want to delete owner : ${this.owner.name} ?`;
    this.dialogRef.afterClosed()
      .subscribe(res => {
        if (res) {
          this.executeOwnerDelete(this.owner.id);
        }
        this.dialogRef = null;
      });
  }

  private executeOwnerDelete(id: string) {
    // alert(id);
    const deleteUrl = `api/owner/${id}`;
    this.repository.delete(deleteUrl)
      .subscribe(res => {
        const dialogRef = this.dialog.open(SuccessDialogComponent, this.dialogConfig);

        // we are subscribing on the [mat-dialog-close] attribute as soon as we click on the dialog button
        dialogRef.afterClosed()
          .subscribe(result => {
            this.location.back();
          });
      },
        (error => {
          this.errorService.dialogConfig = { ...this.dialogConfig };
          this.errorService.handleError(error);
        })
      );
  }

}
