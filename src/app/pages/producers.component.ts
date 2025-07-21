import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ProducerModalComponent } from '../components/producer-modal/producer-modal.component';

@Component({
  selector: 'app-producers',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ProducerModalComponent],
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

  constructor(private http: HttpClient) {}

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
    //
  }

  handleProducerSubmit(data: any): void {
    console.log(data)
    this.showModal = false;
    this.loadProducers();
  }
}
