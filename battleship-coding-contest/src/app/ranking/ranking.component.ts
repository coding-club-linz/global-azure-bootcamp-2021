import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-ranking',
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.scss']
})
export class RankingComponent implements OnInit {
  isLoading = true;
  ranking: any[] = [];

  constructor(private http: HttpClient) { }

  async ngOnInit() {
    this.ranking = await this.http.get<any[]>(`${environment.apiEndpoint}/api/results`).toPromise();
    this.isLoading = false;
  }
}
