import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Player } from '../shared/player';

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
    await this.refresh();
  }

  async refresh() {
    this.isLoading = true;
    this.ranking = await this.http.get<any[]>(`${environment.apiEndpoint}/api/results`).toPromise();
    this.isLoading = false;
  }

  expand(event: MouseEvent, player: Player) {
    if ((<any>event.target).localName !== 'a') {
      player.expanded = !player.expanded;
    }
  }
}
