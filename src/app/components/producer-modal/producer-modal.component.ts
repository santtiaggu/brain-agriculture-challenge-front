import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProducersService } from '../../services/producers.service';

@Component({
  selector: 'app-producer-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
  ],
  templateUrl: './producer-modal.html',
  styleUrls: ['./producer-modal.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProducerModalComponent {
  @Input() isEditMode = false;
  @Input() initialData: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<any>();

  producerForm: FormGroup;

  constructor(private fb: FormBuilder, private producersService: ProducersService, private snackBar: MatSnackBar) {
    this.producerForm = this.fb.group({
      name: ['', Validators.required],
      document: ['', Validators.required],
      farms: this.fb.array([])
    });
  }

  ngOnInit(): void {
    if (this.initialData) {
      this.producerForm.patchValue({
        name: this.initialData.name,
        document: this.initialData.document
      });

      this.initialData.farms.forEach((farm: any) => {
        this.farms.push(this.createFarmGroup(farm));
      });
    }

    this.producerForm.get('document')?.valueChanges.subscribe((value: string) => {
      const formatted = this.formatCpfCnpj(value || '');
      if (value !== formatted) {
        this.producerForm.get('document')?.setValue(formatted, { emitEvent: false });
      }
    });
  }

  private formatCpfCnpj(value: string): string {
    const numeric = value.replace(/\D/g, '');

    if (numeric.length <= 11) {
      // CPF: 000.000.000-00
      return numeric
        .replace(/^(\d{3})(\d)/, '$1.$2')
        .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})\.(\d{3})(\d)/, '.$1.$2-$3')
        .slice(0, 14);
    } else {
      // CNPJ: 00.000.000/0000-00
      return numeric
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})\.(\d{3})(\d)/, '.$1.$2/$3')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .slice(0, 18);
    }
  }

  get farms(): FormArray {
    return this.producerForm.get('farms') as FormArray;
  }

  createFarmGroup(data?: any): FormGroup {
    return this.fb.group({
      id: [data?.id || null],
      name: [data?.name || '', Validators.required],
      city: [data?.city || '', Validators.required],
      state: [data?.state || '', Validators.required],
      total_area: [data?.total_area || 0, Validators.required],
      agricultural_area: [data?.agricultural_area || 0, Validators.required],
      vegetation_area: [data?.vegetation_area || 0, Validators.required],
      crops: this.fb.array(
        (data?.crops || []).map((crop: any) => this.createCropGroup(crop))
      )
    });
  }

  createCropGroup(data?: any): FormGroup {
    return this.fb.group({
      id: [data?.id || null],
      name: [data?.name || '', Validators.required],
      season: [data?.season || '', Validators.required],
    });
  }

  addFarm(): void {
    this.farms.push(this.createFarmGroup());
  }

  removeFarm(index: number): void {
    this.farms.removeAt(index);
  }

  getCrops(farmIndex: number): FormArray {
    return this.farms.at(farmIndex).get('crops') as FormArray;
  }

  addCrop(farmIndex: number): void {
    this.getCrops(farmIndex).push(this.createCropGroup());
  }

  removeCrop(farmIndex: number, cropIndex: number): void {
    this.getCrops(farmIndex).removeAt(cropIndex);
  }

  onSubmit(): void {
    if (!this.farms.length) {
      this.snackBar.open('É obrigatório adicionar pelo menos 1 fazenda.', 'Fechar', {
        duration: 3000,
      });
      return;
    }

    const hasEmptyCrop = this.farms.controls.some((control) => {
      const farmGroup = control as FormGroup;
      const crops = farmGroup.get('crops') as FormArray;
      return crops.length === 0;
    })

    if (hasEmptyCrop) {
      this.snackBar.open('Cada fazenda precisa ter pelo menos 1 cultura cadastrada.', 'Fechar', {
        duration: 3000,
      });
      return;
    }

    const invalidAreaFarm = this.farms.controls.find((control) => {
      const total = Number(control.get('total_area')?.value || 0);
      const agri = Number(control.get('agricultural_area')?.value || 0);
      const veg = Number(control.get('vegetation_area')?.value || 0);
      return agri + veg > total;
    });

    if (invalidAreaFarm) {
      this.snackBar.open(
        'A soma da Área Agrícola e Vegetação não pode ser maior que a Área Total.',
        'Fechar',
        { duration: 4000 }
      );
      return;
    } 

    if (this.producerForm.valid) {
      const payload = this.producerForm.value;
      
      const request = this.isEditMode
        ? this.producersService.update(this.initialData.id, payload)
        : this.producersService.create(payload);

      request.subscribe({
        next: (response) => {
          this.snackBar.open(
            this.isEditMode ? 'Produtor atualizado com sucesso!' : 'Produtor cadastrado com sucesso!',
            'Fechar',
            { duration: 3000 }
          );
          this.submit.emit(response);
          this.onClose();
        },
        error: (error) => {
          this.snackBar.open('Erro ao salvar produtor.', 'Fechar', {
            duration: 3000,
          });
          console.error('Erro ao salvar produtor:', error);
        }
      });
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
