import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import { Location, DatePipe } from '@angular/common';

import { RepositoryService } from './../../shared/repository.service';
import { Owner } from './../../_interface/owner.model';
import { ErrorHandlerService } from '../../shared/error-handler.service';
import { SuccessDialogComponent } from '../../shared/dialogs/success-dialog/success-dialog.component';
import * as $ from 'jquery';


@Component({
  selector: 'app-owner-update',
  templateUrl: './owner-update.component.html',
  styleUrls: ['./owner-update.component.css'],
  providers: [DatePipe]
})
export class OwnerUpdateComponent implements OnInit {
  public owner: Owner;
  public ownerForm: FormGroup;
  private dialogConfig;
  public errorMessage = '';
  public preSetDate: any;
  constructor(
    private location: Location,
    private repository: RepositoryService,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private datePipe: DatePipe,
    private dialog: MatDialog,
    private errorService: ErrorHandlerService
  ) { }

  ngOnInit() {
    this.ownerForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.maxLength(60)]),
      dateofBirth: new FormControl(new Date(), [Validators.required]),
      address: new FormControl('', [Validators.required, Validators.maxLength(100)])
    });

    this.dialogConfig = {
      height: '200px',
      width: '400px',
      disableClose: true,
      data: {}
    };

    this.getOwnerById();
  }

  private getOwnerById() {
    const ownerId: string = this.activeRoute.snapshot.params['id'];
    const ownerByidUrl = `api/owner/${ownerId}`;

    this.repository.getData(ownerByidUrl)
      .subscribe(res => {
        this.owner = res as Owner;
        this.ownerForm.patchValue(this.owner);
        $('#dateofBirth').val(this.datePipe.transform(this.owner.dateOfBirth, 'MM/dd/yyyy'));
        this.preSetDate = this.owner.dateOfBirth;
      },
        (error => {
          this.errorService.dialogConfig = { ...this.dialogConfig };
          this.errorService.handleError(error);
        })
      );
  }

  public onCancel = () => {
    this.location.back();
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.ownerForm.controls[controlName].hasError(errorName);
  }

  public updateOwner(ownerFormValue) {
    if (this.ownerForm.valid) {
      this.executeOwnerUpdate(ownerFormValue);
    }
  }

  private executeOwnerUpdate(ownerFormValue) {

    this.owner.name = ownerFormValue.name;
    this.owner.dateOfBirth = new Date(this.datePipe.transform(ownerFormValue.dateofBirth, 'MM/dd/yyyy 12:00:01'));
    this.owner.address =  ownerFormValue.address;
    const apiUrl = `api/owner/${this.owner.id}`;
    this.repository.update(apiUrl, this.owner)
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
