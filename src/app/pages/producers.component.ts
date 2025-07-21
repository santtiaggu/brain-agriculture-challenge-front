import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ProducerModalComponent } from '../components/producer-modal/producer-modal.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-producers',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ProducerModalComponent, MatSnackBarModule],
  templateUrl: './producers.html',
  styleUrl: './producers.scss'
})
export class ProducersComponent implements OnInit {
  producers: any[] = [];
  selectedProducer: any = null;

  page: number = 1;
  pageSize: number = 10;

  showModal = false;
  isEditing = false;
  editingProducer: any = null;

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadProducers();
  }

  loadProducers(): void {
    this.http
      .post<any>('http://localhost:7001/api/producers/list', {
        page: this.page,
        size: this.pageSize,
      })
      .subscribe((res) => {
        this.producers = res.producers;
      });
  }

  selectProducer(id: number): void {
    this.http.get<any>(`http://localhost:7001/api/producers/${id}`).subscribe((res) => {
      this.selectedProducer = res;
    });
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadProducers();
    }
  }

  nextPage(): void {
    this.page++;
    this.loadProducers();
  }

  onNewProducer(): void {
    this.isEditing = false;
    this.editingProducer = null;
    this.showModal = true;
  }

  onEditProducer(): void {
    this.isEditing = true;
    this.editingProducer = this.selectedProducer;
    this.showModal = true;
  }

  onDeleteProducer(): void {
    if (!this.selectedProducer) return;

    const confirmDelete = confirm(`Deseja realmente excluir o produtor "${this.selectedProducer.name}"?`);

    if (confirmDelete) {
      const url = `http://localhost:7001/api/producers/${this.selectedProducer.id}`;
      
      this.http.delete(url).subscribe({
        next: () => {
          this.snackBar.open('Produtor excluído com sucesso!', 'Fechar', { duration: 3000 });

          // Após excluir, atualiza a listagem
          this.selectedProducer = null;
          this.loadProducers();
        },
        error: (err) => {
          console.error('Erro ao excluir produtor:', err);
          this.snackBar.open('Erro ao excluir produtor.', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  handleProducerSubmit(data: any): void {
    console.log(data)
    this.showModal = false;
    this.editingProducer = null;
    this.selectedProducer = null;
    this.loadProducers();
  }
}
